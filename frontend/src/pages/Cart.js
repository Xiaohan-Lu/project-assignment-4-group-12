import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../api/cartApi';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
      calculateTotal(data.items);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  
  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      return acc + (item.productId.price * item.quantity);
    }, 0);
    setTotal(sum);
  };

  
  const handleQuantityChange = async (productId, quantity, stock) => {
    if (quantity < 1) return;
    
    if (quantity > stock) {
      alert(`Sorry, only ${stock} items available in stock`);
      return;
    }

    try {
      await updateCartItem(productId, quantity);
      await fetchCart(); 
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // 删除商品
  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      await fetchCart(); 
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  
  const handleContinueShopping = () => {
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/');
  };

  
  const TAX_RATE = 0.13;  // 13% 
  const SHIPPING_FEE = 9.90;

  // calculate tax
  const calculateTax = () => {
    return total * TAX_RATE;
  };

  
  const calculateFinalTotal = () => {
    return total + calculateTax() + SHIPPING_FEE;
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const currentStyles = {
    ...styles,
    container: {
      padding: windowWidth <= 768 ? '1rem' : '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    cartContent: {
      display: 'grid',
      gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 300px',
      gap: windowWidth <= 768 ? '1rem' : '2rem',
    },
    cartItem: {
      display: 'flex',
      flexDirection: windowWidth <= 768 ? 'column' : 'row',
      gap: windowWidth <= 768 ? '1rem' : '1.5rem',
      padding: windowWidth <= 768 ? '1rem' : '1.5rem',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    itemImage: {
      width: windowWidth <= 768 ? '100%' : '150px',
      height: windowWidth <= 768 ? '200px' : '150px',
      flexShrink: 0,
      borderRadius: '8px',
      overflow: 'hidden',
    },
    cartSummary: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      height: 'fit-content',
      position: windowWidth <= 768 ? 'static' : 'sticky',
      top: '2rem',
      marginTop: windowWidth <= 768 ? '1rem' : '0',
      width: windowWidth <= 768 ? '100%' : 'auto',
    },
  };

  return (
    <div style={currentStyles.container}>
      <h1 style={currentStyles.title}>Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div style={currentStyles.emptyCart}>
          <p>Your cart is empty</p>
          <button 
            onClick={() => navigate('/')}
            style={currentStyles.continueButton}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div style={currentStyles.cartContent}>
          <div style={currentStyles.cartItems}>
            {cart.items.map((item) => (
              <div key={item.productId._id} style={currentStyles.cartItem}>
                <div style={currentStyles.itemImage}>
                  <img
                    src={item.productId.imageUrl || '/placeholder.png'}
                    alt={item.productId.name}
                    style={currentStyles.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.png';
                    }}
                  />
                </div>
                <div style={currentStyles.itemInfo}>
                  <h3 style={currentStyles.itemName}>{item.productId.name}</h3>
                  <p style={currentStyles.itemDescription}>{item.productId.description}</p>
                  <div style={currentStyles.itemDetails}>
                    <div style={currentStyles.priceStock}>
                      <span style={currentStyles.price}>${item.productId.price}</span>
                      <span style={currentStyles.stock}>Stock: {item.productId.stock}</span>
                    </div>
                    <div style={currentStyles.quantityControls}>
                      <button
                        onClick={() => handleQuantityChange(item.productId._id, Math.max(1, item.quantity - 1), item.productId.stock)}
                        style={currentStyles.quantityButton}
                      >
                        -
                      </button>
                      <span style={currentStyles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1, item.productId.stock)}
                        style={currentStyles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                    <div style={currentStyles.subtotal}>
                      Subtotal: ${(item.productId.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId._id)}
                      style={currentStyles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={currentStyles.cartSummary}>
            <h2 style={currentStyles.summaryTitle}>Cart Summary</h2>
            <div style={currentStyles.summaryDetails}>
              <div style={currentStyles.summaryRow}>
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={currentStyles.summaryRow}>
                <span>Tax (13%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div style={currentStyles.summaryRow}>
                <span>Shipping:</span>
                <span>${SHIPPING_FEE.toFixed(2)}</span>
              </div>
              <div style={{...currentStyles.summaryRow, ...currentStyles.finalTotal}}>
                <span>Total:</span>
                <span>${calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleContinueShopping}
              style={currentStyles.continueShoppingButton}
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/order-confirm')}
              style={currentStyles.checkoutButton}
            >
              Proceed to Checkout (${calculateFinalTotal().toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    '@media (max-width: 768px)': {
      padding: '1rem',
    }
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#333',
  },
  cartContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '2rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
    }
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cartItem: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      padding: '1rem',
      gap: '1rem',
    }
  },
  itemImage: {
    width: '150px',
    height: '150px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      width: '100%',
      height: '200px',
    }
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', 
    backgroundColor: '#f8f9fa',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  itemDescription: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  itemDetails: {
    marginTop: 'auto',
  },
  priceStock: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#2c3e50',
  },
  stock: {
    color: '#666',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  quantityButton: {
    padding: '0.25rem 0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: '#f8f9fa',
    color: '#333',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: '#e9ecef',
    },
  },
  quantity: {
    minWidth: '40px',
    textAlign: 'center',
  },
  subtotal: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  removeButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    background: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    ':hover': {
      background: '#c82333',
    },
  },
  cartSummary: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '2rem',
    '@media (max-width: 768px)': {
      position: 'relative',
      top: '0',
      marginTop: '1rem',
    }
  },
  summaryTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#333',
  },
  summaryDetails: {
    marginBottom: '1.5rem',
    padding: '1rem 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    fontSize: '1rem',
    color: '#666',
  },
  finalTotal: {
    borderTop: '1px solid #eee',
    marginTop: '1rem',
    paddingTop: '1rem',
    fontSize: '1.2rem',
    fontWeight: '500',
    color: '#2c3e50',
  },
  checkoutButton: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    background: '#28a745',
    color: 'white',
    fontSize: '1.1rem',
    cursor: 'pointer',
    ':hover': {
      background: '#218838',
    },
  },
  emptyCart: {
    textAlign: 'center',
    padding: '2rem',
  },
  continueButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    background: '#007bff',
    color: 'white',
    cursor: 'pointer',
    ':hover': {
      background: '#0056b3',
    },
  },
  continueShoppingButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    background: '#6c757d',
    color: 'white',
    cursor: 'pointer',
    marginTop: '1rem',
    ':hover': {
      background: '#5a6268',
    },
  },
  cartActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
};

export default Cart;