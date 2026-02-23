import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import Invoice from '../models/Invoice.js';

// Get platform overview
export const getPlatformOverview = async (req, res) => {
  try {
    // Total stores
    const totalStores = await Tenant.countDocuments();
    const activeStores = await Tenant.countDocuments({ status: 'active' });
    const trialStores = await Tenant.countDocuments({ status: 'trial' });
    const suspendedStores = await Tenant.countDocuments({ status: 'suspended' });

    // Total users
    const totalUsers = await User.countDocuments();
    const storeOwners = await User.countDocuments({ role: 'store_owner' });
    const customers = await User.countDocuments({ role: 'user' });

    // Total subscriptions
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const trialingSubscriptions = await Subscription.countDocuments({ status: 'trialing' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });

    // Revenue calculations
    const revenueData = await Subscription.aggregate([
      {
        $match: { status: { $in: ['active', 'trialing'] } }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planData'
        }
      },
      { $unwind: '$planData' },
      {
        $group: {
          _id: null,
          mrr: {
            $sum: {
              $cond: [
                { $eq: ['$billingCycle', 'monthly'] },
                '$planData.price.monthly',
                { $divide: ['$planData.price.yearly', 12] }
              ]
            }
          }
        }
      }
    ]);

    const mrr = revenueData[0]?.mrr || 0;
    const arr = mrr * 12;

    // Recent stores
    const recentStores = await Tenant.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('owner', 'name email')
      .populate('subscription');

    // Stores by plan
    const storesByPlan = await Subscription.aggregate([
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planData'
        }
      },
      { $unwind: '$planData' },
      {
        $group: {
          _id: '$planData.name',
          count: { $sum: 1 }
        }
      }
    ]);

    // Growth metrics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newStoresLast30Days = await Tenant.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const cancelledLast30Days = await Subscription.countDocuments({
      status: 'cancelled',
      cancelledAt: { $gte: thirtyDaysAgo }
    });

    // Churn rate
    const churnRate = activeSubscriptions > 0
      ? (cancelledLast30Days / activeSubscriptions) * 100
      : 0;

    res.status(200).json({
      success: true,
      overview: {
        stores: {
          total: totalStores,
          active: activeStores,
          trial: trialStores,
          suspended: suspendedStores
        },
        users: {
          total: totalUsers,
          storeOwners,
          customers
        },
        subscriptions: {
          active: activeSubscriptions,
          trialing: trialingSubscriptions,
          cancelled: cancelledSubscriptions
        },
        revenue: {
          mrr: Math.round(mrr * 100) / 100,
          arr: Math.round(arr * 100) / 100
        },
        growth: {
          newStoresLast30Days,
          cancelledLast30Days,
          churnRate: Math.round(churnRate * 100) / 100
        },
        storesByPlan,
        recentStores
      }
    });
  } catch (error) {
    console.error('Get platform overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform overview'
    });
  }
};

// Get all stores
export const getAllStores = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } }
      ];
    }

    const stores = await Tenant.find(query)
      .populate('owner', 'name email')
      .populate({
        path: 'subscription',
        populate: { path: 'plan', select: 'name displayName' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tenant.countDocuments(query);

    res.status(200).json({
      success: true,
      stores,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores'
    });
  }
};

// Get single store details
export const getStoreDetails = async (req, res) => {
  try {
    const store = await Tenant.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'subscription',
        populate: { path: 'plan' }
      });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get store statistics
    const totalBooks = await Book.countDocuments({ tenant: store._id });
    const totalOrders = await Order.countDocuments({ tenant: store._id });
    const totalRevenue = await Order.aggregate([
      { $match: { tenant: store._id, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.status(200).json({
      success: true,
      store,
      statistics: {
        totalBooks,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get store details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store details'
    });
  }
};

// Update store status
export const updateStoreStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const store = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store status updated successfully',
      store
    });
  } catch (error) {
    console.error('Update store status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating store status'
    });
  }
};

// Delete store
export const deleteStore = async (req, res) => {
  try {
    const store = await Tenant.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Cancel subscription if exists
    const subscription = await Subscription.findOne({ tenant: store._id });
    if (subscription && subscription.stripeSubscriptionId) {
      const stripe = (await import('stripe')).default;
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
      await stripeClient.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Delete all related data
    await Book.deleteMany({ tenant: store._id });
    await Order.deleteMany({ tenant: store._id });
    await Subscription.deleteMany({ tenant: store._id });
    await Invoice.deleteMany({ tenant: store._id });

    // Delete store
    await store.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting store'
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('tenant', 'name subdomain')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '12m' } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '12m':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    // Monthly revenue
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$paidAt' }
          },
          revenue: { $sum: '$amount.total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by plan
    const revenueByPlan = await Subscription.aggregate([
      {
        $match: { status: { $in: ['active', 'trialing'] } }
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planData'
        }
      },
      { $unwind: '$planData' },
      {
        $group: {
          _id: '$planData.name',
          count: { $sum: 1 },
          mrr: {
            $sum: {
              $cond: [
                { $eq: ['$billingCycle', 'monthly'] },
                '$planData.price.monthly',
                { $divide: ['$planData.price.yearly', 12] }
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        monthlyRevenue,
        revenueByPlan
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics'
    });
  }
};
