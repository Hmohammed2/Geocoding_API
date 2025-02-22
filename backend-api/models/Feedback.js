const mongoose = require('mongoose');

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  // The actual feedback provided by the user
  feedback: {
    type: String,
    maxlength: 5000, // Maximum length for the feedback
  },
  // Timestamp for when the feedback was submitted
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date and time
  },
});

// Create a Mongoose model from the schema
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;