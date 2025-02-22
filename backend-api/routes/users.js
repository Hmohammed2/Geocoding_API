const User = require("../models/User");
const Feedback = require("../models/Feedback")
const TrialRecord = require("../models/TrialRecord")
const Geocode = require("../models/Geocode");
const express = require("express");
const mongoose = require('mongoose')
const router = express();
const checkAdmin = require('../middleware/checkAdmin')
const sendEmail = require('../utils/sendEmail')

router.use(express.json())

const getUserWithSubscription = async (userId) => {
    try {
      const user = await User.findById(userId)
        .populate({
          path: "subscription", // Reference the virtual field
          select: "subscription_type customer_id start_date end_date status_type stripeSubscriptionId cancelAtPeriodEnd lastPayment canceledAt" // Fields to include from Subscription
        })
        .exec();
  
      if (!user) {
        throw new Error("User not found");
      }
  
      return user;
    } catch (error) {
      console.error("Error fetching user with subscription:", error);
      throw error;
    }
  };

router.get('/data', checkAdmin, async (req, res) => {
    try {
        const user = await User.find({})
        .populate({
          path: "subscription", // Reference the virtual field
          select: "subscription_type customer_id start_date end_date status_type stripeSubscriptionId cancelAtPeriodEnd lastPayment canceledAt", // Fields to include from Subscription
        })
        .exec();
  
      if (!user) {
        throw new Error("User not found");
      }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/data/:id', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).send({ message: 'No user ID is present' })
    }

    try {
        // Ensure the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const userWithSubscription = await getUserWithSubscription(id);
        if (!userWithSubscription) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(userWithSubscription);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

})

router.put('/update', async (req, res) => {
    const { userId, userName, email } = req.body

    if (!userId) {
        return res.status(400).send({ message: 'No user ID is present' })
    }

    try {
        // Find and update the user
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId }, // Query by the user's ID
            { $set: { userName, email } }, // Fields to update
            { new: true, runValidators: true } // Return the updated document
        );

        // Check if the user exists
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with the updated user data
        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/geocode-data', checkAdmin, async (req, res) => {
    try {
        const allData = await Geocode.find({});
        res.json(allData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/delete', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'No user ID provided' });
        }

        // Retrieve the user to check trial status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user has used the free trial, persist the hashed email
        if (user.trialUsed) {
            const emailHash = crypto
                .createHash('sha256')
                .update(user.email.toLowerCase())
                .digest('hex');

            await TrialRecord.create({ emailHash, trialUsed: true, deletedAt: new Date() });
        }

        // Delete the user account
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API Endpoint to send emails
router.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; background: #ffffff; padding: 20px; margin: 0 auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
                h2 { color: #333; }
                .details { margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #007BFF; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>New Contact Form Submission</h2>
                <p>You have received a new message from your website contact form.</p>
                <div class="details">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 SimpleGeoAPI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await sendEmail(
            "info@simplegeoapi.com", // Replace with your own email
            `New Contact Form Submission from ${name}`,
            `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`, htmlContent
        );
        res.status(200).json({ success: "Email sent successfully!" });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

router.post("/feedback", async (req, res) => {
    try {
      const feedback = new Feedback({
        feedback: req.body.feedback,
      });
  
      await feedback.save();
      res.status(201).json({ message: "Feedback submitted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error saving feedback", error });
    }
  });

module.exports = router