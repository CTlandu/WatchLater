const { google } = require('googleapis');
const { YouTubeUser } = require('./initDB');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

async function getChannelsDetailsByIds(channelIds) {
  console.log('Fetching details for channel IDs:', channelIds);
  const results = {};
  const channelsToFetch = [];

  // 首先检查数据库中的现有数据
  for (const channelId of channelIds) {
    const existingChannel = await YouTubeUser.findOne({ channel_index_id: channelId });
    if (existingChannel && new Date() - existingChannel.last_update_time < 24 * 60 * 60 * 1000) {
      results[channelId] = existingChannel.toObject();
    } else {
      channelsToFetch.push(channelId);
    }
  }

  console.log('需要去用youtube api获取的channelId', channelsToFetch);
  if (channelsToFetch.length > 0) {
    try {
      // 批量获取频道信息
      const channelsResponse = await youtube.channels.list({
        part: 'snippet,statistics',
        id: channelsToFetch.join(','),
        fields:
          'items(id,snippet(title,customUrl,thumbnails/default),statistics(subscriberCount,videoCount))',
      });

      // 获取所有需要更新的频道的最新视频 ID
      const videoIds = [];
      for (const channel of channelsResponse.data.items) {
        const searchResponse = await youtube.search.list({
          part: 'id',
          channelId: channel.id,
          order: 'date',
          type: 'video',
          maxResults: 30,
        });
        videoIds.push(...searchResponse.data.items.map((item) => item.id.videoId));
      }

      // 批量获取视频详细信息
      const videosResponse = await youtube.videos.list({
        part: 'snippet',
        id: videoIds.join(','),
      });

      // 处理获取到的数据
      for (const channel of channelsResponse.data.items) {
        const channelVideos = videosResponse.data.items.filter(
          (video) => video.snippet.channelId === channel.id
        );
        const videos = channelVideos.map((video) => ({
          video_id: video.id,
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
    } catch (error) {
      console.error('Error in getChannelsDetailsByIds:', error);
      throw error;
    }
  }

  return results;
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
