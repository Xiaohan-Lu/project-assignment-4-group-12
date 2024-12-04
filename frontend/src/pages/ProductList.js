import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '../api/productApi';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      setProducts(products.filter((product) => product._id !== id));
    }
  };

  const getCategories = () => {
    const categories = products.map((product) => product.category);
    return ['All', ...new Set(categories)];
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (productId, stock) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (stock <= 0) {
      alert('Sorry, this product is out of stock');
      return;
    }

    try {
      await addToCart(productId, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  return (
    <div className="product-list-container">
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {getCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {user?.role === 'admin' && (
          <button className="add-product-btn" onClick={() => navigate('/products/new')}>
            Add New Product
          </button>
        )}
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image-placeholder">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.png';
                  }}
                />
              ) : (
                <span>No Image</span>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="price">${product.price}</span>
                <span className={`stock ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
                  {product.stock <= 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                </span>
              </div>
            </div>
            <div className="product-actions">
              <button className="view-btn" onClick={() => navigate(`/products/${product._id}`)}>
                View Details
              </button>
              {user?.role === 'admin' ? (
                <div className="admin-actions">
                  <button className="edit-btn" onClick={() => navigate(`/products/${product._id}/edit`)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </div>
              ) : (
                <button 
                  className={`add-cart-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(product._id, product.stock)}
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .product-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .filters-section {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .search-bar {
          flex: 1;
        }

        .search-bar input {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--gray-medium);
          border-radius: 8px;
        }

        .category-filter select {
          padding: 12px;
          border: 2px solid var(--gray-medium);
          border-radius: 8px;
          min-width: 150px;
        }

        .add-product-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
          padding-top: 20px;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .product-image-placeholder {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-medium);
          overflow: hidden;
          border-radius: 8px 8px 0 0;
        }

        .product-info {
          padding: 20px;
        }

        .product-info h3 {
          margin: 0 0 10px 0;
          color: var(--text-color);
        }

        .product-description {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
          height: 40px;
          overflow: hidden;
        }

        .product-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .price {
          font-size: 18px;
          font-weight: bold;
          color: var(--primary-color);
        }

        .stock {
          color: #666;
        }

        .product-actions {
          padding: 0 20px 20px;
        }

        .product-actions button {
          width: 100%;
          margin-bottom: 8px;
        }

        .view-btn {
          background: white;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
        }

        .add-cart-btn {
          background: var(--primary-color);
          color: white;
        }

        .admin-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
        }

        .edit-btn {
          background: #4CAF50;
        }

        .delete-btn {
          background: #f44336;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
          background: white;
        }

        .stock.out-of-stock {
          color: #dc3545;
          font-weight: bold;
        }

        .add-cart-btn.disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .add-cart-btn.disabled:hover {
          background: #ccc;
        }

        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default ProductList;
