const { google } = require('googleapis');
const NodeCache = require('node-cache');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const cache = new NodeCache({ stdTTL: 3600 }); // 缓存1小时

async function getChannelsDetailsByIds(channelIds) {
  console.log('Fetching details for channel IDs:', channelIds);
  const results = {};
  const uncachedIds = [];
  const idMapping = {};

  // 检查缓存并创建 ID 映射
  for (const id of channelIds) {
    const cacheKey = `channel_${id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Using cached data for:', id);
      results[id] = cachedData;
    } else {
      uncachedIds.push(id);
    }
    idMapping[id] = id; // 初始映射，可能后面会更新
  }

  if (uncachedIds.length === 0) {
    return results;
  }

  try {
    console.log('Fetching data for uncached IDs:', uncachedIds);

    // 获取频道ID（如果传入的是用户名）
    const validChannelIds = await Promise.all(
      uncachedIds.map(async (id) => {
        if (id.startsWith('UC')) {
          return id;
        } else {
          try {
            const channelId = await getChannelIdFromUsername(id);
            idMapping[channelId] = id; // 更新映射
            return channelId;
          } catch (error) {
            console.error(`Error getting channel ID for ${id}:`, error);
            return null;
          }
        }
      })
    );

    const filteredChannelIds = validChannelIds.filter((id) => id !== null);

    if (filteredChannelIds.length === 0) {
      throw new Error('No valid channel IDs found');
    }

    // 批量获取频道信息
    const channelsResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      id: filteredChannelIds.join(','),
      fields: 'items(id,snippet(title,thumbnails/default),statistics(subscriberCount,videoCount))',
    });

    // 获取24小时前的时间戳
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 批量获取最近视频
    const videosResponse = await youtube.search.list({
      part: 'snippet',
      channelId: filteredChannelIds.join(','),
      order: 'date',
      type: 'video',
      publishedAfter: oneDayAgo,
      maxResults: 3, // 增加获取的视频数量，以确保我们能获取到所有24小时内的视频
      fields: 'items(id(videoId),snippet(title,thumbnails/medium,publishedAt,channelId))',
    });

    // 处理结果
    for (const channel of channelsResponse.data.items) {
      const videos = videosResponse.data.items
        .filter((video) => video.snippet.channelId === channel.id)
        .map((video) => ({
          id: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.medium.url,
          publishedAt: video.snippet.publishedAt,
        }));

      const result = {
        id: channel.id,
        title: channel.snippet.title,
        avatar: channel.snippet.thumbnails.default.url,
        subscribers: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        recentVideos: videos, // 这里只包含24小时内的视频
      };

      const originalId = idMapping[channel.id];
      results[originalId] = result;
      cache.set(`channel_${originalId}`, result);
    }

    return results;
  } catch (error) {
    console.error('Error in getChannelsDetailsByIds:', error);
    throw error;
  }
}

async function getChannelIdFromUsername(username) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      type: 'channel',
      q: username,
      maxResults: 1,
    });

    if (response.data.items.length > 0) {
      return response.data.items[0].id.channelId;
    } else {
      throw new Error(`Channel not found for username: ${username}`);
    }
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    throw error;
  }
}

module.exports = { getChannelsDetailsByIds, getChannelIdFromUsername, cache };
