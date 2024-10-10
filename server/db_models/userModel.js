const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  user_email: { type: String, required: true, unique: true },
  user_password: { type: String, required: true },
  user_following: [
    {
      platform: String,
      channel_index_id: String,
      channel_username: String,
      channel_title: String,
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
