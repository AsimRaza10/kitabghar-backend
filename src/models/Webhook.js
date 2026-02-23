import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid webhook URL'
    }
  },
  events: [{
    type: String,
    enum: [
      'order.created',
      'order.updated',
      'order.cancelled',
      'book.created',
      'book.updated',
      'book.deleted',
      'subscription.updated',
      'subscription.cancelled'
    ]
  }],
  secret: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  failureCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
webhookSchema.index({ tenant: 1 });
webhookSchema.index({ tenant: 1, isActive: 1 });

const Webhook = mongoose.model('Webhook', webhookSchema);

export default Webhook;
