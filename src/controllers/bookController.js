import Book from '../models/Book.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      minRating,
      author,
      inStock,
      page = 1,
      limit = 12
    } = req.query;

    let query = { isActive: true };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by author
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.offerPrice = {};
      if (minPrice) query.offerPrice.$gte = Number(minPrice);
      if (maxPrice) query.offerPrice.$lte = Number(maxPrice);
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by stock availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let books = Book.find(query);

    // Sort
    if (sort === 'price-low') {
      books = books.sort({ offerPrice: 1 });
    } else if (sort === 'price-high') {
      books = books.sort({ offerPrice: -1 });
    } else if (sort === 'rating') {
      books = books.sort({ rating: -1 });
    } else if (sort === 'title') {
      books = books.sort({ title: 1 });
    } else if (sort === 'newest') {
      books = books.sort({ createdAt: -1 });
    } else {
      books = books.sort({ createdAt: -1 });
    }

    // Apply pagination
    books = books.skip(skip).limit(limitNum).lean();

    const result = await books;
    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      count: result.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const book = await Book.findOne(query);

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
export const createBook = async (req, res, next) => {
  try {
    // Add tenant to book data (optional for backward compatibility)
    const bookData = {
      ...req.body,
      rating: req.body.rating || 0,
      reviews: req.body.reviews || 0
    };

    if (req.tenant) {
      bookData.tenant = req.tenant._id;
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const book = await Book.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Add tenant filter for multi-tenancy
    if (req.tenant) {
      query.tenant = req.tenant._id;
    }

    const book = await Book.findOneAndDelete(query);

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
