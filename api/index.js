import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import passport from './src/config/passport.js';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import bookRoutes from './src/routes/bookRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import subscriptionRoutes from './src/routes/subscriptionRoutes.js';
import planRoutes from './src/routes/planRoutes.js';
import onboardingRoutes from './src/routes/onboardingRoutes.js';
import storeRoutes from './src/routes/storeRoutes.js';
import superAdminRoutes from './src/routes/superAdminRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';
import apiRoutes from './src/routes/apiRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import wishlistRoutes from './src/routes/wishlistRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';
import { apiLimiter } from './src/middleware/rateLimitMiddleware.js';

dotenv.config();

const app = express();

// Connect to MongoDB (only once)
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  await connectDB();
  isConnected = true;
};

// Webhook route (must be before express.json middleware)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentRoutes);

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Prevent XSS attacks

// Performance Middleware
app.use(compression()); // Compress all responses

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running on Vercel' });
});

// Error handling middleware
app.use(errorHandler);

// For Vercel serverless
export default async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Server running on port ${PORT}`);
  });
}
