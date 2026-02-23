import express from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalTenant, extractTenant, ensureTenantMember, checkSubscription } from '../middleware/tenantMiddleware.js';
import { canManageBooks } from '../middleware/permissionMiddleware.js';
import { checkBooksLimit, incrementUsage } from '../middleware/usageLimitMiddleware.js';

const router = express.Router();

// Public routes with optional tenant context
router.get('/', optionalTenant, getBooks);
router.get('/:id', optionalTenant, getBook);

// Protected routes with tenant context and permissions
router.post('/',
  protect,
  admin,
  optionalTenant,
  createBook
);

router.put('/:id',
  protect,
  admin,
  optionalTenant,
  updateBook
);

router.delete('/:id',
  protect,
  admin,
  optionalTenant,
  deleteBook
);

export default router;
