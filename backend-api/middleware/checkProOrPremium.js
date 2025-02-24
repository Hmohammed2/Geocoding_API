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
        // Fetch a subscription with status "active" or "trialing"
        const subscription = await Subscription.findOne({
            user_id: userId,
            status_type: { $in: ["active", "trialing"] },
        }).select("status_type subscription_type");

        // Check if the subscription exists and that the plan is "pro" or "premium"
        if (
            !subscription ||
            (subscription.subscription_type !== "pro" && subscription.subscription_type !== "premium")
        ) {
            return res.status(403).json({
                error:
                    "Access denied. Batch geocode is only available for Pro and Premium users.",
            });
        }

        next(); // User has a valid (active or trialing) pro or premium subscription, so proceed.
    } catch (error) {
        console.error("Subscription check error:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }}

    module.exports = checkProOrPremium