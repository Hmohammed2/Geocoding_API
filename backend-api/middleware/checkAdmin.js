const User = require("../models/User");

/**
 * Middleware to check if the user is an admin.
 */
const checkAdmin = async (req, res, next) => {
    const userId = req.user?.id; // Assuming user ID is attached to request object after authentication

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
        const user = await User.findOne({ _id: userId, role: "admin" });

        if (!user) {
            return res.status(403).json({ error: "Access denied!" });
        }

        next(); // User is an admin, proceed to endpoint
    } catch (error) {
        console.error("Admin check error:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
};

module.exports = checkAdmin;