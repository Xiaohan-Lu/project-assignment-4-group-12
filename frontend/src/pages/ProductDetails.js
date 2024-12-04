import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import { getProductReviews } from '../api/reviewApi';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          getProductById(id),
          getProductReviews(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await addToCart(id, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  if (!product) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="product-details-container">
      <div className="product-details-card">
        <div className="product-image-section">
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
        </div>
        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>
          <div className="price-stock">
            <div className="price">${product.price}</div>
            <div className="stock">Stock: {product.stock}</div>
          </div>
          <div className="actions">
            {user?.role === 'admin' ? (
              // 管理员操作
              <>
                <button className="back" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button className="edit" onClick={() => navigate(`/products/${id}/edit`)}>
                  Edit Product
                </button>
              </>
            ) : (
              // 普通用户操作
              <>
                <button className="add-to-cart" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="back" onClick={() => navigate(-1)}>
                  Back
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="reviews-section">
          <h2>Product Reviews</h2>
          {isLoadingReviews ? (
            <div className="loading">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
                    <div className="reviewer">{review.reviewer_name}</div>
                  </div>
                  <p className="review-content">{review.comment}</p>
                  <div className="review-date">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">No reviews available</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-details-container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .product-details-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 40px;
        }

        .product-image-placeholder {
          width: 100%;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-medium);
          border-radius: 8px;
          overflow: hidden;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
        }

        .product-info-section h1 {
          margin: 0 0 20px 0;
          color: var(--text-color);
        }

        .description {
          font-size: 16px;
          line-height: 1.6;
          color: #666;
          margin-bottom: 30px;
        }

        .price-stock {
          margin-bottom: 30px;
        }

        .price {
          font-size: 32px;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 10px;
        }

        .stock {
          font-size: 16px;
          color: #666;
        }

        .actions {
          display: grid;
          gap: 16px;
        }

        .actions button {
          padding: 16px 32px;
          font-size: 16px;
          border-radius: 8px;
        }

        .add-to-cart {
          background: var(--primary-color);
          color: white;
        }

        .back {
          background: white;
          color: var(--text-color);
          border: 2px solid var(--gray-medium);
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
        }

        .loading-spinner {
          border: 4px solid var(--gray-medium);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .product-details-card {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
          }
        }

        .product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 16px;
          background: white;
        }

        .reviews-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--gray-medium);
        }

        .reviews-list {
          display: grid;
          gap: 20px;
          margin-top: 20px;
        }

        .review-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .stars {
          color: #ffd700;
          letter-spacing: 2px;
        }

        .reviewer {
          color: #666;
          font-size: 14px;
        }

        .review-content {
          color: #333;
          line-height: 1.6;
          margin: 10px 0;
        }

        .review-date {
          color: #999;
          font-size: 12px;
          text-align: right;
        }

        .loading, .no-reviews {
          text-align: center;
          color: #666;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
