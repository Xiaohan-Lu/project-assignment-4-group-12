import axios from 'axios';

const CART_API_BASE_URL = '/api/cart';

// 添加认证头部的辅助函数
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 获取购物车
export const getCart = async () => {
  const response = await axios.get(CART_API_BASE_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};

// 添加商品到购物车
export const addToCart = async (productId, quantity) => {
  const response = await axios.post(`${CART_API_BASE_URL}/add`, 
    { productId, quantity },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// 更新购物车商品数量
export const updateCartItem = async (productId, quantity) => {
  const response = await axios.put(
    `${CART_API_BASE_URL}/update/${productId}`,
    { quantity },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// 从购物车移除商品
export const removeFromCart = async (productId) => {
  const response = await axios.delete(
    `${CART_API_BASE_URL}/remove/${productId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const clearCart = async () => {
  try {
    const response = await axios.delete(`${CART_API_BASE_URL}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (err) {
    console.error('Error clearing cart:', err);
    throw err;
  }
};