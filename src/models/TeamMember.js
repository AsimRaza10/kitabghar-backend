import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff'],
    default: 'staff'
  },
  permissions: {
    manageBooks: {
      type: Boolean,
      default: false
    },
    manageOrders: {
      type: Boolean,
      default: false
    },
    manageCustomers: {
      type: Boolean,
      default: false
    },
    manageTeam: {
      type: Boolean,
      default: false
    },
    manageSettings: {
      type: Boolean,
      default: false
    },
    viewAnalytics: {
      type: Boolean,
      default: false
    }
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
teamMemberSchema.index({ tenant: 1, user: 1 }, { unique: true });
teamMemberSchema.index({ tenant: 1, status: 1 });

// Set default permissions based on role
teamMemberSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'owner':
        this.permissions = {
          manageBooks: true,
          manageOrders: true,
          manageCustomers: true,
          manageTeam: true,
          manageSettings: true,
          viewAnalytics: true
        };
        break;
      case 'manager':
        this.permissions = {
          manageBooks: true,
          manageOrders: true,
          manageCustomers: true,
          manageTeam: false,
          manageSettings: false,
          viewAnalytics: true
        };
        break;
      case 'staff':
        this.permissions = {
          manageBooks: true,
          manageOrders: true,
          manageCustomers: false,
          manageTeam: false,
          manageSettings: false,
          viewAnalytics: false
        };
        break;
    }
  }
  next();
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
