import Tenant from '../models/Tenant.js';
import TeamMember from '../models/TeamMember.js';
import User from '../models/User.js';

// Get store settings
export const getStoreSettings = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenant._id).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      store: tenant
    });
  } catch (error) {
    console.error('Get store settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store settings'
    });
  }
};

// Update store settings
export const updateStoreSettings = async (req, res) => {
  try {
    const { name, settings } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (settings) updateData.settings = { ...req.tenant.settings, ...settings };

    const tenant = await Tenant.findByIdAndUpdate(
      req.tenant._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      store: tenant
    });
  } catch (error) {
    console.error('Update store settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating store settings'
    });
  }
};

// Update store theme
export const updateStoreTheme = async (req, res) => {
  try {
    const { primaryColor, secondaryColor, fontFamily } = req.body;

    const tenant = await Tenant.findById(req.tenant._id);

    if (primaryColor) tenant.settings.primaryColor = primaryColor;
    if (secondaryColor) tenant.settings.secondaryColor = secondaryColor;
    if (fontFamily) tenant.settings.fontFamily = fontFamily;

    await tenant.save();

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      theme: {
        primaryColor: tenant.settings.primaryColor,
        secondaryColor: tenant.settings.secondaryColor,
        fontFamily: tenant.settings.fontFamily
      }
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating theme'
    });
  }
};

// Update custom domain
export const updateCustomDomain = async (req, res) => {
  try {
    const { customDomain } = req.body;

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    if (customDomain && !domainRegex.test(customDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format'
      });
    }

    // Check if domain is already taken
    if (customDomain) {
      const existingTenant = await Tenant.findOne({
        customDomain,
        _id: { $ne: req.tenant._id }
      });

      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: 'This domain is already in use'
        });
      }
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.tenant._id,
      { customDomain: customDomain || null },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: customDomain ? 'Custom domain updated successfully' : 'Custom domain removed',
      customDomain: tenant.customDomain,
      url: tenant.url
    });
  } catch (error) {
    console.error('Update custom domain error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating custom domain'
    });
  }
};

// Get store analytics
export const getStoreAnalytics = async (req, res) => {
  try {
    const Book = (await import('../models/Book.js')).default;
    const Order = (await import('../models/Order.js')).default;

    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total books
    const totalBooks = await Book.countDocuments({
      tenant: req.tenant._id,
      isActive: true
    });

    // Get total orders
    const totalOrders = await Order.countDocuments({
      tenant: req.tenant._id
    });

    // Get orders in period
    const ordersInPeriod = await Order.countDocuments({
      tenant: req.tenant._id,
      createdAt: { $gte: startDate }
    });

    // Get revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          tenant: req.tenant._id,
          isPaid: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0 };

    // Get top selling books
    const topBooks = await Order.aggregate([
      {
        $match: {
          tenant: req.tenant._id,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          author: '$book.author',
          image: '$book.image',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    // Get order status breakdown
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          tenant: req.tenant._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily sales for chart
    const dailySales = await Order.aggregate([
      {
        $match: {
          tenant: req.tenant._id,
          isPaid: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalBooks,
          totalOrders,
          ordersInPeriod,
          totalRevenue: revenue.totalRevenue,
          averageOrderValue: revenue.averageOrderValue
        },
        topBooks,
        ordersByStatus,
        dailySales
      }
    });
  } catch (error) {
    console.error('Get store analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store analytics'
    });
  }
};

// Get team members
export const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({
      tenant: req.tenant._id,
      isActive: true
    }).populate('user', 'name email').populate('invitedBy', 'name');

    res.status(200).json({
      success: true,
      teamMembers
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members'
    });
  }
};

// Invite team member
export const inviteTeamMember = async (req, res) => {
  try {
    const { email, role, permissions } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create pending user account
      const tempPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        name: email.split('@')[0],
        email,
        password: tempPassword,
        role: 'store_staff',
        tenant: req.tenant._id,
        tenantRole: role || 'staff'
      });
    }

    // Check if already a team member
    const existingMember = await TeamMember.findOne({
      tenant: req.tenant._id,
      user: user._id
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    // Create team member
    const teamMember = await TeamMember.create({
      tenant: req.tenant._id,
      user: user._id,
      role: role || 'staff',
      permissions: permissions || {},
      invitedBy: req.user._id,
      status: 'pending'
    });

    // TODO: Send invitation email

    res.status(201).json({
      success: true,
      message: 'Team member invited successfully',
      teamMember
    });
  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error inviting team member'
    });
  }
};

// Update team member
export const updateTeamMember = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    const teamMember = await TeamMember.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    if (role) teamMember.role = role;
    if (permissions) teamMember.permissions = { ...teamMember.permissions, ...permissions };

    await teamMember.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      teamMember
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team member'
    });
  }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Don't allow removing owner
    if (teamMember.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove store owner'
      });
    }

    teamMember.isActive = false;
    await teamMember.save();

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member'
    });
  }
};
