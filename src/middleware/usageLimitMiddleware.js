import Usage from '../models/Usage.js';
import Plan from '../models/Plan.js';

// Get current period (YYYY-MM format)
const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Get or create usage record for current period
const getUsageRecord = async (tenantId, planId) => {
  const period = getCurrentPeriod();

  let usage = await Usage.findOne({ tenant: tenantId, period });

  if (!usage) {
    const plan = await Plan.findById(planId);
    usage = await Usage.create({
      tenant: tenantId,
      period,
      limits: {
        maxBooks: plan.features.maxBooks,
        maxOrders: plan.features.maxOrders,
        maxStorage: plan.features.maxStorage,
        maxTeamMembers: plan.features.maxTeamMembers
      }
    });
  }

  return usage;
};

// Check if tenant can add more books
export const checkBooksLimit = async (req, res, next) => {
  try {
    if (!req.tenant || !req.subscription) {
      return res.status(400).json({
        success: false,
        message: 'Tenant and subscription context required'
      });
    }

    const usage = await getUsageRecord(req.tenant._id, req.subscription.plan._id);

    if (usage.isLimitExceeded('books')) {
      return res.status(403).json({
        success: false,
        message: `You have reached your plan limit of ${usage.limits.maxBooks} books. Please upgrade your plan.`,
        limit: usage.limits.maxBooks,
        current: usage.metrics.booksCount
      });
    }

    req.usage = usage;
    next();
  } catch (error) {
    console.error('Books limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking books limit'
    });
  }
};

// Check if tenant can create more orders
export const checkOrdersLimit = async (req, res, next) => {
  try {
    if (!req.tenant || !req.subscription) {
      return res.status(400).json({
        success: false,
        message: 'Tenant and subscription context required'
      });
    }

    const usage = await getUsageRecord(req.tenant._id, req.subscription.plan._id);

    if (usage.isLimitExceeded('orders')) {
      return res.status(403).json({
        success: false,
        message: `You have reached your plan limit of ${usage.limits.maxOrders} orders per month. Please upgrade your plan.`,
        limit: usage.limits.maxOrders,
        current: usage.metrics.ordersCount
      });
    }

    req.usage = usage;
    next();
  } catch (error) {
    console.error('Orders limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking orders limit'
    });
  }
};

// Check storage limit
export const checkStorageLimit = async (req, res, next) => {
  try {
    if (!req.tenant || !req.subscription) {
      return res.status(400).json({
        success: false,
        message: 'Tenant and subscription context required'
      });
    }

    const usage = await getUsageRecord(req.tenant._id, req.subscription.plan._id);

    // Get file size from request (in MB)
    const fileSizeMB = req.file ? req.file.size / (1024 * 1024) : 0;

    if (usage.limits.maxStorage !== -1 &&
        (usage.metrics.storageUsed + fileSizeMB) > usage.limits.maxStorage) {
      return res.status(403).json({
        success: false,
        message: `Storage limit exceeded. Your plan allows ${usage.limits.maxStorage}MB. Please upgrade your plan.`,
        limit: usage.limits.maxStorage,
        current: usage.metrics.storageUsed
      });
    }

    req.usage = usage;
    next();
  } catch (error) {
    console.error('Storage limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking storage limit'
    });
  }
};

// Check team members limit
export const checkTeamMembersLimit = async (req, res, next) => {
  try {
    if (!req.tenant || !req.subscription) {
      return res.status(400).json({
        success: false,
        message: 'Tenant and subscription context required'
      });
    }

    const usage = await getUsageRecord(req.tenant._id, req.subscription.plan._id);

    if (usage.isLimitExceeded('teamMembers')) {
      return res.status(403).json({
        success: false,
        message: `You have reached your plan limit of ${usage.limits.maxTeamMembers} team members. Please upgrade your plan.`,
        limit: usage.limits.maxTeamMembers,
        current: usage.metrics.teamMembersCount
      });
    }

    req.usage = usage;
    next();
  } catch (error) {
    console.error('Team members limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking team members limit'
    });
  }
};

// Increment usage counter
export const incrementUsage = (metric) => {
  return async (req, res, next) => {
    try {
      if (!req.tenant || !req.usage) {
        return next();
      }

      const metricKey = `metrics.${metric}Count`;
      await Usage.findByIdAndUpdate(req.usage._id, {
        $inc: { [metricKey]: 1 }
      });

      next();
    } catch (error) {
      console.error('Usage increment error:', error);
      next();
    }
  };
};

// Decrement usage counter
export const decrementUsage = (metric) => {
  return async (tenantId, amount = 1) => {
    try {
      const period = getCurrentPeriod();
      const metricKey = `metrics.${metric}Count`;

      await Usage.findOneAndUpdate(
        { tenant: tenantId, period },
        { $inc: { [metricKey]: -amount } }
      );
    } catch (error) {
      console.error('Usage decrement error:', error);
    }
  };
};

// Update storage usage
export const updateStorageUsage = async (tenantId, sizeMB) => {
  try {
    const period = getCurrentPeriod();

    await Usage.findOneAndUpdate(
      { tenant: tenantId, period },
      { $inc: { 'metrics.storageUsed': sizeMB } }
    );
  } catch (error) {
    console.error('Storage usage update error:', error);
  }
};
