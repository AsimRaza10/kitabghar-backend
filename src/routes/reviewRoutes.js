import express from 'express';
import {
  createReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { reviewLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public routes
router.get('/book/:bookId', getBookReviews);

// Protected routes
router.post('/', protect, reviewLimiter, createReview);
router.get('/user', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markReviewHelpful);

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews);

export default router;
