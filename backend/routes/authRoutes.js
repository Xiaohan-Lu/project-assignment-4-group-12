const express = require('express');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password
    });

    // 生成token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 生成token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      addresses: user.addresses || [],
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
});

// 获取当前用户信息（需要认证）
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      addresses: user.addresses || []
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user data', 
      error: error.message 
    });
  }
});

// 更新用户信息（需要认证）
router.put('/update', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 更新基本信息
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    
    // 明确处理地址更新
    if (req.body.addresses) {
      // 确保地址是一个数组
      user.addresses = Array.isArray(req.body.addresses) ? req.body.addresses : [];
      
      // 确保只有一个默认地址
      const defaultAddresses = user.addresses.filter(addr => addr.isDefault);
      if (defaultAddresses.length > 1) {
        user.addresses = user.addresses.map((addr, index) => ({
          ...addr,
          isDefault: index === 0
        }));
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      addresses: updatedUser.addresses || []
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
});

// 添加地址（需要认证）
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.addresses.push(req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding address', 
      error: error.message 
    });
  }
});

// 添加这个路由来创建管理员账户
router.post('/register-admin', async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // 验证管理员注册码
    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(403).json({ message: 'Invalid admin registration code' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'admin'  // 直接设置为管理员角色
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user' });
  }
});

module.exports = router; 