const express = require('express');
const router = express.Router();
const { Following } = require('./initDB');
const { getChannelsDetailsByIds, cache } = require('./youtubeService');
const { scrapeInstagramProfile } = require('./instagramScraper');

// 新增 Instagram 路由
router.get('/instagram/:username', async (req, res) => {
  try {
    const username = req.params.username;
    console.log('获取Instagram用户数据:', username);
    const profileData = await scrapeInstagramProfile(username);
    res.json(profileData);
  } catch (error) {
    console.error('获取Instagram数据时出错:', error);
    res.status(500).json({ error: '获取Instagram数据失败', details: error.message });
  }
});

// 调试缓存
router.get('/debug/cache', (req, res) => {
  const cacheKeys = cache.keys();
  const cacheContent = {};
  for (const key of cacheKeys) {
    cacheContent[key] = cache.get(key);
  }
  res.json({
    stats: cache.getStats(),
    content: cacheContent,
  });
});

// 获取YouTube信息
router.get('/youtube-info', async (req, res) => {
  console.log('Received request for YouTube info');
  console.log('Query parameters:', req.query);

  const { channelIds } = req.query;

  if (!channelIds) {
    console.log('No channelIds provided');
    return res.status(400).json({ error: '需要提供 channelIds 参数' });
  }

  const channelIdArray = channelIds.split(',').filter((id) => id.trim().length > 0);
  console.log('Channel IDs:', channelIdArray);

  if (channelIdArray.length === 0) {
    return res.status(400).json({ error: '提供的 channelIds 无效' });
  }

  try {
    const channelsInfo = await getChannelsDetailsByIds(channelIdArray);
    console.log('Channel info retrieved successfully');
    res.json(channelsInfo);
  } catch (error) {
    console.error('获取YouTube信息时出错:', error);
    res.status(500).json({ error: '获取频道信息失败', details: error.message });
  }
});

// 获取所有关注
router.get('/following', async (req, res) => {
  try {
    const followings = await Following.find();
    res.json(followings);
  } catch (error) {
    console.error('Error in /following route:', error);
    res.status(500).json({ error: '获取关注列表失败' });
  }
});

// 创建新的Following记录
router.post('/following', async (req, res) => {
  try {
    const { platform, channelId } = req.body;
    const newFollowing = new Following({ platform, channelId });
    await newFollowing.save();
    res.status(201).json(newFollowing);
  } catch (error) {
    console.error('Error creating new following:', error);
    res.status(400).json({ message: error.message });
  }
});

// 获取特定的Following记录
router.get('/following/:id', async (req, res) => {
  try {
    const following = await Following.findById(req.params.id);
    if (!following) return res.status(404).json({ message: '未找到记录' });
    res.json(following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新Following记录
router.put('/following/:id', async (req, res) => {
  try {
    const { platform, channelId } = req.body;
    const updatedFollowing = await Following.findByIdAndUpdate(
      req.params.id,
      { platform, channelId },
      { new: true }
    );
    if (!updatedFollowing) return res.status(404).json({ message: '未找到记录' });
    res.json(updatedFollowing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除Following记录
router.delete('/following/:id', async (req, res) => {
  try {
    const deletedFollowing = await Following.findByIdAndDelete(req.params.id);
    if (!deletedFollowing) return res.status(404).json({ message: '未找到记录' });
    res.json({ message: '记录已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
