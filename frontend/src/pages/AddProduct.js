import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../api/productApi';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Add text fields to FormData
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Add image to FormData if exists
      if (image) {
        data.append('image', image);
      }

      // Send request
      await addProduct(data);
      alert('Product added successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error adding product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add product';
      alert(`Failed to add product: ${errorMessage}`);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Price:</label>
          <input 
            type="number" 
            name="price" 
            value={formData.price} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <input 
            type="text" 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Stock:</label>
          <input 
            type="number" 
            name="stock" 
            value={formData.stock} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Product Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="file-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn">Add Product</button>
      </form>

      <style jsx>{`
        .add-product-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }

        .product-form {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h1 {
          margin-bottom: 30px;
          color: var(--text-color);
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-color);
          font-weight: 500;
        }

        input[type="text"],
        input[type="number"],
        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--gray-medium);
          border-radius: 8px;
          font-size: 14px;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .file-input {
          border: none;
          padding: 0;
        }

        .image-preview {
          margin-top: 16px;
          max-width: 300px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .image-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .submit-btn {
          background: var(--primary-color);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
          margin-top: 20px;
        }

        .submit-btn:hover {
          background: var(--primary-light);
        }
      `}</style>
    </div>
  );
};

export default AddProduct;
