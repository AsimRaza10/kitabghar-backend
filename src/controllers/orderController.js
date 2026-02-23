import Order from '../models/Order.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/emailService.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    console.log('Creating order with data:', { items, shippingAddress, paymentMethod });

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    if (!shippingAddress) {
      res.status(400);
      throw new Error('Shipping address is required');
    }

    if (!paymentMethod) {
      res.status(400);
      throw new Error('Payment method is required');
    }

    // Calculate prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate item structure
      if (!item.book || !item.quantity || !item.price) {
        res.status(400);
        throw new Error('Invalid order item structure');
      }

      const query = { _id: item.book };

      // Add tenant filter for multi-tenancy
      if (req.tenant) {
        query.tenant = req.tenant._id;
      }

      const book = await Book.findOne(query);
      if (!book) {
        res.status(404);
        throw new Error(`Book not found: ${item.book}`);
      }

      if (!book.isActive) {
        res.status(400);
        throw new Error(`Book is not available: ${book.title}`);
      }

      if (book.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${book.title}`);
      }

      const itemTotal = book.offerPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        book: book._id,
        bookSnapshot: {
          title: book.title,
          author: book.author,
          image: book.image
        },
        quantity: item.quantity,
        price: book.offerPrice
      });

      // Update book stock
      book.stock -= item.quantity;
      await book.save();
    }

    const shippingCost = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      isPaid: paymentMethod === 'COD' ? false : false,
      status: 'Processing'
    };

    // Add tenant for multi-tenancy (optional for backward compatibility)
    if (req.tenant) {
      orderData.tenant = req.tenant._id;
    }

    const order = await Order.create(orderData);

    // Send order confirmation email (non-blocking)
    const populatedOrder = await Order.findById(order._id).populate('items.book');
    sendOrderConfirmationEmail(populatedOrder, req.user).catch(err =>
      console.error('Order confirmation email error:', err)
    );

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const query = { user: req.user._id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const orders = await Order.find(query)
      .populate('items.book')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('items.book')
      .lean();

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if user owns the order or is admin/store staff
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isStoreStaff = req.user.role === 'admin' || req.user.role === 'store_owner' || req.user.role === 'store_manager';

    if (!isOwner && !isStoreStaff) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const query = {};

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.book')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const order = await Order.findOne(query);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.status = status;

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Send order status update email (non-blocking)
    const user = await User.findById(order.user);
    if (user) {
      sendOrderStatusEmail(updatedOrder, user, status).catch(err =>
        console.error('Order status email error:', err)
      );
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const order = await Order.findOne(query).populate('items.book');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    // Check if order can be cancelled
    if (order.status === 'Cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'Delivered') {
      res.status(400);
      throw new Error('Cannot cancel a delivered order');
    }

    if (order.status === 'Shipped') {
      res.status(400);
      throw new Error('Cannot cancel a shipped order. Please contact support.');
    }

    // Restore book stock
    for (const item of order.items) {
      const book = await Book.findById(item.book._id);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    // Update order status
    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const query = {};

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    // Total revenue
    const revenueData = await Order.aggregate([
      { $match: { ...query, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          ...query,
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top selling books
    const topBooks = await Order.aggregate([
      { $match: { ...query, status: { $ne: 'Cancelled' } } },
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
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' }
    ]);

    // Recent orders
    const recentOrders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.book', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock books
    const lowStockBooks = await Book.find({
      ...query,
      stock: { $lte: 10, $gt: 0 }
    })
      .sort({ stock: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        revenue: {
          total: revenueData[0]?.totalRevenue || 0,
          totalOrders: revenueData[0]?.totalOrders || 0,
          monthly: monthlyRevenue
        },
        ordersByStatus,
        topBooks,
        recentOrders,
        lowStockBooks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email')
      .populate('items.book');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if user owns the order or is admin/store staff
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isStoreStaff = req.user.role === 'admin' || req.user.role === 'store_owner' || req.user.role === 'store_manager';

    if (!isOwner && !isStoreStaff) {
      res.status(403);
      throw new Error('Not authorized to download this invoice');
    }

    // Generate PDF
    const { filePath, fileName } = await generateInvoicePDF(order, req.user);

    // Send PDF file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading invoice:', err);
        res.status(500).json({ message: 'Error downloading invoice' });
      }
    });
  } catch (error) {
    next(error);
  }
};
