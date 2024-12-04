import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, deleteOrder } from '../api/orderApi';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
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

  const handleDeleteOrder = async (orderId, status) => {
    if (status !== 'pending' && status !== 'cancelled') {
      alert('Only pending or cancelled orders can be deleted');
      return;
    }

    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order');
      }
    }
  };

  const TAX_RATE = 0.13;
  const SHIPPING_FEE = 9.90;

  const calculateTotal = (orderAmount) => {
    return (orderAmount + (orderAmount * TAX_RATE) + SHIPPING_FEE).toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span 
                  className="status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div key={item._id} className="order-item">
                    <img 
                      src={item.productId.imageUrl}
                      alt={item.productId.name}
                    />
                    <div className="item-details">
                      <h4>{item.productId.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-footer-left">
                  <p className="total">Total: ${calculateTotal(order.totalAmount)}</p>
                </div>
                <div className="order-footer-right">
                  <button 
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                  {(order.status === 'pending' || order.status === 'cancelled') && (
                    <button 
                      onClick={() => handleDeleteOrder(order._id, order.status)}
                      className="delete-btn"
                    >
                      Delete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .orders-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .orders-list {
          display: grid;
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .status {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 14px;
        }

        .order-items {
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
          padding: 20px 0;
        }

        .order-item {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }

        .order-item img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: 4px;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
        }

        .order-footer-left {
          flex: 1;
        }

        .order-footer-right {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .view-details-btn,
        .delete-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .view-details-btn {
          background: var(--primary-color);
          color: white;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
        }

        .view-details-btn:hover {
          opacity: 0.9;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .no-orders {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .no-orders button {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 20px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .delete-btn:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export default OrderList; 