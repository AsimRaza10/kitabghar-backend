import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  moveToCart
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getWishlist);
router.post('/:bookId', protect, addToWishlist);
router.delete('/:bookId', protect, removeFromWishlist);
router.put('/:bookId/toggle', protect, toggleWishlist);
router.delete('/', protect, clearWishlist);
router.post('/:bookId/move-to-cart', protect, moveToCart);

export default router;
