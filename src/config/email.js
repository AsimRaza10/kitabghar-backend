import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Check if email is configured
const isEmailConfigured = process.env.EMAIL_USER &&
                          process.env.EMAIL_PASSWORD &&
                          process.env.EMAIL_USER !== 'your-email@gmail.com';

let transporter = null;

if (isEmailConfigured) {
  // Create transporter
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.warn('Email not configured. Email notifications will be skipped.');
}

export default transporter;
