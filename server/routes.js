const express = require('express');
const router = express.Router();
const { Following } = require('./initDB');
const { getChannelId, getChannelInfo } = require('./youtubeService');


// 获取YouTube频道信息
router.get('/api/youtube-info', async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const channelId = await getChannelId(username);
  if (!channelId) {
    return res.status(404).json({ error: "Channel not found" });
  }

  const channelInfo = await getChannelInfo(channelId);
  if (!channelInfo) {
    return res.status(500).json({ error: "Failed to fetch channel info" });
  }

  res.json(channelInfo);
});


// 创建新的Following记录
router.post('/api/following', async (req, res) => {
  try {
    const { platform, username } = req.body;
    const newFollowing = new Following({ platform, username });
    const savedFollowing = await newFollowing.save();
    res.status(201).json(savedFollowing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取所有Following记录
router.get('/api/following', async (req, res) => {
  try {
    const followings = await Following.find();
    console.log('后端查询结果:', followings); // 添加这行来调试
    res.json(followings);
  } catch (error) {
    console.error('后端错误:', error); // 添加这行来调试
    res.status(500).json({ message: error.message });
  }
});

// 获取特定的Following记录
router.get('/api/following/:id', async (req, res) => {
  try {
    const following = await Following.findById(req.params.id);
    if (!following) return res.status(404).json({ message: '未找到记录' });
    res.json(following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新Following记录
router.put('/api/following/:id', async (req, res) => {
  try {
    const { platform, username } = req.body;
    const updatedFollowing = await Following.findByIdAndUpdate(
      req.params.id,
      { platform, username },
      { new: true }
    );
    if (!updatedFollowing) return res.status(404).json({ message: '未找到记录' });
    res.json(updatedFollowing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除Following记录
router.delete('/api/following/:id', async (req, res) => {
  try {
    const deletedFollowing = await Following.findByIdAndDelete(req.params.id);
    if (!deletedFollowing) return res.status(404).json({ message: '未找到记录' });
    res.json({ message: '记录已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;