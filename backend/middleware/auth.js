const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.protect = async (req, res, next) => {
  try {
    // Get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists and explicitly select fields including addresses
    const user = await User.findById(decoded.id)
      .select('_id username email role addresses'); // Explicitly select addresses field
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Ensure addresses exists
    if (!user.addresses) {
      user.addresses = [];
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error); // Add error logging
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Role authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'User role is not authorized to access this route' 
      });
    }
    next();
  };
};