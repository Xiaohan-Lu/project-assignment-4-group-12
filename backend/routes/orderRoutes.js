const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');

// 获取所有订单（管理员）- 移到最前面
router.get('/all', protect, async (req, res) => {
  try {
    console.log('Admin check:', req.user.role); // 添加调试日志
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find()
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    console.log('Orders found:', orders.length); // 添加调试日志
    res.json(orders);
  } catch (error) {
    console.error('Error in /all route:', error); // 添加错误日志
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// 创建订单
router.post('/', protect, async (req, res) => {
  try {
    // 1. 打印完整的请求数据
    console.log('Request user:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { items, shippingAddress, paymentMethod } = req.body;

    // 2. 验证数据
    if (!items || !Array.isArray(items)) {
      console.log('Invalid items data:', items);
      return res.status(400).json({ message: 'Invalid items data' });
    }

    // 3. 检查每个商品
    let totalAmount = 0;
    for (let item of items) {
      console.log('Processing item:', item);
      
      if (!item.productId) {
        console.log('Missing productId for item:', item);
        return res.status(400).json({ message: 'Missing productId for item' });
      }

      const product = await Product.findById(item.productId);
      console.log('Found product:', product);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}` 
        });
      }

      totalAmount += product.price * item.quantity;
    }

    // 4. 创建订单对象
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;

    const orderData = {
      orderNumber,
      userId: req.user._id,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    // 5. 保存订单
    const order = new Order(orderData);
    await order.save();

    // 6. 更新库存
    for (let item of items) {
      const result = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      console.log('Updated product stock:', result);
    }

    console.log('Order created successfully:', order._id);
    res.status(201).json(order);

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取用户的所有订单
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// 获取单个订单详情
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// 更新订单状态
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 允许管理员或订单所有者更新状态
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    // 返回更新后的订单
    const updatedOrder = await Order.findById(order._id)
      .populate('items.productId')
      .populate('userId', 'email');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Error updating order status',
      error: error.message 
    });
  }
});

// 删除订单
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 检查是否是订单所有者
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 检查订单状态
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      return res.status(400).json({ 
        message: 'Only pending or cancelled orders can be deleted' 
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
});

module.exports = router; 