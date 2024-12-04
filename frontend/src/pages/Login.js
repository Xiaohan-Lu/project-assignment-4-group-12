import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(formData);
      setUser(userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Login</button>
        </form>
        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          max-width: 400px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding-left: 30px;
          padding-right: 50px;
          padding-top: 30px;
          padding-bottom: 30px;
        }

        h2 {
          color: var(--primary-color);
          margin-bottom: 24px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-color);
        }

        input {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--gray-medium);
          border-radius: 8px;
          font-size: 16px;
        }

        input:focus {
          border-color: var(--primary-color);
          outline: none;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .submit-btn:hover {
          opacity: 0.9;
        }

        .error-message {
          color: #f44336;
          margin-bottom: 16px;
          padding: 8px;
          background: #ffebee;
          border-radius: 4px;
        }

        .auth-link {
          margin-top: 16px;
          text-align: center;
          color: var(--text-color);
        }

        .auth-link span {
          color: var(--primary-color);
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login; 