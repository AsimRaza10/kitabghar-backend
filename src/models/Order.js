import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    // Store book snapshot to preserve data even if book is deleted
    bookSnapshot: {
      title: {
        type: String,
        required: true
      },
      author: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'PayPal'],
    default: 'COD'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 5
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  paymentResult: {
    id: String,
    status: String,
    update_time: String
  },
  deliveredAt: Date,
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false  // Optional for backward compatibility
  }
}, {
  timestamps: true
});

// Indexes for multi-tenancy
orderSchema.index({ tenant: 1 });
orderSchema.index({ tenant: 1, user: 1 });
orderSchema.index({ tenant: 1, status: 1 });

// Performance indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
