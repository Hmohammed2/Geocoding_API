const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscription_type: {
      type: String,
      enum: ["Basic", "Pro", "Premium"],
      required: true,
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status_type: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active",
    },
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
