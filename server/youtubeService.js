const { google } = require('googleapis');
require('dotenv').config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

async function getChannelId(username) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: username,
      type: 'channel',
      maxResults: 1
    });

    if (response.data.items.length === 0) {
      return null;
    }

    return response.data.items[0].snippet.channelId;
  } catch (error) {
    console.error('Error getting channel ID:', error);
    return null;
  }
}

async function getChannelInfo(channelId) {
  try {
    const channelResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      id: channelId
    });

    if (channelResponse.data.items.length === 0) {
      return null;
    }

    const channel = channelResponse.data.items[0];
    const { snippet, statistics } = channel;

    const videosResponse = await youtube.search.list({
      part: 'snippet',
      channelId: channelId,
      type: 'video',
      order: 'date',
      maxResults: 1
    });

    const latestVideo = videosResponse.data.items[0];

    return {
      title: snippet.title,
      avatar: snippet.thumbnails.default.url,
      subscribers: statistics.subscriberCount,
      videoCount: statistics.videoCount,
      latestVideo: latestVideo ? {
        title: latestVideo.snippet.title,
        url: `https://www.youtube.com/watch?v=${latestVideo.id.videoId}`
      } : null
    };
  } catch (error) {
    console.error('Error getting channel info:', error);
    return null;
  }
}

module.exports = { getChannelId, getChannelInfo };