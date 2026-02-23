import express from 'express';
import {
  createStripeCustomer,
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getInvoices,
  createBillingPortalSession,
  handleStripeWebhook
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, ensureTenantMember } from '../middleware/tenantMiddleware.js';
import { isStoreOwner } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// Webhook route (no auth required, verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.use(protect);
router.use(extractTenant);
router.use(ensureTenantMember);

// Customer routes
router.post('/customer', createStripeCustomer);

// Subscription routes (store owner only)
router.post('/', isStoreOwner, createSubscription);
router.get('/', getSubscription);
router.put('/', isStoreOwner, updateSubscription);
router.post('/cancel', isStoreOwner, cancelSubscription);
router.post('/reactivate', isStoreOwner, reactivateSubscription);

// Billing routes
router.get('/invoices', getInvoices);
router.post('/billing-portal', isStoreOwner, createBillingPortalSession);

export default router;
