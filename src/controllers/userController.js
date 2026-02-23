import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const newAddress = req.body;

      // If this is the first address or marked as default, set it as default
      if (user.addresses.length === 0 || newAddress.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
        newAddress.isDefault = true;
      }

      user.addresses.push(newAddress);
      await user.save();

      res.status(201).json({
        success: true,
        data: user.addresses
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.book');

    res.json({
      success: true,
      data: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to cart
// @route   POST /api/users/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(item => item.book.toString() === bookId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ book: bookId, quantity });
    }

    await user.save();
    await user.populate('cart.book');

    res.json({
      success: true,
      data: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item
// @route   PUT /api/users/cart/:bookId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.find(item => item.book.toString() === req.params.bookId);

    if (cartItem) {
      if (quantity <= 0) {
        user.cart = user.cart.filter(item => item.book.toString() !== req.params.bookId);
      } else {
        cartItem.quantity = quantity;
      }

      await user.save();
      await user.populate('cart.book');

      res.json({
        success: true,
        data: user.cart
      });
    } else {
      res.status(404);
      throw new Error('Item not found in cart');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from cart
// @route   DELETE /api/users/cart/:bookId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.book.toString() !== req.params.bookId);

    await user.save();
    await user.populate('cart.book');

    res.json({
      success: true,
      data: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/users/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:addressId
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
