const { google } = require('googleapis');
const NodeCache = require('node-cache');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

const cache = new NodeCache({ stdTTL: 3600 }); // 缓存1小时

async function getChannelDetailsByNickname(nickname) {
  const cacheKey = `channel_${nickname}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log('使用缓存数据:', nickname);
    return cachedData;
  }

  console.log('从 API 获取数据:', nickname);
  
  try {
    // 搜索频道 (100 配额)
    const searchResponse = await youtube.search.list({
      part: 'snippet',
      q: nickname,
      type: 'channel',
      maxResults: 1,
      fields: 'items(id(channelId),snippet(title,thumbnails/default))'
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      throw new Error('频道未找到');
    }

    const channelId = searchResponse.data.items[0].id.channelId;
    const channelTitle = searchResponse.data.items[0].snippet.title;
    const channelThumbnail = searchResponse.data.items[0].snippet.thumbnails.default.url;

    // 获取频道统计信息 (1 配额)
    const statisticsResponse = await youtube.channels.list({
      part: 'statistics',
      id: channelId,
      fields: 'items(statistics(subscriberCount,videoCount))'
    });

    if (!statisticsResponse.data.items || statisticsResponse.data.items.length === 0) {
      throw new Error('无法获取频道统计信息');
    }

    const { subscriberCount, videoCount } = statisticsResponse.data.items[0].statistics;

    // 获取最近视频 (100 配额)
    const videosResponse = await youtube.search.list({
      part: 'snippet',
      channelId: channelId,
      order: 'date',
      type: 'video',
      maxResults: 5,
      fields: 'items(id(videoId),snippet(title,thumbnails/medium,publishedAt))'
    });

    const recentVideos = videosResponse.data.items.map(video => ({
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url,
      publishedAt: video.snippet.publishedAt
    }));

    const result = {
      title: channelTitle,
      avatar: channelThumbnail,
      subscribers: subscriberCount,
      videoCount: videoCount,
      recentVideos
    };

    // 将结果存入缓存
    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error('获取频道信息时出错:', error);
    throw error;
  }
}

module.exports = { getChannelDetailsByNickname };