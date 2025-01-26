const User = require('../models/User'); // Adjust the path to the User model
const Subscription = require('../models/Subscription');
const ApiUsage = require('../models/ApiUsage');
const { encrypt } = require('.././utils/apiKey');

const enforceApiLimit = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Replace with the header or query parameter used for the API key
  const encryptedApiKey = encrypt(apiKey)

  if (!encryptedApiKey) {
    return res.status(401).json({ message: 'API key is required' });
  }

  try {
    // Fetch the user using the API key
    const user = await User.findOne({ apiKey:encryptedApiKey });

    if (!user) {
      return res.status(403).json({ message: 'Invalid API key' });
    }

    // Fetch the active subscription for the user
    const subscription = await Subscription.findOne({ user_id: user._id, status_type: 'active' });

    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription for this API key' });
    }

    // Count API usage
    const usageCount = await ApiUsage.countDocuments({
      api_key: encryptedApiKey,
      timestamp: { $gte: new Date(subscription.start_date), $lte: new Date(subscription.end_date) },
    });

    // Define subscription limits
    const limits = {
      free: 1000,
      pro: 50000,
      premium: 250000,
    };

    // Enforce the limit
    if (usageCount >= limits[subscription.subscription_type]) {
      return res.status(429).json({ message: 'API limit exceeded' });
    }

    // Add user and subscription details to the request object for downstream use (optional)
    req.user = user;
    req.subscription = subscription;

    next(); // Proceed with the request
  } catch (error) {
    console.error('Error enforcing API limit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = enforceApiLimit;
