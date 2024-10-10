const { google } = require('googleapis');
const { YouTubeUser } = require('./initDB');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

async function getChannelsDetailsByIds(channelIds) {
  console.log('Fetching details for channel IDs:', channelIds);
  const results = {};

  try {
    // 批量获取频道信息
    const channelsResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      id: channelIds.join(','),
      fields:
        'items(id,snippet(title,customUrl,thumbnails/default),statistics(subscriberCount,videoCount))',
    });

    // 对每个频道单独获取最新视频信息
    for (const channel of channelsResponse.data.items) {
      const videosResponse = await youtube.search.list({
        part: 'snippet',
        channelId: channel.id,
        order: 'date',
        type: 'video',
        maxResults: 30,
      });

      const videos = videosResponse.data.items.map((video) => ({
        video_id: video.id.videoId,
        video_title: video.snippet.title,
        video_thumbnail: video.snippet.thumbnails.medium.url,
        published_at: video.snippet.publishedAt,
      }));

      const result = {
        channel_index_id: channel.id,
        channel_username: channel.snippet.customUrl || channel.id,
        channel_title: channel.snippet.title,
        avatar: channel.snippet.thumbnails.default.url,
        subscribers: parseInt(channel.statistics.subscriberCount),
        video_count: parseInt(channel.statistics.videoCount),
        last_update_time: new Date(),
        recent_videos: videos,
      };

      // 更新或创建数据库记录
      await YouTubeUser.findOneAndUpdate({ channel_index_id: result.channel_index_id }, result, {
        upsert: true,
        new: true,
      });

      results[channel.id] = result;
    }

    return results;
  } catch (error) {
    console.error('Error in getChannelsDetailsByIds:', error);
    throw error;
  }
}

async function getChannelIdFromUsername(input) {
  // 如果输入已经是一个有效的频道 ID，直接返回
  if (input.startsWith('UC') && input.length === 24) {
    return input;
  }

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      type: 'channel',
      q: input,
      maxResults: 1,
    });

    if (response.data.items.length > 0) {
      return response.data.items[0].id.channelId;
    } else {
      throw new Error(`Channel not found for input: ${input}`);
    }
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    throw error;
  }
}

module.exports = { getChannelsDetailsByIds, getChannelIdFromUsername };
