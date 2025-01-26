// middleware/verifyApiKey.js
const User = require("../models/User"); // Replace with the correct path to your User model

const verifyApiKey = async (req, res, next) => {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
        return res.status(401).json({ error: "API key is required." });
    }

    try {
        // Check if the API key exists in the database
        const user = await User.findOne({ apiKey });

        if (!user) {
            return res.status(401).json({ error: "Invalid API key." });
        }

        // Optionally, attach user information to the request object for further use
        req.user = user;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error validating API key:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = verifyApiKey;
