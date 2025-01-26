const User = require('../models/User')
const ApiUsage = require("../models/ApiUsage")
const { encrypt } = require('.././utils/apiKey');

const trackApiUsage = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Assuming API key is sent in headers
  const encryptedApiKey = encrypt(apiKey)

  const { originalUrl, method } = req;

  if (!encryptedApiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  try {
    // Find the user by API key
    const user = await User.findOne({ apiKey:encryptedApiKey });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Attach user info to the request object
    req.user = { id: user._id };

    res.on('finish', async () => {
      // Log the API usage
      await ApiUsage.create({
        user_id: user._id,
        endpoint: originalUrl,
        request_method: method,
        status_code: res.statusCode,
      });
    });

    next();
  } catch (error) {
    console.error('Error tracking API usage:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = trackApiUsage;