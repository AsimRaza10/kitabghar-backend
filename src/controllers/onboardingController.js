import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Step 1: Check subdomain availability
export const checkSubdomain = async (req, res) => {
  try {
    const { subdomain } = req.body;

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
      });
    }

    // Check if subdomain is reserved
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost'];
    if (reservedSubdomains.includes(subdomain)) {
      return res.status(400).json({
        success: false,
        message: 'This subdomain is reserved'
      });
    }

    // Check if subdomain exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'This subdomain is already taken'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subdomain is available'
    });
  } catch (error) {
    console.error('Check subdomain error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subdomain availability'
    });
  }
};

// Step 2: Create store with owner account
export const createStore = async (req, res) => {
  try {
    const {
      storeName,
      subdomain,
      ownerName,
      ownerEmail,
      ownerPassword,
      planId,
      billingCycle
    } = req.body;

    // Validate required fields
    if (!storeName || !subdomain || !ownerName || !ownerEmail || !ownerPassword || !planId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if subdomain is available
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is already taken'
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: ownerEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Get plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create Stripe customer
    let stripeCustomer = null;
    if (stripe) {
      stripeCustomer = await stripe.customers.create({
        email: ownerEmail,
        name: ownerName,
        metadata: {
          storeName,
          subdomain
        }
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: storeName,
      subdomain,
      owner: null, // Will be updated after user creation
      status: 'trial',
      settings: {
        contactEmail: ownerEmail
      }
    });

    // Create owner user
    const owner = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: 'store_owner',
      tenant: tenant._id,
      tenantRole: 'owner'
    });

    // Update tenant with owner
    tenant.owner = owner._id;
    await tenant.save();

    // Create subscription (trial)
    let subscription;
    const stripeCustomerId = stripeCustomer ? stripeCustomer.id : 'no_stripe_configured';

    if (plan.name === 'Free') {
      // Free plan - no Stripe subscription needed
      subscription = await Subscription.create({
        tenant: tenant._id,
        plan: plan._id,
        status: 'active',
        billingCycle: 'monthly',
        stripeCustomerId: stripeCustomerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });

      tenant.status = 'active';
    } else {
      // Paid plan - create trial subscription
      subscription = await Subscription.create({
        tenant: tenant._id,
        plan: plan._id,
        status: 'trialing',
        billingCycle: billingCycle || 'monthly',
        stripeCustomerId: stripeCustomerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
    }

    tenant.subscription = subscription._id;
    await tenant.save();

    // Generate JWT token for owner
    const token = generateToken(owner._id);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        url: tenant.url,
        status: tenant.status
      },
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role
      },
      subscription: {
        plan: plan.name,
        status: subscription.status,
        trialEnd: subscription.trialEnd
      },
      token
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating store'
    });
  }
};

// Step 3: Setup payment method (for paid plans)
export const setupPaymentMethod = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env file.'
      });
    }

    const { paymentMethodId } = req.body;

    if (!req.tenant || !req.user) {
      return res.status(400).json({
        success: false,
        message: 'Tenant and user context required'
      });
    }

    const subscription = await Subscription.findOne({
      tenant: req.tenant._id
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId
    });

    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // If trial, create Stripe subscription
    if (subscription.status === 'trialing' && subscription.plan.name !== 'Free') {
      const stripePriceId = subscription.billingCycle === 'yearly'
        ? subscription.plan.stripePriceId.yearly
        : subscription.plan.stripePriceId.monthly;

      const stripeSubscription = await stripe.subscriptions.create({
        customer: subscription.stripeCustomerId,
        items: [{ price: stripePriceId }],
        trial_end: Math.floor(subscription.trialEnd.getTime() / 1000),
        metadata: {
          tenantId: req.tenant._id.toString(),
          planId: subscription.plan._id.toString()
        }
      });

      subscription.stripeSubscriptionId = stripeSubscription.id;
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment method added successfully'
    });
  } catch (error) {
    console.error('Setup payment method error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting up payment method'
    });
  }
};

// Step 4: Complete onboarding
export const completeOnboarding = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required'
      });
    }

    // Update tenant settings
    if (settings) {
      req.tenant.settings = {
        ...req.tenant.settings,
        ...settings
      };
      await req.tenant.save();
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      tenant: req.tenant
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing onboarding'
    });
  }
};

// Helper: Generate JWT token
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
