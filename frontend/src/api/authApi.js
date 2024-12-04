import axios from 'axios';
import config from '../config/config';

const AUTH_API_BASE_URL = `${config.API_BASE_URL}/api/auth`;

// 用户注册
export const register = async (userData) => {
  const response = await axios.post(`${AUTH_API_BASE_URL}/register`, userData);
  if (response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data));
  }
  return response.data;
};

// 用户登录
export const login = async (credentials) => {
  const response = await axios.post(`${AUTH_API_BASE_URL}/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data));
  }
  return response.data;
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  const token = localStorage.getItem('userToken');
  if (!token) return null;

  const response = await axios.get(`${AUTH_API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// 更新用户信息
export const updateUser = async (userData) => {
  const token = localStorage.getItem('userToken');
  try {
    // Ensure addresses array exists
    const dataToUpdate = {
      ...userData,
      addresses: userData.addresses || []
    };

    console.log('Sending update data:', dataToUpdate); // Debug log

    const response = await axios.put(`${AUTH_API_BASE_URL}/update`, dataToUpdate, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Update response:', response.data); // Debug log

    // Update local storage with new user data
    if (response.data) {
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...currentUserData,
        ...response.data
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
    }

    return response.data;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

// 登出
export const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
}; 