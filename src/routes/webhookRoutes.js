import express from 'express';
import {
  createWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook
} from '../controllers/webhookController.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, ensureTenantMember } from '../middleware/tenantMiddleware.js';
import { isStoreOwner } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication and store owner permission
router.use(protect);
router.use(extractTenant);
router.use(ensureTenantMember);
router.use(isStoreOwner);

router.post('/', createWebhook);
router.get('/', getWebhooks);
router.put('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);
router.post('/:id/test', testWebhook);

export default router;
