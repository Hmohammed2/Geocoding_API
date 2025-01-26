const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, index: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    apiKey: { type: String, unique: true, index: true}, // Add API key field
    location: { type: String },
    isPayingCustomer: { type: String, enum: ['yes', 'no'], default: 'no' },
    password: { type: String, required: true }
})

// Virtual field for subscription
userSchema.virtual("subscription", {
    ref: "Subscription", // Name of the Subscription model
    localField: "_id", // Field in User model
    foreignField: "user_id", // Field in Subscription model
  });

// Enable virtuals in JSON output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model('User', userSchema);