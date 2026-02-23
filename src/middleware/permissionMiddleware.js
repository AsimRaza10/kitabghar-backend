import TeamMember from '../models/TeamMember.js';

// Check if user has specific permission
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.tenant) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Store owner has all permissions for their store
      if (req.user.tenantRole === 'owner' &&
          req.user.tenant.toString() === req.tenant._id.toString()) {
        return next();
      }

      // Check team member permissions
      const teamMember = await TeamMember.findOne({
        tenant: req.tenant._id,
        user: req.user._id,
        status: 'active',
        isActive: true
      });

      if (!teamMember) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this store'
        });
      }

      // Check specific permission
      if (!teamMember.permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${permission.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        });
      }

      req.teamMember = teamMember;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Check if user is store owner
export const isStoreOwner = async (req, res, next) => {
  try {
    if (!req.user || !req.tenant) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super admin can access all stores
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user is the store owner
    if (req.user.tenantRole === 'owner' &&
        req.user.tenant.toString() === req.tenant._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Only store owners can perform this action'
    });
  } catch (error) {
    console.error('Store owner check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking store ownership'
    });
  }
};

// Check if user is super admin
export const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

// Check if user can manage team
export const canManageTeam = checkPermission('manageTeam');

// Check if user can manage books
export const canManageBooks = checkPermission('manageBooks');

// Check if user can manage orders
export const canManageOrders = checkPermission('manageOrders');

// Check if user can manage customers
export const canManageCustomers = checkPermission('manageCustomers');

// Check if user can manage settings
export const canManageSettings = checkPermission('manageSettings');

// Check if user can view analytics
export const canViewAnalytics = checkPermission('viewAnalytics');
