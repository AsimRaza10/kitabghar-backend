import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send welcome email
export const sendWelcomeEmail = async (to, name, storeName, storeUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'KitabGhar'}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Welcome to ${storeName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Welcome to ${storeName}!</h1>
          <p>Hi ${name},</p>
          <p>Congratulations! Your online bookstore is now live and ready to accept orders.</p>
          <p><strong>Your store URL:</strong> <a href="${storeUrl}">${storeUrl}</a></p>
          <h3>Next Steps:</h3>
          <ul>
            <li>Add your first books to the catalog</li>
            <li>Customize your store theme and settings</li>
            <li>Invite team members to help manage your store</li>
            <li>Set up your payment method for subscription billing</li>
          </ul>
          <p>You're currently on a 14-day free trial. No credit card required!</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The KitabGhar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', to);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send team invitation email
export const sendTeamInviteEmail = async (to, inviterName, storeName, storeUrl, role) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'KitabGhar'}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `You've been invited to join ${storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Team Invitation</h1>
          <p>Hi there,</p>
          <p>${inviterName} has invited you to join <strong>${storeName}</strong> as a <strong>${role}</strong>.</p>
          <p>Click the link below to accept the invitation and get started:</p>
          <p><a href="${storeUrl}/accept-invite" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a></p>
          <p>If you have any questions, please contact ${inviterName} or our support team.</p>
          <p>Best regards,<br>The KitabGhar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Team invite email sent to:', to);
  } catch (error) {
    console.error('Error sending team invite email:', error);
  }
};

// Send subscription update email
export const sendSubscriptionUpdateEmail = async (to, name, planName, status) => {
  try {
    const transporter = createTransporter();

    let subject, message;
    if (status === 'active') {
      subject = 'Subscription Activated';
      message = `Your subscription to the <strong>${planName}</strong> plan has been activated successfully.`;
    } else if (status === 'cancelled') {
      subject = 'Subscription Cancelled';
      message = `Your subscription has been cancelled. You will continue to have access until the end of your billing period.`;
    } else if (status === 'past_due') {
      subject = 'Payment Failed';
      message = `We were unable to process your payment. Please update your payment method to avoid service interruption.`;
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'KitabGhar'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Subscription Update</h1>
          <p>Hi ${name},</p>
          <p>${message}</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The KitabGhar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Subscription update email sent to:', to);
  } catch (error) {
    console.error('Error sending subscription update email:', error);
  }
};

// Send usage limit warning email
export const sendUsageLimitWarningEmail = async (to, name, storeName, limitType, current, max) => {
  try {
    const transporter = createTransporter();

    const percentage = Math.round((current / max) * 100);

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'KitabGhar'}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Usage Limit Warning - ${storeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F59E0B;">Usage Limit Warning</h1>
          <p>Hi ${name},</p>
          <p>Your store <strong>${storeName}</strong> has reached <strong>${percentage}%</strong> of your ${limitType} limit.</p>
          <p><strong>Current usage:</strong> ${current} / ${max}</p>
          <p>Consider upgrading your plan to avoid service interruption.</p>
          <p><a href="${process.env.APP_URL}/dashboard/billing" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Upgrade Plan</a></p>
          <p>Best regards,<br>The KitabGhar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Usage limit warning email sent to:', to);
  } catch (error) {
    console.error('Error sending usage limit warning email:', error);
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (to, name, orderNumber, total, items) => {
  try {
    const transporter = createTransporter();

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'KitabGhar'}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Order Confirmation - #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Order Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for your order! We've received your order and will process it shortly.</p>
          <p><strong>Order Number:</strong> #${orderNumber}</p>
          <h3>Order Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Quantity</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <p style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 16px;">Total: $${total.toFixed(2)}</p>
          <p>We'll send you another email when your order ships.</p>
          <p>Best regards,<br>The KitabGhar Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', to);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};
