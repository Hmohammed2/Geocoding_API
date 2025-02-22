const User = require("../models/User")
const ApiUsage = require("../models/ApiUsage")

/**
 * Middleware to check track api Usage by request status methods
 */
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

    // Only check req.body if it exists (for POST/PUT requests)
    if (req.body && Array.isArray(req.body.addresses)) {
      requestCount = req.body.addresses.length;
    }

    // Short-circuit the tracking if the response is already finished with an error (e.g., 403)
    res.on('finish', async () => {
      if (res.statusCode === 403 || res.statusCode >= 400) {
        // Don't log if status is 403 or any other error status
        return;
      }

      // Log API usage per individual request
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

/**
 * Middleware to check track api Usage by batch files
 */
const trackBatchUsage = async (req, res, next) => {
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

    // Register finish event *without* pre-calculating requestCount
    res.on('finish', async () => {
      // Only log if the response was successful.
      if (res.statusCode === 403 || res.statusCode >= 401) {
        return;
      }

      // Compute requestCount at this point
      let requestCount = 1;
      if (req.processedCount) {
        requestCount = req.processedCount;
      } else if (req.body.addresses && Array.isArray(req.body.addresses)) {
        requestCount = req.body.addresses.length;
      }

      // Create as many log entries as the number of processed rows
      const logs = Array.from({ length: requestCount }).map(() => ({
        user_id: user._id,
        endpoint: req.originalUrl,
        request_method: req.method,
        status_code: res.statusCode,
      }));

      try {
        await ApiUsage.insertMany(logs);
      } catch (logError) {
        console.error("Error inserting API usage logs:", logError);
      }
    });

    next();
  } catch (error) {
    console.error('Error tracking API usage:', error);
    return res.status(500).json({ message: 'Internal Server error' });
  }
};


module.exports = {trackApiUsage, trackBatchUsage};
