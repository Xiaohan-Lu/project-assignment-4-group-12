import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../api/orderApi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Order Management</h1>
      </div>
      
      <div style={styles.orderGrid}>
        {orders.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <div style={styles.orderInfo}>
                <h3 style={styles.orderNumber}>Order #{order.orderNumber}</h3>
                <span style={{...styles.status, ...styles[order.status]}}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={styles.customerInfo}>
              <p style={styles.label}>Customer</p>
              <p style={styles.value}>{order.shippingAddress.name}</p>
              <p style={styles.value}>{order.shippingAddress.email}</p>
            </div>

            <div style={styles.itemsContainer}>
              <p style={styles.label}>Items</p>
              {order.items.map((item, index) => (
                <div key={index} style={styles.item}>
                  <span style={styles.itemName}>{item.productId.name}</span>
                  <span style={styles.itemQuantity}>x{item.quantity}</span>
                  <span style={styles.itemPrice}>${item.price}</span>
                </div>
              ))}
              <div style={styles.totalAmount}>
                <span>Total Amount:</span>
                <span>${order.totalAmount}</span>
              </div>
            </div>

            <div style={styles.actions}>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                style={styles.select}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    margin: 0,
  },
  orderGrid: {
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  },
  orderCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  orderDate: {
    color: '#666',
    fontSize: '0.9rem',
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  pending: {
    background: '#fff3cd',
    color: '#856404',
  },
  paid: {
    background: '#d4edda',
    color: '#155724',
  },
  shipped: {
    background: '#cce5ff',
    color: '#004085',
  },
  delivered: {
    background: '#d1e7dd',
    color: '#0f5132',
  },
  cancelled: {
    background: '#f8d7da',
    color: '#721c24',
  },
  customerInfo: {
    marginBottom: '1rem',
    padding: '1rem 0',
    borderBottom: '1px solid #eee',
  },
  itemsContainer: {
    marginBottom: '1rem',
  },
  label: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  value: {
    color: '#333',
    margin: '0.25rem 0',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  itemName: {
    flex: 1,
  },
  itemQuantity: {
    color: '#666',
    margin: '0 1rem',
  },
  itemPrice: {
    fontWeight: '500',
  },
  totalAmount: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderTop: '1px solid #eee',
    marginTop: '1rem',
    fontWeight: '500',
  },
  actions: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default AdminOrders; 