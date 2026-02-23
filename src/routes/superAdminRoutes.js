import express from 'express';
import {
  getPlatformOverview,
  getAllStores,
  getStoreDetails,
  updateStoreStatus,
  deleteStore,
  getAllUsers,
  getRevenueAnalytics
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isSuperAdmin } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes require super admin authentication
router.use(protect);
router.use(isSuperAdmin);

// Platform overview
router.get('/overview', getPlatformOverview);

// Store management
router.get('/stores', getAllStores);
router.get('/stores/:id', getStoreDetails);
router.put('/stores/:id/status', updateStoreStatus);
router.delete('/stores/:id', deleteStore);

// User management
router.get('/users', getAllUsers);

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);

export default router;
