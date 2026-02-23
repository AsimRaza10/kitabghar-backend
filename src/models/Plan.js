import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Free', 'Basic', 'Pro', 'Enterprise']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    monthly: {
      type: Number,
      required: true,
      default: 0
    },
    yearly: {
      type: Number,
      required: true,
      default: 0
    }
  },
  stripePriceId: {
    monthly: String,
    yearly: String
  },
  features: {
    maxBooks: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    maxOrders: {
      type: Number,
      default: -1 // per month
    },
    maxStorage: {
      type: Number,
      default: -1 // in MB
    },
    maxTeamMembers: {
      type: Number,
      default: 1
    },
    customDomain: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    whiteLabel: {
      type: Boolean,
      default: false
    },
    customTheme: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Default plans
const defaultPlans = [
  {
    name: 'Free',
    displayName: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    features: {
      maxBooks: 50,
      maxOrders: 100,
      maxStorage: 500,
      maxTeamMembers: 1,
      customDomain: false,
      analytics: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      customTheme: false
    },
    sortOrder: 1
  },
  {
    name: 'Basic',
    displayName: 'Basic',
    description: 'For small bookstores',
    price: { monthly: 29, yearly: 290 },
    features: {
      maxBooks: 500,
      maxOrders: 1000,
      maxStorage: 5000,
      maxTeamMembers: 3,
      customDomain: false,
      analytics: true,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      customTheme: true
    },
    sortOrder: 2
  },
  {
    name: 'Pro',
    displayName: 'Pro',
    description: 'For growing businesses',
    price: { monthly: 99, yearly: 990 },
    features: {
      maxBooks: 5000,
      maxOrders: 10000,
      maxStorage: 50000,
      maxTeamMembers: 10,
      customDomain: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: false,
      customTheme: true
    },
    sortOrder: 3
  },
  {
    name: 'Enterprise',
    displayName: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 299, yearly: 2990 },
    features: {
      maxBooks: -1,
      maxOrders: -1,
      maxStorage: -1,
      maxTeamMembers: -1,
      customDomain: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
      customTheme: true
    },
    sortOrder: 4
  }
];

planSchema.statics.seedPlans = async function() {
  for (const planData of defaultPlans) {
    await this.findOneAndUpdate(
      { name: planData.name },
      planData,
      { upsert: true, new: true }
    );
  }
};

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
