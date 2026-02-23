import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getAdminAnalytics,
  downloadInvoice
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalTenant, extractTenant, ensureTenantMember, checkSubscription } from '../middleware/tenantMiddleware.js';
import { canManageOrders } from '../middleware/permissionMiddleware.js';
import { checkOrdersLimit, incrementUsage } from '../middleware/usageLimitMiddleware.js';
import { orderLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Protected routes with tenant context
router.post('/',
  protect,
  orderLimiter,
  optionalTenant,
  createOrder
);

router.get('/myorders',
  protect,
  optionalTenant,
  getMyOrders
);

// Admin analytics route (must come before /:id)
router.get('/admin/analytics',
  protect,
  admin,
  optionalTenant,
  getAdminAnalytics
);

// Download invoice route (must come before /:id)
router.get('/:id/invoice',
  protect,
  optionalTenant,
  downloadInvoice
);

router.get('/:id',
  protect,
  optionalTenant,
  getOrderById
);

// Cancel order route (user)
router.put('/:id/cancel',
  protect,
  optionalTenant,
  cancelOrder
);

// Admin/Store staff routes
router.get('/',
  protect,
  admin,
  optionalTenant,
  getAllOrders
);

router.put('/:id/status',
  protect,
  admin,
  optionalTenant,
  updateOrderStatus
);

export default router;
