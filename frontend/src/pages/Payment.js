import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, confirmPayment } from '../api/orderApi';
import { clearCart } from '../api/cartApi';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order:', err);
      setLoading(false);
      alert('Error loading order details');
      navigate('/');
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const result = await confirmPayment(orderId, order.paymentMethod);
      if (result.success) {
        // 清空购物车
        await clearCart();
        window.dispatchEvent(new Event('cartUpdated'));
        // 跳转到成功页面
        navigate(`/order-success/${orderId}`);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Error processing payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // 添加价格计算
  const TAX_RATE = 0.13;
  const SHIPPING_FEE = 9.90;

  const calculateSubtotal = () => {
    return order.totalAmount;
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + SHIPPING_FEE;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="payment-container">
      <h1>Complete Your Payment</h1>
      
      <div className="order-details">
        <h2>Order Summary</h2>
        <p>Order Number: {order.orderNumber}</p>
        
        <div className="price-details">
          <div className="price-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Tax (13%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Shipping:</span>
            <span>${SHIPPING_FEE.toFixed(2)}</span>
          </div>
          <div className="price-row total">
            <span>Total Amount:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
        
        <div className="shipping-info">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>

      <div className="payment-section">
        <h2>Payment Method</h2>
        <p>{order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
        
        <button 
          onClick={handlePayment} 
          disabled={processing}
          className="pay-button"
        >
          {processing ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>

      <style jsx>{`
        .payment-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .order-details,
        .payment-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .shipping-info {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .pay-button {
          background: var(--primary-color);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-size: 16px;
          margin-top: 20px;
        }

        .pay-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .pay-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .price-details {
          margin: 20px 0;
          padding: 15px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #666;
        }

        .price-row.total {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #eee;
          font-weight: 600;
          font-size: 1.1em;
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
};

export default Payment; 