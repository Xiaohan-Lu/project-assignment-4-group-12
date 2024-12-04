const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    
    // 检查管理员是否已存在
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // 创建管理员用户
    const adminUser = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });

    console.log('Admin user created successfully:', {
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser(); 