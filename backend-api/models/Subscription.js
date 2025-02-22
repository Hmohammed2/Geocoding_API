const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true}, 
    customer_id: { type: String, required: true},
    subscription_type: {
      type: String,
      enum: ["free", "pro", "premium"],
      required: true, 
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    current_period_start: { type: Date, default: null},
    current_period_end: { type: Date, default: null },
    status_type: {
      type: String,
      enum: ["active", "inactive", "expired", "canceled", "past_due", "trialing"],
      default: "active",
      index: true
    },
    // Fields to match Stripe subscription events
    stripeSubscriptionId: { type: String, default: null}, // Stripe subscription ID
    cancelAtPeriodEnd: { type: Boolean, default: false }, // If subscription is set to cancel at period end
    lastPayment: { type: Date }, // Date of the last payment made
    canceledAt: { type: Date }, // If subscription was canceled, store cancellation date
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
