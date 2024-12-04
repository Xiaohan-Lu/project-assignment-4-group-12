import axios from 'axios';
import config from '../config/config';

const PRODUCT_API_BASE_URL = `${config.API_BASE_URL}/api/products`;

// 添加认证头部的辅助函数
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 创建 axios 实例
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

// 修改所有需要认证的请求
export const getProducts = async () => {
  try {
    const response = await api.get(PRODUCT_API_BASE_URL);
    return response.data;
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`${PRODUCT_API_BASE_URL}/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching product:', err);
    throw err;
  }
};

// 需要管理员权限的操作添加认证头
export const addProduct = async (formData) => {
  try {
    const response = await api.post(PRODUCT_API_BASE_URL, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error adding product:', err);
    throw err;
  }
};

export const updateProduct = async (id, formData) => {
  try {
    const response = await api.put(`${PRODUCT_API_BASE_URL}/${id}`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error updating product:', err);
    throw err;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`${PRODUCT_API_BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (err) {
    console.error('Error deleting product:', err);
    throw err;
  }
};