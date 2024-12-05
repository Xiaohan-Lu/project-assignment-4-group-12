import axios from 'axios';
import config from '../config/config';

const ORDER_API_BASE_URL = `${config.API_BASE_URL}/api/orders`;
const PAYMENT_API_BASE_URL = `${config.API_BASE_URL}/api/payments`;

// 获取认证头
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 创建订单
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(ORDER_API_BASE_URL, orderData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (err) {
    console.error('Error creating order:', err);
    throw err;
  }
};

// 获取用户的所有订单
export const getUserOrders = async () => {
  try {
    const response = await axios.get(`${ORDER_API_BASE_URL}/my-orders`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching orders:', err);
    throw err;
  }
};

// 获取单个订单详情
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${ORDER_API_BASE_URL}/${orderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching order:', err);
    throw err;
  }
};

// 创建支付意向
export const createPaymentIntent = async (orderId) => {
  try {
    const response = await axios.post(
      `${PAYMENT_API_BASE_URL}/create-payment-intent`,
      { orderId },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error creating payment intent:', err);
    throw err;
  }
};

// 确认支付
export const confirmPayment = async (orderId, paymentMethod) => {
  try {
    const response = await axios.post(
      `${PAYMENT_API_BASE_URL}/confirm-payment`,
      { orderId, paymentMethod },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error confirming payment:', err);
    throw err;
  }
};

// 获取支付状态
export const getPaymentStatus = async (orderId) => {
  try {
    const response = await axios.get(
      `${PAYMENT_API_BASE_URL}/payment-status/${orderId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (err) {
    console.error('Error checking payment status:', err);
    throw err;
  }
};

// 添加新的 API 方法
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${ORDER_API_BASE_URL}/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`${ORDER_API_BASE_URL}/${orderId}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${ORDER_API_BASE_URL}/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 