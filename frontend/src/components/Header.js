import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/authApi';

const Header = () => {
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user, setUser } = useAuth();

  const fetchCartCount = async () => {
    try {
      if (user && user.role !== 'admin') {
        const cart = await getCart();
        const count = cart.items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // 添加购物车更新事件监听
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  const updateCartCount = () => {
    fetchCartCount();
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCartItemCount(0);
    navigate('/');
  };

  const handleHomeClick = () => {
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="logo" onClick={() => navigate('/')}>Online Store</h1>
        <nav className="nav-links">
          <button className="home-button" onClick={handleHomeClick}>Home</button>
          {user ? (
            <>
              <div className="user-menu">
                <button className="user-button">
                  {user.username}
                  <div className="dropdown-content">
                    <span onClick={() => navigate('/profile')}>Profile</span>
                    {user.role === 'admin' ? (
                      <>
                        <span onClick={() => navigate('/products/new')}>Add Product</span>
                        <span onClick={() => navigate('/admin/orders')}>Manage Orders</span>
                      </>
                    ) : (
                      <>
                        <span onClick={() => navigate('/orders')}>My Orders</span>
                        <span onClick={() => navigate('/cart')}>Shopping Cart</span>
                      </>
                    )}
                    <span onClick={handleLogout}>Logout</span>
                  </div>
                </button>
              </div>
              {(!user || user.role !== 'admin') && (
                <button className="cart-button" onClick={() => navigate('/cart')}>
                  <span className="cart-icon">Cart</span>
                  <span className="cart-count">{cartItemCount}</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button className="login-button" onClick={() => navigate('/login')}>Login</button>
              {(!user || user.role !== 'admin') && (
                <button className="cart-button" onClick={() => navigate('/cart')}>
                  <span className="cart-icon">Cart</span>
                  <span className="cart-count">{cartItemCount}</span>
                </button>
              )}
            </>
          )}
        </nav>
      </div>
      <style jsx>{`
        .header {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
        }

        .logo {
          color: var(--primary-color);
          font-size: 24px;
          margin: 0;
          cursor: pointer;
          transition: var(--transition);
        }

        .logo:hover {
          opacity: 0.8;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .home-button {
          background: transparent;
          color: var(--text-color);
          box-shadow: none;
        }

        .home-button:hover {
          background: var(--gray-light);
          color: var(--primary-color);
        }

        .cart-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: var(--text-color);
          border: 2px solid var(--primary-color);
          padding: 8px 16px;
        }

        .cart-button:hover {
          background: var(--primary-color);
          color: white;
        }

        .cart-count {
          background: var(--primary-color);
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 12px;
        }

        .cart-button:hover .cart-count {
          background: white;
          color: var(--primary-color);
        }

        .user-menu {
          position: relative;
          display: inline-block;
        }

        .user-button {
          background: transparent;
          color: var(--text-color);
          padding: 8px 16px;
          border: 2px solid var(--primary-color);
          border-radius: 8px;
          cursor: pointer;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background-color: white;
          min-width: 180px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          z-index: 1;
          border: 1px solid var(--gray-light);
        }

        .user-menu:hover .dropdown-content {
          display: block;
        }

        .dropdown-content span {
          color: var(--text-color);
          padding: 12px 16px;
          display: block;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropdown-content span:first-child {
          border-radius: 8px 8px 0 0;
        }

        .dropdown-content span:last-child {
          border-radius: 0 0 8px 8px;
          border-top: 1px solid var(--gray-light);
        }

        .dropdown-content span:hover {
          background-color: var(--gray-light);
          color: var(--primary-color);
        }

        .login-button {
          background: var(--primary-color);
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .login-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </header>
  );
};

export default Header;