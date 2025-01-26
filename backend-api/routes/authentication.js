require('dotenv').config()
const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const { generateApiKey, encrypt, decrypt } = require('../utils/apiKey')

const router = express();
router.use(cookieParser()); // This should be before your routes that need cookies
router.use(express.json())

if (!process.env.JWT_SECRET_TOKEN) {
    console.error("Missing JWT_SECRET in environment variables.");
    process.exit(1);
}

// Rate limiter middleware to protect login endpoint
// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // Limit each IP to 5 login requests per windowMs
//     message:
//         "Too many login attempts from this IP, please try again after 15 minutes",
// });

router.post("/register", async (req, res) => {
    const { userName, email, password, location } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        // Check if user exists
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists in the database."
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate and Encrypt API Key
        const apiKey = generateApiKey();
        const encryptedApiKey = encrypt(apiKey);

        // ✅ Create new user
        const newUser = new User({
            userName,
            password: hashedPassword,
            email,
            location,
            apiKey: encryptedApiKey,
            isPayingCustomer: "no"
        });

        await newUser.save();

        // ✅ Create Free Subscription
        const freeSubscription = new Subscription({
            user_id: newUser._id,
            customer_id: `free-${newUser._id}`, // Placeholder since Stripe isn't used here
            subscription_type: "free",
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year validity
            status_type: "active",
            stripeSubscriptionId: `free-sub-${newUser._id}`, // Dummy Stripe ID
            cancelAtPeriodEnd: false,
        });

        await freeSubscription.save();

        console.log("User & Subscription Created:", newUser, freeSubscription);

        res.status(201).json({
            message: "User registered successfully",
            userId: newUser._id,
            subscription: freeSubscription
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post(
    "/login",
    [body("email").notEmpty(), body("password").notEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign(
                { userId: user._id, username: user.userName, email: user.email },
                process.env.JWT_SECRET_TOKEN,
                { expiresIn: '1h' }
            );

            // Set the token in a secure, httpOnly cookie
            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000 // 7 days when rememberMe is implemented, but 1 hour when not
            });

            res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post("/logout", (req, res) => {
    // Clear the authentication cookie
    res.cookie("token", "", {
        httpOnly: true,
        sameSite: "Strict",
        expires: new Date(0), // Set the cookie to expire immediately
    });

    res.status(200).json({ message: "Logged out successfully" });
});

router.get("/verify-token", async (req, res) => {
    const token = req.cookies.token; // Get the token directly from cookies

    if (!token) {
        return res.status(401).json({ message: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        res.json({
            valid: true,
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

// **🔹 API Endpoint to Retrieve API Key**
router.get("/get-api-key", async (req, res) => {
    const { email, userId } = req.query; // Get user identifier from query params

    try {
        if (!email && !userId) {
            return res.status(400).json({ message: "Email or User ID is required." });
        }

        // Find user by email or userId
        const user = await User.findOne({ $or: [{ email }, { _id: userId }] });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.apiKey) {
            return res.status(400).json({ message: "API Key not found for this user." });
        }

        // Decrypt API key
        const decryptedApiKey = decrypt(user.apiKey);

        if (!decryptedApiKey) {
            return res.status(500).json({ message: "Failed to decrypt API key." });
        }

        res.status(200).json({ apiKey: decryptedApiKey });
    } catch (error) {
        console.error("Error retrieving API Key:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
