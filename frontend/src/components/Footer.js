import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>Group 12</h3>
          <p>Xiaohan Lu</p>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: xlu469@uwo.ca</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Online Store. All rights reserved.</p>
      </div>
      <style jsx>{`
        .footer {
          background-color: white;
          padding: 40px 0 20px;
          margin-top: 60px;
          box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h3 {
          color: var(--primary-color);
          margin-bottom: 16px;
          font-size: 18px;
        }

        .footer-section p {
          color: var(--text-color);
          font-size: 14px;
        }

        .social-links {
          display: flex;
          gap: 16px;
          font-size: 24px;
        }

        .social-links span {
          cursor: pointer;
          transition: var(--transition);
        }

        .social-links span:hover {
          transform: scale(1.2);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid var(--gray-medium);
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </footer>
  );
};

export default Footer;