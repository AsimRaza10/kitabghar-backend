import express from 'express';
import {
  getStoreSettings,
  updateStoreSettings,
  updateStoreTheme,
  updateCustomDomain,
  getStoreAnalytics,
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember
} from '../controllers/storeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, ensureTenantMember } from '../middleware/tenantMiddleware.js';
import { isStoreOwner, canManageTeam, canViewAnalytics, canManageSettings } from '../middleware/permissionMiddleware.js';
import { checkSubscription } from '../middleware/tenantMiddleware.js';
import { checkTeamMembersLimit } from '../middleware/usageLimitMiddleware.js';

const router = express.Router();

// All routes require authentication and tenant context
router.use(protect);
router.use(extractTenant);
router.use(ensureTenantMember);
router.use(checkSubscription);

// Store settings routes
router.get('/settings', getStoreSettings);
router.put('/settings', canManageSettings, updateStoreSettings);
router.put('/theme', canManageSettings, updateStoreTheme);
router.put('/domain', isStoreOwner, updateCustomDomain);

// Analytics routes
router.get('/analytics', canViewAnalytics, getStoreAnalytics);

// Team management routes
router.get('/team', canManageTeam, getTeamMembers);
router.post('/team', canManageTeam, checkTeamMembersLimit, inviteTeamMember);
router.put('/team/:id', canManageTeam, updateTeamMember);
router.delete('/team/:id', canManageTeam, removeTeamMember);

export default router;
