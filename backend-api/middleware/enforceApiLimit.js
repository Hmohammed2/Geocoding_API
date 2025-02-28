const User = require("../models/User");
const Subscription = require("../models/Subscription");
const ApiUsage = require("../models/ApiUsage");

const LIMITS = {
  trialing: 1000,
  free: 1000,
  pro: 50000,
  premium: 250000,
};

const DAILY_LIMITS = {
  free: 10,
  pro: 1000,
};

/**
 * Middleware to enforce API rate limits based on user subscription.
 */
const enforceMonthlyLimit = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ message: "API key is required" });

    const user = await User.findOne({ apiKey }).select("_id apiKey");
    if (!user) return res.status(403).json({ message: "Invalid API key" });

    console.log(user)
    // Now fetch the subscription; include both active and trialing subscriptions
    const subscription = await Subscription.findOne({
      user_id: user.id,
      status_type: { $in: ["active", "trialing"] }
    }).select("status_type subscription_type current_period_start current_period_end");

    console.log(user)

    if (!subscription) return res.status(403).json({ message: "No active subscription found" });

    const subscriptionKey = subscription.status_type === "trialing" ? "trialing" : subscription.subscription_type;
    const limit = LIMITS[subscriptionKey] || LIMITS["free"];

    console.log(user)
    // Fetch API usage count within subscription period
    const usageCount = await ApiUsage.countDocuments({
      api_key: apiKey,
      timestamp: {
        $gte: new Date(subscription.current_period_start * 1000),
        $lte: new Date(subscription.current_period_end * 1000),
      },
    });

    if (usageCount >= limit) {
      return res.status(429).json({ message: "API limit exceeded. Upgrade your plan for more requests." });
    }

    // Attach user & subscription details to the request
    req.user = user;
    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("Error enforcing API limit:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Middleware to enforce daily API rate limits for free and pro-tier users.
 */
const enforceDailyLimit = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ message: "API key is required" });

    // Fetch the user first
    const user = await User.findOne({ apiKey }).select("_id apiKey");
    if (!user) return res.status(403).json({ message: "Invalid API key" });

    // Now fetch the subscription; include both active and trialing subscriptions
    const subscription = await Subscription.findOne({
      user_id: user._id,
      status_type: { $in: ["active", "trialing"] }
    }).select("status_type subscription_type");
    if (!subscription)
      return res.status(403).json({ message: "No active subscription found" });

    // Determine daily limit based on subscription type; default to 'free' if not found.
    // Optionally, if trialing users should have the free limit, you can do:
    const dailyLimit =
      DAILY_LIMITS[
        subscription.status_type === "trialing"
          ? "free"
          : subscription.subscription_type
      ] || DAILY_LIMITS["free"];

    // Get start of today (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch API usage count for today
    const dailyUsageCount = await ApiUsage.countDocuments({
      api_key: apiKey,
      timestamp: { $gte: todayStart },
    });

    if (dailyUsageCount >= dailyLimit) {
      return res
        .status(429)
        .json({ message: `Daily API limit of ${dailyLimit} exceeded. Try again tomorrow.` });
    }

    // Proceed if the daily limit hasn't been exceeded
    next();
  } catch (error) {
    console.error("Error enforcing daily API limit:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { enforceMonthlyLimit, enforceDailyLimit };
