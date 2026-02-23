import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), uploadImage);
router.delete('/:publicId', protect, admin, deleteImage);

export default router;
