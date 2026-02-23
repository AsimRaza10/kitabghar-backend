import Tenant from '../models/Tenant.js';
import Subscription from '../models/Subscription.js';

// Extract tenant from subdomain or custom domain
export const extractTenant = async (req, res, next) => {
  try {
    let tenant = null;

    // Check for tenant in header (for API calls)
    const tenantId = req.headers['x-tenant-id'];
    if (tenantId) {
      tenant = await Tenant.findById(tenantId);
    }

    // Check for subdomain
    if (!tenant) {
      const host = req.headers.host || req.hostname;
      const subdomain = host.split('.')[0];

      // Check if it's a subdomain (not www or main domain)
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        tenant = await Tenant.findOne({ subdomain });
      }

      // Check for custom domain
      if (!tenant) {
        tenant = await Tenant.findOne({ customDomain: host });
      }
    }

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check if tenant is active
    if (!tenant.canAccess()) {
      return res.status(403).json({
        success: false,
        message: 'Store is not accessible. Please check your subscription status.'
      });
    }

    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error identifying store'
    });
  }
};

// Scope queries to tenant
export const scopeToTenant = (req, res, next) => {
  if (!req.tenant) {
    return res.status(400).json({
      success: false,
      message: 'Tenant context is required'
    });
  }

  // Store original query methods
  const originalFind = req.app.locals.mongoose?.Model?.find;

  // Add tenant filter to all queries
  req.tenantFilter = { tenant: req.tenant._id };

  next();
};

// Check subscription status
export const checkSubscription = async (req, res, next) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context is required'
      });
    }

    // Get subscription
    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    }).populate('plan');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Check if subscription is active
    if (!subscription.isActive() && !subscription.isInGracePeriod()) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active. Please update your payment method.'
      });
    }

    // Attach subscription to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

// Optional tenant extraction (doesn't fail if no tenant)
export const optionalTenant = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'];
    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (tenant && tenant.canAccess()) {
        req.tenant = tenant;
      }
    }
    next();
  } catch (error) {
    console.error('Optional tenant extraction error:', error);
    next();
  }
};

// Ensure user belongs to tenant
export const ensureTenantMember = async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      return res.status(400).json({
        success: false,
        message: 'Tenant and user context required'
      });
    }

    // Check if user belongs to this tenant
    if (req.user.tenant && req.user.tenant.toString() !== req.tenant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this store'
      });
    }

    next();
  } catch (error) {
    console.error('Tenant member check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying store access'
    });
  }
};
