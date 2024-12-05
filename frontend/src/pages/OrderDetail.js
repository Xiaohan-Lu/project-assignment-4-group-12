import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const TAX_RATE = 0.13;
  const SHIPPING_FEE = 9.90;

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order:', err);
      setLoading(false);
      navigate('/orders');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffd700',
      paid: '#4CAF50',
      shipped: '#2196F3',
      delivered: '#4CAF50',
      cancelled: '#f44336'
    };
    return colors[status] || '#000';
  };

  const calculateSubtotal = () => {
    return order.totalAmount;
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + SHIPPING_FEE;
  };

  const getPaymentStatus = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'cancelled':
        return 'Cancelled';
      case 'shipped':
        return 'Paid';
      case 'delivered':
        return 'Paid';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-card">
        <div className="order-header">
          <div>
            <h1>Order Details</h1>
            <p className="order-number">Order #{order.orderNumber}</p>
            <p className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span 
            className="status"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="shipping-info">
          <h2>Shipping Information</h2>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>

        <div className="payment-info">
          <h2>Payment Information</h2>
          <p>Method: {order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          <p>Status: {getPaymentStatus(order.status)}</p>
        </div>

        <div className="order-items">
          <h2>Order Items</h2>
          {order.items.map(item => (
            <div key={item._id} className="order-item">
              <img 
                src={item.productId.imageUrl}
                alt={item.productId.name}
              />
              <div className="item-details">
                <h3>{item.productId.name}</h3>
                <p className="quantity">Quantity: {item.quantity}</p>
                <p className="price">Price: ${item.price}</p>
                <p className="subtotal">
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (13%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>${SHIPPING_FEE.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/orders')} 
          className="back-button"
        >
          Back to Orders
        </button>
      </div>

      <style jsx>{`
        .order-detail-container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 20px;
        }

        .order-detail-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .status {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-size: 14px;
        }

        .shipping-info,
        .payment-info,
        .order-items {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .order-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 20px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .order-item img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          border-radius: 4px;
        }

        .order-summary {
          margin-top: 30px;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          color: #666;
        }

        .total {
          font-size: 1.2em;
          font-weight: bold;
          color: #2c3e50;
          border-top: 2px solid #eee;
          margin-top: 10px;
          padding-top: 10px;
        }

        .back-button {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
        }

        .back-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default OrderDetail; 