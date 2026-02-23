import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  period: {
    type: String,
    required: true // Format: YYYY-MM
  },
  metrics: {
    booksCount: {
      type: Number,
      default: 0
    },
    ordersCount: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0 // in MB
    },
    teamMembersCount: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    }
  },
  limits: {
    maxBooks: Number,
    maxOrders: Number,
    maxStorage: Number,
    maxTeamMembers: Number
  },
  overages: {
    books: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    storage: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
usageSchema.index({ tenant: 1, period: 1 }, { unique: true });
usageSchema.index({ tenant: 1 });

// Check if limit is exceeded
usageSchema.methods.isLimitExceeded = function(metric) {
  const limit = this.limits[`max${metric.charAt(0).toUpperCase() + metric.slice(1)}`];
  if (limit === -1) return false; // Unlimited
  return this.metrics[`${metric}Count`] >= limit;
};

// Calculate overage
usageSchema.methods.calculateOverage = function(metric) {
  const limit = this.limits[`max${metric.charAt(0).toUpperCase() + metric.slice(1)}`];
  if (limit === -1) return 0; // Unlimited
  const usage = this.metrics[`${metric}Count`];
  return Math.max(0, usage - limit);
};

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
