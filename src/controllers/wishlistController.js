import User from '../models/User.js';
import Book from '../models/Book.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add book to wishlist
// @route   POST /api/wishlist/:bookId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await User.findById(req.user._id);

    // Check if book is already in wishlist
    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }

    user.wishlist.push(bookId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      message: 'Book added to wishlist',
      wishlist: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/wishlist/:bookId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findById(req.user._id);

    // Check if book is in wishlist
    if (!user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: 'Book not in wishlist' });
    }

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== bookId.toString()
    );
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      message: 'Book removed from wishlist',
      wishlist: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle book in wishlist
// @route   PUT /api/wishlist/:bookId/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await User.findById(req.user._id);

    const isInWishlist = user.wishlist.includes(bookId);

    if (isInWishlist) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(
        id => id.toString() !== bookId.toString()
      );
    } else {
      // Add to wishlist
      user.wishlist.push(bookId);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      message: isInWishlist ? 'Book removed from wishlist' : 'Book added to wishlist',
      wishlist: updatedUser.wishlist,
      isInWishlist: !isInWishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Move wishlist item to cart
// @route   POST /api/wishlist/:bookId/move-to-cart
// @access  Private
export const moveToCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findById(req.user._id);

    // Check if book is in wishlist
    if (!user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: 'Book not in wishlist' });
    }

    // Check if book is already in cart
    const existingCartItem = user.cart.find(
      item => item.book.toString() === bookId.toString()
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({ book: bookId, quantity: 1 });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== bookId.toString()
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('wishlist')
      .populate('cart.book');

    res.json({
      message: 'Book moved to cart',
      wishlist: updatedUser.wishlist,
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
