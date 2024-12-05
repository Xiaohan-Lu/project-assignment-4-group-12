require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const multer = require('multer');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

console.log('Environment Check:', {
  PORT: process.env.PORT || 5000,
  EMAIL_USER: process.env.EMAIL_USER,
  HAS_EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
});

const app = express();

// 中间件
app.use(cors());
app.use(express.json());


// 确保上传目录存在
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

// 连接 MongoDB 数据库
mongoose.connect('mongodb+srv://xlu469:Password@cluster0.vkvdq.mongodb.net/online_store?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})



.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// 挂载路由
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    // Multer 错误处理
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 根路径
app.get('/', (req, res) => {
  res.send('Welcome to the Online Store API!');
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Email configuration loaded:', {
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASSWORD
  });
});
