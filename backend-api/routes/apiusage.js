const ApiUsage = require("../models/ApiUsage");
const User = require("../models/User");
const express = require("express");
const router = express();
const mongoose = require("mongoose");

// Function to get monthly user usage stats
const getUserUsageStatsByMonth = async (userId) => {
  const stats = await ApiUsage.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
        },
        totalRequests: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  return stats;
};

// ✅ Function to get daily API usage stats for the current month
const getUserUsageStatsByDay = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const stats = await ApiUsage.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
        },
        totalRequests: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.day": 1 },
    },
  ]);

  return stats;
};

// Route to fetch monthly API usage stats
router.get("/monthly", async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ message: "API key required" });
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    const usageStats = await getUserUsageStatsByMonth(user._id);
    res.json(usageStats);
  } catch (error) {
    console.error("Error fetching monthly API usage stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to fetch daily API usage stats
router.get("/daily", async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ message: "API key required" });
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    const usageStats = await getUserUsageStatsByDay(user._id);
    res.json(usageStats);
  } catch (error) {
    console.error("Error fetching daily API usage stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
