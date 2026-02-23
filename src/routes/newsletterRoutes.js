import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers
} from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin only route
router.get('/subscribers', protect, admin, getSubscribers);

export default router;
