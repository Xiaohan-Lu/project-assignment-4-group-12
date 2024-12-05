const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const { getReviews } = require('../services/reviewService');

router.get('/', async (req, res) => {
  try {
    console.log('Fetching products - start');
    
    // 1. 检查连接状态
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // 2. 检查数据库名称
    console.log('Database name:', mongoose.connection.name);
    
    // 3. 列出所有集合
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // 4. 直接使用collection查询
    const rawProducts = await mongoose.connection.db
      .collection('products')
      .find({})
      .toArray();
    console.log('Raw products found:', rawProducts.length);
    
    // 5. 使用Model查询
    const products = await Product.find().lean();
    console.log('Model products found:', products.length);
    
    res.status(200).json(rawProducts);
    
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// 2. 获取单个产品
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// 3. 添加新产品
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const product = new Product({
      ...req.body,
      imageUrl
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. 更新产品
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 更新文本字段
    const updates = { ...req.body };
    
    // 如果有新图片，更新图片URL
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    console.log('Updates to apply:', updates);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updates,
      { new: true, runValidators: true }
    );

    console.log('Updated product:', updatedProduct);
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ 
      message: 'Error updating product',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 5. 删除产品
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// 添加更新库存的路由
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 检查库存是否足够
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${product.stock} items available.` 
      });
    }

    // 更新库存
    product.stock -= quantity;
    await product.save();

    res.json({ 
      message: 'Stock updated successfully',
      currentStock: product.stock 
    });
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// 添加批量检查库存的路由
router.post('/check-stock', async (req, res) => {
  try {
    const { items } = req.body;
    const stockStatus = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        stockStatus.push({
          productId: item.productId,
          available: false,
          message: 'Product not found'
        });
        continue;
      }

      stockStatus.push({
        productId: item.productId,
        available: product.stock >= item.quantity,
        currentStock: product.stock,
        requestedQuantity: item.quantity
      });
    }

    res.json({ stockStatus });
  } catch (err) {
    console.error('Error checking stock:', err);
    res.status(500).json({ message: 'Error checking stock' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const reviews = await getReviews(product.asin);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      message: 'Fail to get review',
      error: error.message 
    });
  }
});

module.exports = router;
