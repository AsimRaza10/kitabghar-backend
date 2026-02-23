import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'unpaid', 'trialing'],
    default: 'trialing'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true,
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: Date,
  trialStart: Date,
  trialEnd: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ tenant: 1 });
subscriptionSchema.index({ status: 1 });

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return ['active', 'trialing'].includes(this.status) &&
         this.currentPeriodEnd > new Date();
};

// Check if subscription is in grace period
subscriptionSchema.methods.isInGracePeriod = function() {
  return this.status === 'past_due' &&
         this.currentPeriodEnd > new Date();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
