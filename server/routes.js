const express = require('express');
const router = express.Router();
const { Following } = require('./initDB');
const { getChannelDetailsByNickname } = require('./youtubeService');

router.get('/api/youtube-info', async (req, res) => {
  const { nickname } = req.query;

  if (!nickname) {
    return res.status(400).json({ error: "需要提供 nickname 参数" });
  }

  try {
    const channelInfo = await getChannelDetailsByNickname(nickname);
    res.json(channelInfo);
  } catch (error) {
    console.error('获取YouTube信息时出错:', error);
    if (error.message === '频道未找到' || error.message === '无法获取频道详情') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "获取频道信息失败", details: error.message });
  }
});

module.exports = router;


// 创建新的Following记录
// 获取所有关注
router.get('/api/following', async (req, res) => {
  try {
    const followings = await Following.find();
    res.json(followings);
  } catch (error) {
    console.error('Error in /following route:', error);
    res.status(500).json({ error: '获取关注列表失败' });
  }
});

// 创建新的Following记录
router.post('/api/following', async (req, res) => {
  try {
    const { platform, username } = req.body;
    const newFollowing = new Following({ platform, username });
    await newFollowing.save();
    res.status(201).json(newFollowing);
  } catch (error) {
    console.error('Error creating new following:', error);
    res.status(400).json({ message: error.message });
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