import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
  },
  customDomain: {
    type: String,
    sparse: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    logo: String,
    favicon: String,
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#10B981'
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    contactEmail: String,
    contactPhone: String,
    address: String,
    description: String,
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled', 'trial'],
    default: 'trial'
  },
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ owner: 1 });
tenantSchema.index({ status: 1 });

// Virtual for full URL
tenantSchema.virtual('url').get(function() {
  if (this.customDomain) {
    return `https://${this.customDomain}`;
  }
  return `https://${this.subdomain}.yourdomain.com`;
});

// Check if trial is expired
tenantSchema.methods.isTrialExpired = function() {
  return this.status === 'trial' && this.trialEndsAt < new Date();
};

// Check if tenant can access features
tenantSchema.methods.canAccess = function() {
  if (!this.isActive) return false;
  if (this.status === 'suspended' || this.status === 'cancelled') return false;
  if (this.isTrialExpired()) return false;
  return true;
};

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
