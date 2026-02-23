import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getAllUsers,
  changePassword,
  deleteAddress
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

router.route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.route('/cart/:bookId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;
