const User = require("../models/User");
const Geocode = require("../models/Geocode");
const express = require("express");
const mongoose = require('mongoose')
const router = express();

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

router.get('/data', async (req, res) => {
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

router.get('/geocode-data', async (req, res) => {
    try {
        const allData = await Geocode.find({});
        res.json(allData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router