const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true}, 
    customer_id: { type: String, unique: true },
    subscription_type: {
      type: String,
      enum: ["free", "pro", "premium"],
      required: true, 
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    status_type: {
      type: String,
      enum: ["active", "expired", "canceled", "past_due"],
      default: "active",
      index:true
    },
    // Fields to match Stripe subscription events
    stripeSubscriptionId: { type: String, unique: true }, // Stripe subscription ID
    cancelAtPeriodEnd: { type: Boolean, default: false }, // If subscription is set to cancel at period end
    lastPayment: { type: Date }, // Date of the last payment made
    canceledAt: { type: Date }, // If subscription was canceled, store cancellation date
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
