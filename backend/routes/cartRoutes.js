const express = require('express');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const router = express.Router();

// 所有购物车路由都需要用户认证
router.use(protect);

// 获取用户购物车
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
                        .populate('items.productId');
    
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: []
      });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// 添加商品到购物车
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [{ productId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(
        item => item.productId.toString() === productId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      
      await cart.save();
    }
    
    await cart.populate('items.productId');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// 更新购物车商品数量
router.put('/update/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.find(
      item => item.productId.toString() === req.params.productId
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// 从购物车移除商品
router.delete('/remove/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.productId.toString() !== req.params.productId
    );
    
    await cart.save();
    await cart.populate('items.productId');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// 添加清空购物车的路由
router.delete('/', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { new: true }
    );
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

module.exports = router;