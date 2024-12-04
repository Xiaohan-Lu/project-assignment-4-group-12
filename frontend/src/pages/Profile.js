import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/authApi';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    addresses: []
  });
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    if (user) {
      console.log('Initial user data:', user);
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        addresses: user.addresses || []
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      setMessage({ type: 'error', content: 'Please fill in all address fields' });
      return;
    }

    try {
      const updatedAddresses = [...(formData.addresses || []), newAddress];
      
      const updatedUser = await updateUser({
        ...formData,
        addresses: updatedAddresses
      });

      if (updatedUser) {
        setFormData(prev => ({
          ...prev,
          addresses: updatedUser.addresses
        }));
        
        setUser(updatedUser);
        
        setNewAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isDefault: false
        });
        setShowAddressForm(false);
        setMessage({ type: 'success', content: 'Address added successfully' });
      }
    } catch (error) {
      console.error('Add address error:', error);
      setMessage({ type: 'error', content: 'Failed to add address' });
    }
  };

  const handleRemoveAddress = async (index) => {
    try {
      const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
      
      const updatedUser = await updateUser({
        ...formData,
        addresses: updatedAddresses
      });

      if (updatedUser) {
        setFormData(prev => ({
          ...prev,
          addresses: updatedUser.addresses
        }));
        
        setUser(updatedUser);
        setMessage({ type: 'success', content: 'Address removed successfully' });
      }
    } catch (error) {
      console.error('Remove address error:', error);
      setMessage({ type: 'error', content: 'Failed to remove address' });
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const updatedAddresses = formData.addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }));
      
      const updatedUser = await updateUser({
        ...formData,
        addresses: updatedAddresses
      });

      if (updatedUser) {
        setFormData(prev => ({
          ...prev,
          addresses: updatedUser.addresses
        }));
        
        setUser(updatedUser);
        setMessage({ type: 'success', content: 'Default address set successfully' });
      }
    } catch (error) {
      console.error('Set default address error:', error);
      setMessage({ type: 'error', content: 'Failed to set default address' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser({
        username: formData.username,
        email: formData.email,
        addresses: formData.addresses
      });

      if (!updatedUser) {
        throw new Error('Failed to update profile');
      }

      setUser(updatedUser);
      setMessage({ type: 'success', content: 'Profile updated successfully' });
    } catch (err) {
      console.error('Update error:', err);
      setMessage({ 
        type: 'error', 
        content: err.response?.data?.message || 'Error updating profile' 
      });
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile Settings</h2>
        {message.content && (
          <div className={`message ${message.type}`}>
            {message.content}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* 基本信息部分 */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 地址部分 */}
          <div className="form-section">
            <h3>Addresses</h3>
            <div className="addresses-list">
              {(formData.addresses || []).map((address, index) => (
                <div key={index} className="address-card">
                  <div className="address-info">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    {address.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  <div className="address-actions">
                    {!address.isDefault && (
                      <button 
                        type="button" 
                        onClick={() => handleSetDefaultAddress(index)}
                        className="set-default-btn"
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAddress(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddressForm ? (
              <div className="new-address-form">
                <h4>Add New Address</h4>
                <div className="form-group">
                  <label htmlFor="street">Street</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={handleAddressChange}
                  />
                  <label htmlFor="isDefault">Set as default address</label>
                </div>
                <div className="address-form-actions">
                  <button type="button" onClick={handleAddAddress} className="add-btn">
                    Add Address
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setShowAddressForm(true)}
                className="add-address-btn"
              >
                Add New Address
              </button>
            )}
          </div>

          <button type="submit" className="submit-btn">Update Profile</button>
        </form>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .profile-card {
          background: white;
          padding: 30px;
          padding-right: 50px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
          color: var(--primary-color);
          margin-bottom: 24px;
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

        .message {
          padding: 12px;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        .message.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .message.error {
          background: #ffebee;
          color: #c62828;
        }

        .form-section {
          margin-bottom: 30px;
        }

        h3 {
          color: var(--text-color);
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--gray-light);
        }

        .addresses-list {
          margin-bottom: 20px;
        }

        .address-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .address-info p {
          margin: 0;
          line-height: 1.4;
        }

        .default-badge {
          background: var(--primary-color);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-left: 8px;
        }

        .address-actions {
          display: flex;
          gap: 8px;
        }

        .set-default-btn,
        .remove-btn {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
        }

        .set-default-btn {
          background: var(--primary-color);
          color: white;
        }

        .remove-btn {
          background: #dc3545;
          color: white;
        }

        .add-address-btn {
          width: 100%;
          padding: 12px;
          background: white;
          border: 2px dashed var(--gray-medium);
          border-radius: 8px;
          color: var(--primary-color);
          cursor: pointer;
          margin-bottom: 20px;
        }

        .new-address-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-row:first-of-type .form-group {
          width: 100%;
        }

        .form-row:last-of-type .form-group {
          flex: 1;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox input {
          width: auto;
        }

        .address-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .add-btn,
        .cancel-btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
        }

        .add-btn {
          background: var(--primary-color);
          color: white;
        }

        .cancel-btn {
          background: var(--gray-medium);
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
          width: 100%;
        }

        .form-group input {
          width: 90%;
          padding: 12px;
          border: 2px solid var(--gray-medium);
          border-radius: 8px;
          font-size: 16px;
        }

        .new-address-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        h4 {
          margin-bottom: 20px;
          color: var(--text-color);
        }
      `}</style>
    </div>
  );
};

export default Profile; 