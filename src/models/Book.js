import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  offerPrice: {
    type: Number,
    required: [true, 'Please provide an offer price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Fiction',
      'Non-Fiction',
      'History',
      'Poetry',
      'Thrill',
      'Astronaut',
      'Urdu Fiction',
      'Urdu Poetry',
      'English Fiction',
      'Science',
      'Self-Help',
      'Business',
      'Children',
      'Islamic',
      'Technology'
    ]
  },
  image: {
    type: String,
    required: [true, 'Please provide an image']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false  // Optional for backward compatibility
  }
}, {
  timestamps: true
});

// Indexes for multi-tenancy
bookSchema.index({ tenant: 1 });
bookSchema.index({ tenant: 1, category: 1 });
bookSchema.index({ tenant: 1, isActive: 1 });

// Performance indexes
bookSchema.index({ rating: -1 });
bookSchema.index({ offerPrice: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ category: 1, rating: -1 });

// Pre-delete hook to prevent deletion of books with orders
bookSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Order = mongoose.model('Order');
    const ordersWithBook = await Order.countDocuments({
      'items.book': this._id,
      status: { $ne: 'Cancelled' }
    });

    if (ordersWithBook > 0) {
      throw new Error('Cannot delete book that has active orders. Please mark it as inactive instead.');
    }
    next();
  } catch (error) {
    next(error);
  }
});

bookSchema.pre('findOneAndDelete', async function(next) {
  try {
    const Order = mongoose.model('Order');
    const bookId = this.getQuery()._id;

    const ordersWithBook = await Order.countDocuments({
      'items.book': bookId,
      status: { $ne: 'Cancelled' }
    });

    if (ordersWithBook > 0) {
      throw new Error('Cannot delete book that has active orders. Please mark it as inactive instead.');
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
