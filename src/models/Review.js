import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ book: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ book: 1, user: 1 }, { unique: true }); // One review per user per book
reviewSchema.index({ tenant: 1 });

// Performance indexes
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId }
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      reviews: stats[0].reviewCount
    });
  } else {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      rating: 0,
      reviews: 0
    });
  }
};

// Update book rating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.book);
});

// Update book rating after remove
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.book);
});

// Update book rating after deleteOne
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.calculateAverageRating(this.book);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
