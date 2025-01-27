const Subscription = require("../models/Subscription");
/**
 * Middleware to check user's subscription status
 */
const checkProOrPremium = async (req, res, next) => {
    const userId = req.user?.id; // Assuming user ID is attached to request object after authentication

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const subscription = await Subscription.findOne({ user_id: userId, status_type: "active" });

        if (!subscription || (subscription.subscription_type !== "pro" && subscription.subscription_type !== "premium")) {
            return res.status(403).json({
                error: "Access denied. Batch geocode is only available for Pro and Premium users.",
            });
        }

        next(); // User has valid subscription, proceed to endpoint
    } catch (error) {
        console.error("Subscription check error:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
};

module.exports = checkProOrPremium