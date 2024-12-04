import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cartApi';
import { createOrder } from '../api/orderApi';

const OrderConfirm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (user && user.addresses) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setShippingAddress({
          name: user.username || '',
          phone: '',
          address: defaultAddress.street || '',
          city: defaultAddress.city || '',
          postalCode: defaultAddress.zipCode || ''
        });
      }
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const TAX_RATE = 0.13;  // 13% 税率
  const SHIPPING_FEE = 9.90;  // 固定运费

  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => 
      sum + (item.quantity * item.productId.price), 0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + SHIPPING_FEE;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price
        })),
        shippingAddress,
        paymentMethod,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shippingFee: SHIPPING_FEE,
        totalAmount: calculateTotal()
      };

      console.log('Preparing to send order data:', JSON.stringify(orderData, null, 2));

      const order = await createOrder(orderData);
      console.log('Order created successfully:', order);
      navigate(`/payment/${order._id}`);
    } catch (err) {
      console.error('Detailed error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      alert(`Error creating order: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="order-confirm-container">
      <h1>Confirm Your Order</h1>
      
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cart.items.map(item => (
          <div key={item.productId._id} className="order-item">
            <div className="item-image">
              <img 
                src={item.productId.imageUrl} 
                alt={item.productId.name} 
              />
            </div>
            <div className="item-details">
              <h3>{item.productId.name}</h3>
              <p className="item-description">{item.productId.description}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.productId.price}</p>
              <p>Subtotal: ${(item.quantity * item.productId.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
        <div className="order-totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Tax (13%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Shipping:</span>
            <span>${SHIPPING_FEE.toFixed(2)}</span>
          </div>
          <div className="total-row final">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="shipping-form">
        <h2>Shipping Information</h2>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={shippingAddress.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={shippingAddress.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={shippingAddress.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={shippingAddress.city}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Postal Code:</label>
          <input
            type="text"
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <button type="submit" className="confirm-button">
          Proceed to Payment
        </button>
      </form>

      <style jsx>{`
        .order-confirm-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .order-summary {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .order-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }

        .item-image {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
        }

        .order-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .item-description {
          color: #666;
          font-size: 0.9em;
          margin: 5px 0;
          line-height: 1.4;
        }

        .order-totals {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #666;
        }

        .total-row.final {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #eee;
          font-weight: 600;
          font-size: 1.2em;
          color: #2c3e50;
        }

        .shipping-form {
          background: white;
          padding: 20px;
          padding-right: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .confirm-button {
          background: var(--primary-color);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-size: 16px;
        }

        .confirm-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirm; 