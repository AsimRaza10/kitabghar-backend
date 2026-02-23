import Newsletter from '../models/Newsletter.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ message: 'This email is already subscribed' });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = Date.now();
        existingSubscriber.unsubscribedAt = null;
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Successfully resubscribed to newsletter!' });
      }
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({ email });

    res.status(201).json({
      message: 'Successfully subscribed to newsletter!',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in our newsletter list' });
    }

    if (!subscriber.isActive) {
      return res.status(400).json({ message: 'This email is already unsubscribed' });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.status(200).json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe. Please try again.' });
  }
};

// @desc    Get all newsletter subscribers (Admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true })
      .select('email subscribedAt')
      .sort('-subscribedAt');

    res.status(200).json({
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};
