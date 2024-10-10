const express = require('express');
const router = express.Router();
const { User, YouTubeUser } = require('./initDB');
const { getChannelsDetailsByIds, getChannelIdFromUsername } = require('./youtubeService');

// 用户登录（简化版）
router.post('/login', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ user_email: email });
    if (!user) {
      user = new User({
        user_id: Date.now().toString(),
        user_email: email,
        user_password: 'default_password', // 在实际应用中应使用加密密码
        user_following: [],
      });
      await user.save();
    }
    res.json({ userId: user.user_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户的关注列表
router.get('/following/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user.user_following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加新的关注
router.post('/following/:userId', async (req, res) => {
  console.log('Received request to add following:', req.params, req.body);
  try {
    const { platform, channelId } = req.body;
    const user = await User.findOne({ user_id: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    let channelIndexId;
    try {
      channelIndexId = await getChannelIdFromUsername(channelId);
    } catch (error) {
      console.error('Error getting channel ID:', error);
      return res.status(404).json({ message: '无法找到该YouTube频道' });
    }

    const channelDetails = await getChannelsDetailsByIds([channelIndexId]);
    if (!channelDetails[channelIndexId]) {
      return res.status(404).json({ message: '无法获取YouTube频道详情' });
    }

    let youtubeUser = await YouTubeUser.findOneAndUpdate(
      { channel_index_id: channelIndexId },
      {
        ...channelDetails[channelIndexId],
        channel_username: channelId,
      },
      { upsert: true, new: true }
    );

    user.user_following.push({
      platform,
      channel_username: youtubeUser.channel_username,
      channel_index_id: youtubeUser.channel_index_id,
      channel_title: youtubeUser.channel_title,
    });
    await user.save();
    res.status(201).json(user.user_following);
  } catch (error) {
    console.error('Error adding following:', error);
    res.status(400).json({ message: error.message });
  }
});
// 删除关注
router.delete('/following/:userId/:followingId', async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    user.user_following = user.user_following.filter(
      (f) => f._id.toString() !== req.params.followingId
    );
    await user.save();
    res.json({ message: '关注已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取YouTube信息
router.get('/youtube-info', async (req, res) => {
  const { channelIds } = req.query;
  if (!channelIds) {
    return res.status(400).json({ error: '需要提供 channelIds 参数' });
  }

  const channelIdArray = channelIds.split(',').filter((id) => id.trim().length > 0);
  if (channelIdArray.length === 0) {
    return res.status(400).json({ error: '提供的 channelIds 无效' });
  }

  try {
    const channelsInfo = await getChannelsDetailsByIds(channelIdArray);
    res.json(channelsInfo);
  } catch (error) {
    console.error('获取YouTube信息时出错:', error);
    res.status(500).json({ error: '获取频道信息失败', details: error.message });
  }
});

module.exports = router;
