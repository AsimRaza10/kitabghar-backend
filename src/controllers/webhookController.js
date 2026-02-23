import Webhook from '../models/Webhook.js';
import crypto from 'crypto';
import axios from 'axios';

// Create webhook
export const createWebhook = async (req, res) => {
  try {
    const { url, events } = req.body;

    if (!url || !events || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'URL and events are required'
      });
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
      tenant: req.tenant._id,
      url,
      events,
      secret
    });

    res.status(201).json({
      success: true,
      webhook: {
        id: webhook._id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        isActive: webhook.isActive
      }
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating webhook'
    });
  }
};

// Get webhooks
export const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({
      tenant: req.tenant._id
    }).select('-secret');

    res.status(200).json({
      success: true,
      webhooks
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching webhooks'
    });
  }
};

// Update webhook
export const updateWebhook = async (req, res) => {
  try {
    const { url, events, isActive } = req.body;

    const webhook = await Webhook.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (typeof isActive !== 'undefined') webhook.isActive = isActive;

    await webhook.save();

    res.status(200).json({
      success: true,
      webhook
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating webhook'
    });
  }
};

// Delete webhook
export const deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting webhook'
    });
  }
};

// Trigger webhook
export const triggerWebhook = async (tenantId, event, data) => {
  try {
    const webhooks = await Webhook.find({
      tenant: tenantId,
      events: event,
      isActive: true
    });

    for (const webhook of webhooks) {
      try {
        // Create signature
        const timestamp = Date.now();
        const payload = JSON.stringify({ event, data, timestamp });
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(payload)
          .digest('hex');

        // Send webhook
        await axios.post(webhook.url, {
          event,
          data,
          timestamp
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event
          },
          timeout: 5000
        });

        // Update last triggered
        webhook.lastTriggered = new Date();
        webhook.failureCount = 0;
        await webhook.save();

        console.log(`Webhook triggered: ${event} -> ${webhook.url}`);
      } catch (error) {
        console.error(`Webhook failed: ${webhook.url}`, error.message);

        // Increment failure count
        webhook.failureCount += 1;

        // Disable webhook after 10 consecutive failures
        if (webhook.failureCount >= 10) {
          webhook.isActive = false;
        }

        await webhook.save();
      }
    }
  } catch (error) {
    console.error('Trigger webhook error:', error);
  }
};

// Test webhook
export const testWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    // Send test payload
    const timestamp = Date.now();
    const payload = JSON.stringify({
      event: 'webhook.test',
      data: { message: 'This is a test webhook' },
      timestamp
    });

    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(payload)
      .digest('hex');

    await axios.post(webhook.url, {
      event: 'webhook.test',
      data: { message: 'This is a test webhook' },
      timestamp
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'webhook.test'
      },
      timeout: 5000
    });

    res.status(200).json({
      success: true,
      message: 'Test webhook sent successfully'
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error testing webhook'
    });
  }
};
