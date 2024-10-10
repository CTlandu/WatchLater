const mongoose = require('mongoose');

const youtubeUserSchema = new mongoose.Schema({
  channel_username: { type: String, required: true, unique: true },
  channel_index_id: { type: String, required: true, unique: true },
  channel_title: { type: String, required: true },
  avatar: { type: String },
  subscribers: { type: Number },
  video_count: { type: Number },
  last_update_time: { type: Date, default: Date.now },
  recent_videos: [
    {
      video_id: String,
      video_title: String,
      video_thumbnail: String,
      published_at: Date,
    },
  ],
});

const YouTubeUser = mongoose.model('YouTubeUser', youtubeUserSchema);

module.exports = YouTubeUser;
