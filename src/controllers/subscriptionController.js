import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Tenant from '../models/Tenant.js';
import Invoice from '../models/Invoice.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Create Stripe customer
export const createStripeCustomer = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env file.'
      });
    }

    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantId: req.tenant._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      customerId: customer.id
    });
  } catch (error) {
    console.error('Create Stripe customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer'
    });
  }
};

// Create subscription
export const createSubscription = async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethodId } = req.body;

    // Get plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user._id.toString(),
          tenantId: req.tenant._id.toString()
        }
      });
      stripeCustomerId = customer.id;
    }

    // Attach payment method to customer
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId
      });

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }

    // Get Stripe price ID
    const stripePriceId = billingCycle === 'yearly'
      ? plan.stripePriceId.yearly
      : plan.stripePriceId.monthly;

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: stripePriceId }],
      trial_period_days: 14,
      metadata: {
        tenantId: req.tenant._id.toString(),
        planId: plan._id.toString()
      }
    });

    // Create subscription in database
    const subscription = await Subscription.create({
      tenant: req.tenant._id,
      plan: plan._id,
      status: 'trialing',
      billingCycle,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null
    });

    // Update tenant
    await Tenant.findByIdAndUpdate(req.tenant._id, {
      subscription: subscription._id,
      status: 'trial'
    });

    res.status(201).json({
      success: true,
      subscription,
      clientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating subscription'
    });
  }
};

// Get subscription details
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription'
    });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const newPlan = await Plan.findById(planId);
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Get new Stripe price ID
    const stripePriceId = billingCycle === 'yearly'
      ? newPlan.stripePriceId.yearly
      : newPlan.stripePriceId.monthly;

    // Update Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: stripePriceId
      }],
      proration_behavior: 'create_prorations'
    });

    // Update database
    subscription.plan = planId;
    subscription.billingCycle = billingCycle;
    await subscription.save();

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription'
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { immediate } = req.body;

    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      subscription.cancelAtPeriodEnd = true;
    }

    await subscription.save();

    // Update tenant status
    if (immediate) {
      await Tenant.findByIdAndUpdate(req.tenant._id, {
        status: 'cancelled'
      });
    }

    res.status(200).json({
      success: true,
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};

// Reactivate subscription
export const reactivateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription reactivated',
      subscription
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating subscription'
    });
  }
};

// Get invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      tenant: req.tenant._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices'
    });
  }
};

// Create billing portal session
export const createBillingPortalSession = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${req.headers.origin}/dashboard/billing`
    });

    res.status(200).json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Create billing portal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating billing portal session'
    });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper: Handle subscription update
async function handleSubscriptionUpdate(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    await subscription.save();

    // Update tenant status
    const tenant = await Tenant.findById(subscription.tenant);
    if (tenant) {
      tenant.status = stripeSubscription.status === 'active' ? 'active' : 'suspended';
      await tenant.save();
    }
  }
}

// Helper: Handle subscription deleted
async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Update tenant status
    await Tenant.findByIdAndUpdate(subscription.tenant, {
      status: 'cancelled'
    });
  }
}

// Helper: Handle invoice paid
async function handleInvoicePaid(stripeInvoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeInvoice.subscription
  });

  if (subscription) {
    // Create invoice record
    await Invoice.create({
      tenant: subscription.tenant,
      subscription: subscription._id,
      stripeInvoiceId: stripeInvoice.id,
      amount: {
        subtotal: stripeInvoice.subtotal / 100,
        tax: stripeInvoice.tax / 100,
        total: stripeInvoice.total / 100
      },
      currency: stripeInvoice.currency.toUpperCase(),
      status: 'paid',
      paidAt: new Date(stripeInvoice.status_transitions.paid_at * 1000),
      periodStart: new Date(stripeInvoice.period_start * 1000),
      periodEnd: new Date(stripeInvoice.period_end * 1000),
      pdfUrl: stripeInvoice.invoice_pdf
    });
  }
}

// Helper: Handle invoice payment failed
async function handleInvoicePaymentFailed(stripeInvoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeInvoice.subscription
  });

  if (subscription) {
    subscription.status = 'past_due';
    await subscription.save();

    // Update tenant status
    await Tenant.findByIdAndUpdate(subscription.tenant, {
      status: 'suspended'
    });

    // TODO: Send email notification to store owner
  }
}
