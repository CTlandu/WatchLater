const mongoose = require('mongoose');

// 连接到MongoDB数据库
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

// 定义Following schema
const followingSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['Bilibili', 'YouTube', 'Tiktok', 'Reels'],
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建Following模型
const Following = mongoose.model('Following', followingSchema);

// 初始化数据库
const initDB = async () => {
  await connectDB();

  // 这里可以添加一些初始数据
  // 例如:
  // await Following.create({
  //   platform: 'Bilibili',
  //   username: 'example_user'
  // });

  console.log('数据库初始化完成');
};

// 运行初始化函数
initDB().catch(console.error);

module.exports = { Following };