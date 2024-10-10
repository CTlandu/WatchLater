const mongoose = require('mongoose');
const User = require('./db_models/userModel');
const YouTubeUser = require('./db_models/youtubeUserModel');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    process.exit(1);
  }
};

const initDB = async () => {
  await connectDB();
  console.log('数据库初始化完成');
};

module.exports = { User, YouTubeUser, connectDB, initDB };
