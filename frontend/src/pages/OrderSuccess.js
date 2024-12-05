import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      navigate('/');
    }
  };

  if (!order) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-header">
          <h1>Order Successful!</h1>
          <div className="checkmark">✓</div>
        </div>

        <div className="order-info">
          <h2>Order Details</h2>
          <p className="order-number">Order Number: {order.orderNumber}</p>
          <div className="price-details">
            <div className="price-row">
              <span>Subtotal:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Tax (13%):</span>
              <span>${(order.totalAmount * 0.13).toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Shipping Fee:</span>
              <span>$9.90</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>${(order.totalAmount + (order.totalAmount * 0.13) + 9.90).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="shipping-info">
          <h3>Shipping Information</h3>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>

        <div className="button-group">
          <button 
            onClick={() => navigate('/orders')} 
            className="view-orders-btn"
          >
            View All Orders
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style jsx>{`
        .success-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }

        .success-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .success-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .checkmark {
          width: 60px;
          height: 60px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin: 20px auto;
        }

        .order-info,
        .shipping-info {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .order-number {
          color: var(--primary-color);
          font-weight: bold;
        }

        .price-details {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }

        .price-row.total {
          border-top: 1px solid #ddd;
          margin-top: 10px;
          padding-top: 10px;
          font-weight: bold;
          color: var(--primary-color);
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .view-orders-btn,
        .continue-shopping-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }

        .view-orders-btn {
          background: var(--primary-color);
          color: white;
        }

        .continue-shopping-btn {
          background: white;
          border: 2px solid var(--primary-color);
          color: var(--primary-color);
        }

        .view-orders-btn:hover,
        .continue-shopping-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess; 