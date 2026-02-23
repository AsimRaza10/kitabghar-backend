import express from 'express';
import {
  checkSubdomain,
  createStore,
  setupPaymentMethod,
  completeOnboarding
} from '../controllers/onboardingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, optionalTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// Public routes
router.post('/check-subdomain', checkSubdomain);
router.post('/create-store', createStore);

// Protected routes
router.post('/setup-payment', protect, extractTenant, setupPaymentMethod);
router.post('/complete', protect, extractTenant, completeOnboarding);

export default router;
