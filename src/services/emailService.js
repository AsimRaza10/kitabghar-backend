import transporter from '../config/email.js';

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, user) => {
  if (!transporter) {
    console.log('Email not configured, skipping order confirmation email');
    return;
  }

  try {
    const mailOptions = {
      from: `"KitabGhar Bookstore" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f3f4f6;
            }
            .email-wrapper { background-color: #f3f4f6; padding: 40px 20px; }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
              background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content {
              padding: 40px 30px;
              background-color: white;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 16px;
            }
            .message {
              font-size: 15px;
              color: #4b5563;
              margin-bottom: 24px;
              line-height: 1.7;
            }
            .order-details {
              background: linear-gradient(to bottom, #fff7ed 0%, #ffffff 100%);
              padding: 24px;
              margin: 24px 0;
              border-radius: 12px;
              border: 1px solid #fed7aa;
            }
            .order-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 16px;
              border-bottom: 2px solid #fdba74;
            }
            .order-number {
              font-size: 20px;
              font-weight: 700;
              color: #ea580c;
            }
            .order-date {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .info-label {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }
            .info-value {
              font-size: 14px;
              color: #111827;
              font-weight: 600;
            }
            .item {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              margin: 12px 0;
              transition: all 0.2s;
            }
            .item:hover {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .item-title {
              font-size: 16px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 4px;
            }
            .item-author {
              font-size: 14px;
              color: #6b7280;
              font-style: italic;
              margin-bottom: 8px;
            }
            .item-details {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 12px;
              padding-top: 12px;
              border-top: 1px solid #f3f4f6;
            }
            .item-quantity {
              font-size: 14px;
              color: #6b7280;
            }
            .item-price {
              font-size: 16px;
              font-weight: 700;
              color: #ea580c;
            }
            .total-section {
              background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
              padding: 24px;
              border-radius: 12px;
              margin-top: 24px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              color: #d1d5db;
              font-size: 15px;
            }
            .total-row.final {
              border-top: 2px solid #4b5563;
              padding-top: 16px;
              margin-top: 12px;
            }
            .total-row.final .label {
              font-size: 18px;
              font-weight: 700;
              color: white;
            }
            .total-row.final .value {
              font-size: 24px;
              font-weight: 700;
              color: #fbbf24;
            }
            .shipping-address {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #ea580c;
              margin: 20px 0;
            }
            .shipping-title {
              font-size: 14px;
              font-weight: 700;
              color: #ea580c;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            }
            .shipping-info {
              font-size: 14px;
              color: #4b5563;
              line-height: 1.8;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              margin: 24px 0;
              box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3);
              transition: all 0.2s;
            }
            .button:hover {
              box-shadow: 0 10px 15px -3px rgba(234, 88, 12, 0.4);
              transform: translateY(-1px);
            }
            .footer {
              background: #f9fafb;
              text-align: center;
              padding: 32px 30px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-logo {
              font-size: 20px;
              font-weight: 700;
              color: #ea580c;
              margin-bottom: 12px;
            }
            .footer-links {
              margin: 16px 0;
            }
            .footer-link {
              color: #ea580c;
              text-decoration: none;
              margin: 0 12px;
              font-weight: 500;
            }
            .social-icons {
              margin-top: 20px;
            }
            .social-icon {
              display: inline-block;
              width: 36px;
              height: 36px;
              background: #e5e7eb;
              border-radius: 50%;
              margin: 0 6px;
              line-height: 36px;
              text-align: center;
              color: #6b7280;
              text-decoration: none;
              font-weight: 600;
            }

            /* Responsive Design - Mobile First */
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 20px 10px !important; }
              .container { border-radius: 12px !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .header p { font-size: 14px !important; }
              .content { padding: 24px 20px !important; }
              .greeting { font-size: 16px !important; }
              .message { font-size: 14px !important; }
              .order-details { padding: 16px !important; margin: 16px 0 !important; }
              .order-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .order-number { font-size: 18px !important; }
              .order-date { font-size: 13px !important; }
              .item { padding: 12px !important; margin: 8px 0 !important; }
              .item-title { font-size: 15px !important; }
              .item-details {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .total-section { padding: 16px !important; }
              .total-row { font-size: 14px !important; }
              .total-row.final .label { font-size: 16px !important; }
              .total-row.final .value { font-size: 20px !important; }
              .shipping-address { padding: 16px !important; }
              .button {
                display: block !important;
                width: 100% !important;
                padding: 12px 24px !important;
                font-size: 14px !important;
                text-align: center !important;
              }
              .footer { padding: 24px 20px !important; }
              .footer-links {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
              }
              .footer-link { margin: 4px 0 !important; }
            }

            /* Tablet Responsive */
            @media only screen and (min-width: 601px) and (max-width: 768px) {
              .email-wrapper { padding: 30px 15px !important; }
              .header { padding: 35px 25px !important; }
              .content { padding: 32px 25px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>Order Confirmed!</h1>
                <p>Thank you for your purchase</p>
              </div>
              <div class="content">
                <p class="greeting">Hi ${user.name},</p>
                <p class="message">
                  Thank you for your order! We're excited to get your books ready for shipment.
                  You'll receive another email with tracking information once your order ships.
                </p>

                <div class="order-details">
                  <div class="order-header">
                    <span class="order-number">Order #${order._id.toString().slice(-8).toUpperCase()}</span>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <div class="info-row">
                    <span class="info-label">Payment Method</span>
                    <span class="info-value">${order.paymentMethod}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Order Status</span>
                    <span class="info-value">${order.status}</span>
                  </div>

                  <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 24px 0 12px 0;">Order Items</h3>
                  ${order.items.map(item => `
                    <div class="item">
                      <div class="item-title">${item.book.title}</div>
                      <div class="item-author">by ${item.book.author}</div>
                      <div class="item-details">
                        <span class="item-quantity">Quantity: ${item.quantity}</span>
                        <span class="item-price">$${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  `).join('')}

                  <div class="total-section">
                    <div class="total-row">
                      <span class="label">Subtotal</span>
                      <span class="value">$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                      <span class="label">Shipping</span>
                      <span class="value">$${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                      <span class="label">Tax</span>
                      <span class="value">$${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row final">
                      <span class="label">Total</span>
                      <span class="value">$${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div class="shipping-address">
                  <div class="shipping-title">Shipping Address</div>
                  <div class="shipping-info">
                    <strong>${order.shippingAddress.fullName}</strong><br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                    ${order.shippingAddress.country}<br>
                    Phone: ${order.shippingAddress.phone}
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/my-orders" class="button">Track Your Order</a>
                </div>

                <p class="message" style="margin-top: 24px;">
                  If you have any questions about your order, feel free to contact our support team.
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">KitabGhar</div>
                <p>Your trusted bookstore for all your reading needs</p>
                <div class="footer-links">
                  <a href="${process.env.FRONTEND_URL}" class="footer-link">Shop</a>
                  <a href="${process.env.FRONTEND_URL}/my-orders" class="footer-link">My Orders</a>
                  <a href="${process.env.FRONTEND_URL}/contact" class="footer-link">Contact</a>
                </div>
                <p style="margin-top: 16px;">© 2026 KitabGhar Bookstore. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  Questions? Email us at <a href="mailto:support@kitabghar.com" style="color: #ea580c;">support@kitabghar.com</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

// Send order status update email
export const sendOrderStatusEmail = async (order, user, newStatus) => {
  if (!transporter) {
    console.log('Email not configured, skipping order status email');
    return;
  }

  try {
    let statusMessage = '';
    let statusColor = '#f68662';

    switch (newStatus) {
      case 'Confirmed':
        statusMessage = 'Your order has been confirmed and is being prepared for shipment.';
        statusColor = '#3b82f6';
        break;
      case 'Shipped':
        statusMessage = 'Great news! Your order has been shipped and is on its way to you.';
        statusColor = '#8b5cf6';
        break;
      case 'Delivered':
        statusMessage = 'Your order has been delivered. We hope you enjoy your books!';
        statusColor = '#10b981';
        break;
      case 'Cancelled':
        statusMessage = 'Your order has been cancelled. If you have any questions, please contact us.';
        statusColor = '#ef4444';
        break;
      default:
        statusMessage = `Your order status has been updated to: ${newStatus}`;
    }

    const mailOptions = {
      from: `"KitabGhar Bookstore" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update - #${order._id.toString().slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f3f4f6;
            }
            .email-wrapper { background-color: #f3f4f6; padding: 40px 20px; }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
              background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content {
              padding: 40px 30px;
              background-color: white;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 16px;
            }
            .message {
              font-size: 15px;
              color: #4b5563;
              margin-bottom: 24px;
              line-height: 1.7;
            }
            .status-box {
              background: linear-gradient(to bottom, ${statusColor}15 0%, ${statusColor}05 100%);
              padding: 32px;
              margin: 24px 0;
              border-radius: 12px;
              text-align: center;
              border: 2px solid ${statusColor}40;
            }
            .status-icon {
              width: 80px;
              height: 80px;
              background: ${statusColor};
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            .status-title {
              font-size: 28px;
              font-weight: 700;
              color: ${statusColor};
              margin-bottom: 12px;
            }
            .status-message {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.6;
            }
            .order-number {
              font-size: 18px;
              font-weight: 700;
              color: #111827;
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px solid ${statusColor}30;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              margin: 24px 0;
              box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3);
            }
            .footer {
              background: #f9fafb;
              text-align: center;
              padding: 32px 30px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-logo {
              font-size: 20px;
              font-weight: 700;
              color: #ea580c;
              margin-bottom: 12px;
            }
            .footer-link {
              color: #ea580c;
              text-decoration: none;
              margin: 0 12px;
              font-weight: 500;
            }

            /* Responsive Design - Mobile First */
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 20px 10px !important; }
              .container { border-radius: 12px !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .header p { font-size: 14px !important; }
              .content { padding: 24px 20px !important; }
              .greeting { font-size: 16px !important; }
              .message { font-size: 14px !important; }
              .status-box { padding: 24px 16px !important; margin: 16px 0 !important; }
              .status-icon { width: 60px !important; height: 60px !important; font-size: 32px !important; }
              .status-title { font-size: 22px !important; }
              .status-message { font-size: 14px !important; }
              .order-number { font-size: 16px !important; }
              .order-details { padding: 16px !important; margin: 16px 0 !important; }
              .order-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .feature-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
              }
              .feature-card { padding: 16px !important; }
              .feature-icon { font-size: 32px !important; }
              .feature-title { font-size: 15px !important; }
              .feature-description { font-size: 13px !important; }
              .item { padding: 12px !important; margin: 8px 0 !important; }
              .item-title { font-size: 15px !important; }
              .item-details {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .total-section { padding: 16px !important; }
              .total-row { font-size: 14px !important; }
              .total-row.final .label { font-size: 16px !important; }
              .total-row.final .value { font-size: 20px !important; }
              .shipping-address { padding: 16px !important; }
              .button {
                display: block !important;
                width: 100% !important;
                padding: 12px 24px !important;
                font-size: 14px !important;
                text-align: center !important;
              }
              .footer { padding: 24px 20px !important; }
              .footer-links {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
              }
              .footer-link { margin: 4px 0 !important; display: block !important; }
            }

            /* Tablet Responsive */
            @media only screen and (min-width: 601px) and (max-width: 768px) {
              .email-wrapper { padding: 30px 15px !important; }
              .header { padding: 35px 25px !important; }
              .content { padding: 32px 25px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>Order Status Update</h1>
                <p>Your order has been updated</p>
              </div>
              <div class="content">
                <p class="greeting">Hi ${user.name},</p>

                <div class="status-box">
                  <div class="status-icon">
                    ${newStatus === 'Delivered' ? '✓' :
                      newStatus === 'Shipped' ? '📦' :
                      newStatus === 'Confirmed' ? '✓' :
                      newStatus === 'Cancelled' ? '✕' : '⏱'}
                  </div>
                  <div class="status-title">${newStatus}</div>
                  <div class="status-message">${statusMessage}</div>
                  <div class="order-number">Order #${order._id.toString().slice(-8).toUpperCase()}</div>
                </div>

                <p class="message">
                  You can track your order status anytime by logging into your account and visiting the My Orders page.
                </p>

                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/my-orders" class="button">View Order Details</a>
                </div>

                <p class="message" style="margin-top: 24px; text-align: center;">
                  Need help? Our support team is here for you!
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">KitabGhar</div>
                <p>Your trusted bookstore for all your reading needs</p>
                <div style="margin: 16px 0;">
                  <a href="${process.env.FRONTEND_URL}" class="footer-link">Shop</a>
                  <a href="${process.env.FRONTEND_URL}/my-orders" class="footer-link">My Orders</a>
                  <a href="${process.env.FRONTEND_URL}/contact" class="footer-link">Contact</a>
                </div>
                <p style="margin-top: 16px;">© 2026 KitabGhar Bookstore. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  Questions? Email us at <a href="mailto:support@kitabghar.com" style="color: #ea580c;">support@kitabghar.com</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order status email sent to:', user.email);
  } catch (error) {
    console.error('Error sending order status email:', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"KitabGhar Bookstore" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f3f4f6;
            }
            .email-wrapper { background-color: #f3f4f6; padding: 40px 20px; }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content {
              padding: 40px 30px;
              background-color: white;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 16px;
            }
            .message {
              font-size: 15px;
              color: #4b5563;
              margin-bottom: 24px;
              line-height: 1.7;
            }
            .security-box {
              background: linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%);
              padding: 24px;
              margin: 24px 0;
              border-radius: 12px;
              border: 2px solid #fecaca;
            }
            .security-icon {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
              border-radius: 50%;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
              color: white;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);
            }
            .warning-box {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 16px 20px;
              margin: 24px 0;
              border-radius: 8px;
            }
            .warning-title {
              font-size: 14px;
              font-weight: 700;
              color: #92400e;
              margin-bottom: 8px;
            }
            .warning-text {
              font-size: 13px;
              color: #78350f;
              line-height: 1.6;
            }
            .link-box {
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              margin: 16px 0;
              word-break: break-all;
              font-size: 12px;
              color: #6b7280;
              border: 1px solid #e5e7eb;
            }
            .footer {
              background: #f9fafb;
              text-align: center;
              padding: 32px 30px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-logo {
              font-size: 20px;
              font-weight: 700;
              color: #ea580c;
              margin-bottom: 12px;
            }
            .footer-link {
              color: #ea580c;
              text-decoration: none;
              margin: 0 12px;
              font-weight: 500;
            }

            /* Responsive Design - Mobile First */
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 20px 10px !important; }
              .container { border-radius: 12px !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .header p { font-size: 14px !important; }
              .content { padding: 24px 20px !important; }
              .greeting { font-size: 16px !important; }
              .message { font-size: 14px !important; }
              .status-box { padding: 24px 16px !important; margin: 16px 0 !important; }
              .status-icon { width: 60px !important; height: 60px !important; font-size: 32px !important; }
              .status-title { font-size: 22px !important; }
              .status-message { font-size: 14px !important; }
              .order-number { font-size: 16px !important; }
              .order-details { padding: 16px !important; margin: 16px 0 !important; }
              .order-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .feature-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
              }
              .feature-card { padding: 16px !important; }
              .feature-icon { font-size: 32px !important; }
              .feature-title { font-size: 15px !important; }
              .feature-description { font-size: 13px !important; }
              .item { padding: 12px !important; margin: 8px 0 !important; }
              .item-title { font-size: 15px !important; }
              .item-details {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .total-section { padding: 16px !important; }
              .total-row { font-size: 14px !important; }
              .total-row.final .label { font-size: 16px !important; }
              .total-row.final .value { font-size: 20px !important; }
              .shipping-address { padding: 16px !important; }
              .button {
                display: block !important;
                width: 100% !important;
                padding: 12px 24px !important;
                font-size: 14px !important;
                text-align: center !important;
              }
              .footer { padding: 24px 20px !important; }
              .footer-links {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
              }
              .footer-link { margin: 4px 0 !important; display: block !important; }
            }

            /* Tablet Responsive */
            @media only screen and (min-width: 601px) and (max-width: 768px) {
              .email-wrapper { padding: 30px 15px !important; }
              .header { padding: 35px 25px !important; }
              .content { padding: 32px 25px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>Password Reset Request 🔒</h1>
                <p>Secure your account</p>
              </div>
              <div class="content">
                <p class="greeting">Hi ${user.name},</p>
                <p class="message">
                  We received a request to reset your password for your KitabGhar account.
                  Click the button below to create a new password.
                </p>

                <div class="security-box" style="text-align: center;">
                  <div class="security-icon">🔐</div>
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                    This link will expire in <strong style="color: #dc2626;">1 hour</strong>
                  </p>
                  <a href="${resetUrl}" class="button">Reset Your Password</a>
                </div>

                <div class="warning-box">
                  <div class="warning-title">⚠️ Security Notice</div>
                  <div class="warning-text">
                    If you didn't request this password reset, please ignore this email.
                    Your password will remain unchanged and your account is secure.
                  </div>
                </div>

                <p class="message" style="margin-top: 24px;">
                  <strong>Can't click the button?</strong> Copy and paste this URL into your browser:
                </p>
                <div class="link-box">${resetUrl}</div>

                <p class="message" style="margin-top: 24px; font-size: 13px; color: #6b7280;">
                  For security reasons, this link will expire in 1 hour. If you need a new link,
                  please request another password reset from the login page.
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">KitabGhar</div>
                <p>Your trusted bookstore for all your reading needs</p>
                <div style="margin: 16px 0;">
                  <a href="${process.env.FRONTEND_URL}" class="footer-link">Shop</a>
                  <a href="${process.env.FRONTEND_URL}/contact" class="footer-link">Contact Support</a>
                </div>
                <p style="margin-top: 16px;">© 2026 KitabGhar Bookstore. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  Questions? Email us at <a href="mailto:support@kitabghar.com" style="color: #ea580c;">support@kitabghar.com</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', user.email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"KitabGhar Bookstore" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to KitabGhar Bookstore!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background-color: #f3f4f6;
            }
            .email-wrapper { background-color: #f3f4f6; padding: 40px 20px; }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
              background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
              color: white;
              padding: 50px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 12px;
              letter-spacing: -0.5px;
            }
            .header p {
              font-size: 18px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content {
              padding: 40px 30px;
              background-color: white;
            }
            .greeting {
              font-size: 20px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 16px;
            }
            .message {
              font-size: 15px;
              color: #4b5563;
              margin-bottom: 24px;
              line-height: 1.7;
            }
            .features {
              margin: 32px 0;
            }
            .feature {
              background: linear-gradient(to right, #fff7ed 0%, #ffffff 100%);
              padding: 20px;
              margin: 16px 0;
              border-radius: 12px;
              border-left: 4px solid #ea580c;
              display: flex;
              align-items: start;
            }
            .feature-icon {
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              margin-right: 16px;
              flex-shrink: 0;
            }
            .feature-content {
              flex: 1;
            }
            .feature-title {
              font-size: 16px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            }
            .feature-description {
              font-size: 14px;
              color: #6b7280;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
              color: white;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3);
            }
            .footer {
              background: #f9fafb;
              text-align: center;
              padding: 32px 30px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-logo {
              font-size: 24px;
              font-weight: 700;
              color: #ea580c;
              margin-bottom: 12px;
            }
            .footer-link {
              color: #ea580c;
              text-decoration: none;
              margin: 0 12px;
              font-weight: 500;
            }

            /* Responsive Design - Mobile First */
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 20px 10px !important; }
              .container { border-radius: 12px !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .header p { font-size: 14px !important; }
              .content { padding: 24px 20px !important; }
              .greeting { font-size: 16px !important; }
              .message { font-size: 14px !important; }
              .status-box { padding: 24px 16px !important; margin: 16px 0 !important; }
              .status-icon { width: 60px !important; height: 60px !important; font-size: 32px !important; }
              .status-title { font-size: 22px !important; }
              .status-message { font-size: 14px !important; }
              .order-number { font-size: 16px !important; }
              .order-details { padding: 16px !important; margin: 16px 0 !important; }
              .order-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .feature-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
              }
              .feature-card { padding: 16px !important; }
              .feature-icon { font-size: 32px !important; }
              .feature-title { font-size: 15px !important; }
              .feature-description { font-size: 13px !important; }
              .item { padding: 12px !important; margin: 8px 0 !important; }
              .item-title { font-size: 15px !important; }
              .item-details {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .total-section { padding: 16px !important; }
              .total-row { font-size: 14px !important; }
              .total-row.final .label { font-size: 16px !important; }
              .total-row.final .value { font-size: 20px !important; }
              .shipping-address { padding: 16px !important; }
              .button {
                display: block !important;
                width: 100% !important;
                padding: 12px 24px !important;
                font-size: 14px !important;
                text-align: center !important;
              }
              .footer { padding: 24px 20px !important; }
              .footer-links {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
              }
              .footer-link { margin: 4px 0 !important; display: block !important; }
            }

            /* Tablet Responsive */
            @media only screen and (min-width: 601px) and (max-width: 768px) {
              .email-wrapper { padding: 30px 15px !important; }
              .header { padding: 35px 25px !important; }
              .content { padding: 32px 25px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>Welcome to KitabGhar! 📚</h1>
                <p>Your reading journey starts here</p>
              </div>
              <div class="content">
                <p class="greeting">Hi ${user.name},</p>
                <p class="message">
                  Thank you for joining KitabGhar Bookstore! We're thrilled to have you as part of our reading community.
                  Get ready to discover thousands of amazing books across all genres.
                </p>

                <div class="features">
                  <div class="feature">
                    <div class="feature-icon">📖</div>
                    <div class="feature-content">
                      <div class="feature-title">Vast Collection</div>
                      <div class="feature-description">Browse thousands of books across various genres and discover your next favorite read</div>
                    </div>
                  </div>

                  <div class="feature">
                    <div class="feature-icon">❤️</div>
                    <div class="feature-content">
                      <div class="feature-title">Wishlist & Favorites</div>
                      <div class="feature-description">Save books you love and get notified about price drops and new releases</div>
                    </div>
                  </div>

                  <div class="feature">
                    <div class="feature-icon">🎁</div>
                    <div class="feature-content">
                      <div class="feature-title">Exclusive Deals</div>
                      <div class="feature-description">Get access to member-only discounts and special offers on bestsellers</div>
                    </div>
                  </div>

                  <div class="feature">
                    <div class="feature-icon">🚚</div>
                    <div class="feature-content">
                      <div class="feature-title">Fast Delivery</div>
                      <div class="feature-description">Track your orders easily and enjoy quick, reliable shipping to your doorstep</div>
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/books" class="button">Start Shopping Now</a>
                </div>

                <p class="message" style="margin-top: 32px; text-align: center;">
                  Happy reading! 📚✨
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">KitabGhar</div>
                <p>Your trusted bookstore for all your reading needs</p>
                <div style="margin: 16px 0;">
                  <a href="${process.env.FRONTEND_URL}" class="footer-link">Shop</a>
                  <a href="${process.env.FRONTEND_URL}/books" class="footer-link">Browse Books</a>
                  <a href="${process.env.FRONTEND_URL}/contact" class="footer-link">Contact</a>
                </div>
                <p style="margin-top: 16px;">© 2026 KitabGhar Bookstore. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  Questions? Email us at <a href="mailto:support@kitabghar.com" style="color: #ea580c;">support@kitabghar.com</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};
