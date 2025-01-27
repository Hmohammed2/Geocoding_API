const User = require("../models/User")
const ApiUsage = require("../models/ApiUsage")

const trackApiUsage = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Assuming API key is sent in headers
  const { originalUrl, method } = req;

  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  try {
    // Find the user by API key
    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Attach user info to the request object
    req.user = { id: user._id };

    // Determine request count (default to 1 for normal requests)
    let requestCount = 1;

    // **Handle batch JSON geocoding (multiple addresses)**
    if (req.body.addresses && Array.isArray(req.body.addresses)) {
      requestCount = req.body.addresses.length;
    }

    res.on('finish', async () => {
      // Log API usage **per individual request**
      const logs = Array.from({ length: requestCount }).map(() => ({
        user_id: user._id,
        endpoint: originalUrl,
        request_method: method,
        status_code: res.statusCode,
      }));

      await ApiUsage.insertMany(logs); // Bulk insert all API logs
    });

    next();
  } catch (error) {
    console.error('Error tracking API usage:', error);
    return res.status(500).json({ message: 'Internal Server error' });
  }
};

module.exports = trackApiUsage;
