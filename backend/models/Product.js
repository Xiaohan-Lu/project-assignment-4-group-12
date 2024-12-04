const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  imageUrl: { type: String },
  asin: {
    type: String,
    default: 'B0BX7FD8H7'
  }
});

module.exports = mongoose.model('Product', productSchema);
