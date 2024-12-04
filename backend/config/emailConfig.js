const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const verifyEmailConfig = async () => {
  try {
    const verify = await transporter.verify();
    console.log('Email configuration is valid:', verify);
    console.log('Using email:', process.env.EMAIL_USER);
    return verify;
  } catch (error) {
    console.error('Email configuration error:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
};

const sendEmail = async (to, template) => {
  try {
    console.log('Attempting to send email with credentials:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD
    });

    const result = await transporter.sendMail({
      from: `"Online Store" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html
    });

    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};


const getOrderConfirmationEmail = (order) => {
  
  const TAX_RATE = 0.13;
  const SHIPPING_FEE = 9.90;
  const subtotal = order.totalAmount;
  const tax = subtotal * TAX_RATE;
  const finalTotal = subtotal + tax + SHIPPING_FEE;

  return {
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Dear ${order.shippingAddress.name},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #444;">Order #${order.orderNumber}</h2>
          <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Total Amount: $${order.totalAmount}</p>
        </div>

        <h3 style="color: #444;">Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: right;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${item.productId.name}
              </td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
                ${item.quantity}
              </td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
                $${item.price}
              </td>
            </tr>
          `).join('')}
        </table>

        <div style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Tax (13%):</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Shipping Fee:</span>
            <span>$${SHIPPING_FEE.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
            <span>Total:</span>
            <span>$${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #444;">Shipping Address:</h3>
          <p>${order.shippingAddress.name}</p>
          <p>${order.shippingAddress.address}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
          <p>Phone: ${order.shippingAddress.phone}</p>
        </div>

        <p>We will notify you when your order has been shipped.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `
  };
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
  getOrderConfirmationEmail
}; 