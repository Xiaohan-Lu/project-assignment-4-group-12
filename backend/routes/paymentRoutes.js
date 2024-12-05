const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../services/emailService');

// 创建支付意向
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 检查订单是否属于当前用户
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 检查订单是否已支付
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is not pending' });
    }

    // 模拟支付意向创建
    const paymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      amount: order.totalAmount,
      currency: 'usd',
      status: 'requires_payment'
    };

    res.json({
      clientSecret: `${paymentIntent.id}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentIntent.amount
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});

// 确认支付
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    const order = await Order.findById(orderId)
      .populate('items.productId');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 检查订单是否属于当前用户
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 模拟支付处理
    // 在实际应用中，这里会与真实支付网关交互
    const paymentSuccessful = Math.random() > 0.1; // 90% 的概率支付成功

    if (paymentSuccessful) {
      order.status = 'paid';
      order.paymentMethod = paymentMethod;
      await order.save();

      // 发送订单确认邮件
      await sendOrderConfirmation(order);

      res.json({ 
        success: true, 
        message: 'Payment successful',
        order: order
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment failed. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// 获取支付状态
router.get('/payment-status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 检查订单是否属于当前用户
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      status: order.status,
      paid: order.status === 'paid'
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

module.exports = router; 