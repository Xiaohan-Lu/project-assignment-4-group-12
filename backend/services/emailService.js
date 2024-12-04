const { sendEmail, getOrderConfirmationEmail } = require('../config/emailConfig');
const User = require('../models/User');

const sendOrderConfirmation = async (order) => {
  try {
    // 获取用户邮箱
    const user = await User.findById(order.userId);
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    // 准备邮件模板
    const template = getOrderConfirmationEmail(order);

    // 发送邮件
    await sendEmail(user.email, template);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmation
}; 