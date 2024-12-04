import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 检查用户权限
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setFormData(data);
        if (data.imageUrl) {
          setImagePreview(`${config.API_BASE_URL}${data.imageUrl}`);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        alert('Failed to fetch product data.');
        navigate('/');
      }
    };
    fetchProduct();
  }, [id, navigate]);

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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // 添加文本字段
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      
      // 添加图片
      if (image) {
        data.append('image', image);
      }

      await updateProduct(id, data);
      alert('Product updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update product';
      alert(`Failed to update product: ${errorMessage}`);
    }
  };

  // 如果正在检查权限，显示加载状态
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-product-container">
      <h1>Edit Product</h1>
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

        <div className="button-group">
          <button type="submit" className="submit-btn">Update Product</button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .edit-product-container {
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
          width: 100%;
          max-width: 300px;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--gray-medium);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 8px;
          background: white;
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
        }

        .submit-btn, .cancel-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
        }

        .submit-btn {
          background: var(--primary-color);
          color: white;
        }

        .submit-btn:hover {
          background: var(--primary-light);
        }

        .cancel-btn {
          background: white;
          color: var(--text-color);
          border: 2px solid var(--gray-medium);
        }

        .cancel-btn:hover {
          background: var(--gray-light);
        }
      `}</style>
    </div>
  );
};

export default EditProduct;
