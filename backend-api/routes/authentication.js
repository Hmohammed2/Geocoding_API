require('dotenv').config()
const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")
const cookieParser = require('cookie-parser');
const generateApiKey = require('../utils/apiKey')
const sendEmail = require('../utils/sendEmail')

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

        // Generate API Key
        const apiKey = generateApiKey();

        const textContent = `Dear User,

        Thank you for signing up. Below is your unique API key:

        🔑 ${apiKey}

        Please keep this key safe and do not share it with anyone. This key grants access to your account and should be treated like a password.

        For security reasons:
        - Do not share it publicly or with untrusted sources.
        - Store it securely (e.g., in a password manager).
        - If you suspect any unauthorized access, regenerate a new API key immediately.

        If you need any assistance, feel free to contact our support team.

        Best regards,  
        SimpleGeoAPI`;

        const htmlContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Your API Key - Keep it Safe</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    color: #333;
                }
                .api-key {
                    font-size: 18px;
                    font-weight: bold;
                    color: #d63384;
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 5px;
                    text-align: center;
                    margin: 15px 0;
                }
                p {
                    color: #555;
                    line-height: 1.6;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #888;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Your API Key - Keep it Safe</h2>
                <p>Dear User,</p>
                <p>Thank you for signing up. Below is your unique API key:</p>
                
                <div class="api-key">
                    🔑 <strong>${apiKey}</strong>
                </div>

                <p><strong>For security reasons:</strong></p>
                <ul>
                    <li>Do not share it publicly or with untrusted sources.</li>
                    <li>Store it securely (e.g., in a password manager).</li>
                    <li>If you suspect any unauthorized access, regenerate a new API key immediately.</li>
                </ul>

                <p>If you need any assistance, feel free to contact our support team.</p>

                <p>Best regards,</p>
                <p><strong>SimpleGeoAPI Team</strong></p>

                <div class="footer">
                    &copy; 2024 SimpleGeoAPI. All rights reserved.
                </div>
            </div>
        </body>
        </html>`;

        await sendEmail(`${email}`, "Your API Key - Keep it Safe", textContent, htmlContent)

        // Hash the ApiKey
        const hashedApiKey = await bcrypt.hash(apiKey, 10);

        // ✅ Create new user
        const newUser = new User({
            userName,
            password: hashedPassword,
            email,
            location,
            apiKey: hashedApiKey
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
/**
 * Endpoint to handle verifying tokens.
 */
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

/**
 * Endpoint to handle password reset requests.
 * Generates a reset token, saves it with an expiration on the user model,
 * and sends an email with the reset link.
 */
router.post("/reset-password", async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: "Invalid email address" })
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            // To prevent email enumeration, always send the same response
            return res
                .status(200)
                .json({ message: "If an account with that email exists, a reset email has been sent." });
        }
        // Generate a secure random token and set an expiration (e.g., 1 hour from now)
        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpiration = Date.now() + 3600000; // 1 hour in milliseconds

        // Save the token and its expiration on the user document.
        // Make sure your User schema has fields for resetToken and resetTokenExpiration.
        user.resetToken = token;
        user.resetTokenExpiration = tokenExpiration;
        await user.save();

        // Construct the reset password link (update the URL to match your frontend route)
        const resetLink = `${process.env.FRONT_END}/change-password/${token}`;

        // Define the email content
        const subject = "Reset Your Password";
        const textContent = `You requested a password reset. Please click the link to reset your password: ${resetLink}`;
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #dddddd;
    }
    .header h2 {
      margin: 0;
      color: #007BFF;
    }
    .content {
      margin: 20px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 5px;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777777;
      border-top: 1px solid #dddddd;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Reset Your Password</h2>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>You recently requested to reset your password. Click the button below to proceed:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
      <p>Thank you,<br>The SimpleGeoAPI Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SimpleGeoApi. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

        // Send the reset email
        await sendEmail(email, subject, textContent, htmlContent);

        // Always respond with a success message to prevent email enumeration
        res.status(200).json({ message: "If an account with that email exists, a reset email has been sent." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }


})
/**
 * POST /api/auth/change-password/:token
 * Endpoint to change the password using a reset token.
 *
 * Request body should include:
 * - newPassword: the new password the user wants to set
 */
router.post("/change-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    // Validate request body
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }
  
    try {
      // Find the user by matching the reset token and ensuring it hasn't expired
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token." });
      }
  
      // Hash the new password before saving
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
      // Update the user's password and clear the reset token fields
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
  
      res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

module.exports = router;
