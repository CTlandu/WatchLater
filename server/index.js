const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
require('./initDB');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
/**
 * Helmet
helmet() 是一个安全中间件，它通过设置各种 HTTP 头来帮助保护你的 Express 应用。它：
设置 X-Content-Type-Options 来防止 MIME 类型嗅探
设置 X-Frame-Options 来防止点击劫持
设置 X-XSS-Protection 来启用跨站脚本(XSS)过滤
删除 X-Powered-By 头以隐藏 Express
设置 Content-Security-Policy 头以防止各种攻击
还有其他多项安全相关的头部设置
 */
app.use(helmet());
/**Morgan
morgan('dev') 是一个 HTTP 请求日志记录中间件。它在控制台打印出关于每个 HTTP 请求的信息：
请求方法 (GET, POST 等)
URL
HTTP 状态码
响应时间
响应大小 */
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
