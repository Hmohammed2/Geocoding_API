require("dotenv").config();
const { STRIPE_PRIVATE_KEY, STRIPE_PRICE_ID_PRO, STRIPE_PRICE_ID_PREMIUM, FRONT_END, BACK_END, STRIPE_WEBHOOK_SECRET_KEY } = process.env;
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const Subscription = require("../models/Subscription");
const User = require("../models/User");

if (!STRIPE_PRIVATE_KEY || !STRIPE_PRICE_ID_PRO || !STRIPE_PRICE_ID_PREMIUM) {
  console.error("Missing required environment variables");
  process.exit(1); // Terminate the process to prevent further errors
}

router.post("/create-checkout-session", express.json(), async (req, res) => {
  const { userId, subscriptionType } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "❌ Unauthorized User" });
  }

  try {
    // Fetch the user record to check trial usage
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Fetch the user's current active subscription
    const existingSubscription = await Subscription.findOne({
      user_id: userId,
      status_type: "active",
    });

    if (existingSubscription) {
      if (existingSubscription.subscription_type === "premium") {
        return res.status(400).json({ message: "You already have a premium subscription." });
      }

      if (existingSubscription.subscription_type === "pro" && subscriptionType === "premium") {

        // ✅ Require Checkout for Upgrade Instead of Direct Update
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{ price: STRIPE_PRICE_ID_PREMIUM, quantity: 1 }],
          mode: "subscription",
          success_url: `${BACK_END}/api/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${FRONT_END}/home`,
          metadata: { userId, subscriptionType },
        });

        return res.json({ url: session.url }); // Redirect user to checkout
      }

      // ❌ Prevent Pro → Pro upgrades
      if (existingSubscription.subscription_type === "pro" && subscriptionType === "pro") {
        return res.status(400).json({ message: "You already have a Pro subscription." });
      }
    }


    // Prepare subscription data (trial only applies for premium)
    let subscriptionData = {};
    if (subscriptionType === "premium") {
      // Only offer a trial if the user hasn't already used it
      if (!user.trialUsed) {
        subscriptionData.trial_period_days = 7;
      }
    }
    // Determine the Stripe price ID based on subscription type
    const priceId =
      subscriptionType === "pro"
        ? STRIPE_PRICE_ID_PRO
        : subscriptionType === "premium"
          ? STRIPE_PRICE_ID_PREMIUM
          : null;

    if (!priceId) {
      return res.status(400).json({ message: "Invalid subscription type." });
    }

    // Create a Stripe checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: {
          ...subscriptionData, // Contains trial_period_days if applicable
          metadata: { userId, subscriptionType },
        },
        success_url: `${BACK_END}/api/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONT_END}/home`,
        metadata: { userId, subscriptionType },
      });

      return res.json({ url: session.url });

    } catch (error) {
      console.error("❌ Error creating Stripe checkout session:", error);

      // If the error is related to incorrect request parameters, you might use 400
      if (error.type === 'StripeInvalidRequestError' || error.type === 'StripeCardError') {
        return res.status(400).json({ error: error.message });
      }

      // If it's an unexpected error, a 500 is more appropriate
      res.status(500).json({ error: "❌ Internal Server Error: Could not create checkout session." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/payment-success", express.json(), async (req, res) => {
  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
    });

    if (session.payment_status === "paid") {
      console.log("✅ Payment successful:", session.id);

      // ✅ Just confirm the payment and redirect
      return res.redirect(`${FRONT_END}/payment-confirm`);
    } else {
      console.log("❌ Payment not successful");
      return res.redirect(`${FRONT_END}/payment-failed`);
    }

  } catch (error) {
    console.error("🚨 Error in /payment-success:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/customers/:customerId', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId presence
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch the user from the database
    const user = await User.findById(userId);

    // Check if the user exists and is a paying customer
    if (!user || user.isPayingCustomer === 'no') {
      return res.status(401).json({ message: "You need to be on a paid subscription first!" });
    }

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: req.params.customerId,
      return_url: `${FRONT_END}`, // Ensure FRONT_END is defined and points to your frontend
    });

    console.log(portalSession);

    // Return the URL to the frontend
    res.status(200).json({ url: portalSession.url });

  } catch (error) {
    console.error("Error creating billing portal session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET_KEY);
  } catch (err) {
    console.error("🚨 Webhook Signature Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventType = event.type;
  const eventData = event.data.object;

  console.log(`✅ Received event: ${eventType}`);

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        console.log("✅ New subscription started!");

        if (!eventData.metadata?.userId || !eventData.subscription || eventData.payment_status !== "paid") {
          console.error("🚨 Missing metadata or subscription ID, or payment not completed in checkout.session.completed");
          return res.status(400).send("Missing required metadata.");
        }

        const { userId, subscriptionType } = eventData.metadata;
        const stripeSubscriptionId = eventData.subscription;

        // Find existing active subscription
        let existingSubscription = await Subscription.findOne({ user_id: userId, status_type: "active" });

        if (existingSubscription) {
          if (existingSubscription.subscription_type === "premium") {
            console.log("❌ User already has Premium. No changes made.");
            return res.status(400).json({ message: "You already have a premium subscription." });
          }

          if (existingSubscription.subscription_type === "pro" && subscriptionType === "premium") {
            // ✅ Upgrade from Pro to Premium
            existingSubscription.status_type = "inactive"; // Mark old Pro subscription as inactive
            existingSubscription.ended_at = new Date(); // Save the end date
            await existingSubscription.save();

            // Create a new Premium subscription entry
            const newSubscription = new Subscription({
              user_id: userId,
              customer_id: eventData.customer,
              subscription_type: subscriptionType,
              start_date: new Date(),
              status_type: "active",
              stripeSubscriptionId: stripeSubscriptionId,
              lastPayment: new Date(),
            });

            await newSubscription.save();

            console.log("✅ Subscription upgraded from Pro to Premium.");
            return res.status(200).json({ message: "Subscription upgraded successfully." });
          }

          if (existingSubscription.subscription_type === "free") {
            // ✅ Upgrade from Free to Pro or Premium
            existingSubscription.status_type = "inactive"; // Mark old subscription as inactive
            existingSubscription.ended_at = new Date(); // Save the end date
            await existingSubscription.save();

            // Create a new Premium subscription entry
            const newSubscription = new Subscription({
              user_id: userId,
              customer_id: eventData.customer,
              subscription_type: subscriptionType,
              start_date: new Date(),
              status_type: "active",
              stripeSubscriptionId: stripeSubscriptionId,
              lastPayment: new Date(),
            });

            await newSubscription.save();
            console.log(`✅ Free user upgraded to ${subscriptionType}.`);
            return res.status(200).json({ message: `Subscription upgraded to ${subscriptionType} successfully.` });
          }

          if (existingSubscription && existingSubscription.subscription_type !== "free") {
            console.log("❌ User already has an active non-free subscription. No new subscription created.");
            return res.status(400).json({ message: "You already have a paid subscription." });
          }
        }

        // ✅ If no active subscription, create a new one
        const startDate = new Date();

        if (subscriptionType === "pro" || subscriptionType === "premium") {
          endDate.setFullYear(startDate.getFullYear() + 1);
        }

        const newSubscription = new Subscription({
          user_id: userId,
          customer_id: eventData.customer,
          subscription_type: subscriptionType,
          start_date: startDate,
          status_type: "active",
          stripeSubscriptionId: stripeSubscriptionId,
          lastPayment: new Date(),
        });

        await newSubscription.save();
        console.log("✅ New subscription record created.");

        break;
      }

      case 'invoice.paid': {
        console.log("✅ Subscription renewed:", eventData.subscription);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.subscription },
          { status_type: "active", lastPayment: new Date() }
        );

        break;
      }

      case 'invoice.payment_failed': {
        console.log("❌ Payment failed for:", eventData.subscription);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.subscription },
          { status_type: eventData.attempt_count > 3 ? "canceled" : "past_due" }
        );

        break;
      }

      case 'customer.subscription.updated': {
        console.log("🔄 Subscription updated:", eventData.id);

        // Check if the subscription is trialing but the trial period has expired
        if (
          eventData.status === "trialing" &&
          eventData.trial_end &&
          (eventData.trial_end * 1000) < Date.now()
        ) {
          console.log("🚀 Trial period has ended. Updating subscription to active.");
          eventData.status = "active"; // override status for update
        }

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.id },
          {
            status_type: eventData.status,
            end_date: new Date(eventData.current_period_end) * 1000,
            cancelAtPeriodEnd: eventData.cancel_at_period_end,
            current_period_start: new Date(eventData.current_period_start) * 1000,
            current_period_end: new Date(eventData.current_period_end) * 1000,
          }
        );

        if (!eventData.cancel_at_period_end) {
          console.log("✅ User reactivated subscription.");
        }

        break;
      }
      case "customer.subscription.created": {
        console.log("🚀 New subscription created:", eventData.id);

        // Check if the subscription includes a trial
        const isTrialing = eventData.status === "trialing";

        // If this is a premium subscription that included a trial, update the user's trial status
        if (eventData.metadata.subscription_type === "premium" && eventData.trial_start) {
          // Convert trial_start (a Unix timestamp) to a Date if needed
          await User.findByIdAndUpdate(eventData.metadata.userId, { trialUsed: true, trialActivatedAt: new Date(eventData.trial_start * 1000) });
          console.log("✅ Marked trial as used for user:", eventData.metadata.userId);
        }

        const newSubscription = new Subscription({
          user_id: eventData.metadata.userId,
          customer_id: eventData.customer,
          subscription_type: eventData.metadata.subscriptionType,
          status_type: isTrialing ? "trialing" : "active",
          current_period_start: new Date(eventData.current_period_start) * 1000,
          current_period_end: new Date(eventData.current_period_end) * 1000,
          stripeSubscriptionId: eventData.id,
          start_date: new Date(),
          end_date: new Date(eventData.current_period_end * 1000),
          cancelAtPeriodEnd: false,
        });

        await newSubscription.save();

        console.log(`✅ Subscription ${isTrialing ? "with trial" : ""} created successfully.`);
        break;
      }
      case 'customer.subscription.deleted': {
        console.log("❌ Subscription canceled:", eventData.id);

        // Find the canceled subscription
        const canceledSubscription = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.id },
          { status_type: "canceled", canceledAt: new Date() },
          { new: true }
        );

        if (!canceledSubscription) {
          console.error("🚨 Subscription not found.");
          return res.status(404).send("Subscription not found.");
        }

        // Check if the user has any active subscriptions left
        const activeSubscriptions = await Subscription.find({
          user_id: canceledSubscription.user_id,
          status_type: "active",
        });

        if (activeSubscriptions.length === 0) {
          console.log("🔄 No active subscriptions found. Reverting user to Free Plan.");

          // Create a new Free subscription entry if the user has no active plans
          const newFreeSubscription = new Subscription({
            user_id: canceledSubscription.user_id,
            customer_id: `free-${canceledSubscription._id}`, // Placeholder since Stripe isn't used here
            subscription_type: "free",
            status_type: "active",
            start_date: new Date(),
            end_date: null, // Free plan has no expiry
            current_period_start: null,
            current_period_end: null,
            stripeSubscriptionId: null,
            cancelAtPeriodEnd: false,
            lastPayment: null,
          });

          await newFreeSubscription.save();
          console.log("✅ User reverted to Free Plan.");
        } else {
          console.log("✅ User still has an active subscription. No action needed.");
        }
      }

      default:
        console.warn(`⚠️ Unhandled event: ${eventType}`, JSON.stringify(eventData, null, 2))
    }

    res.status(200).send("Webhook received.");
  } catch (error) {
    console.error(`🚨 Error processing webhook for event ${eventType}:`, error);
    res.status(500).send("Internal Server Error.");
  }
});

router.get('/data', express.json(), async (req, res) => {
  try {
    const allData = await Subscription.find({});
    res.json(allData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
})

router.delete("/delete/:id", express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Subscription.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({ message: "❌ Payment not found" });
    }
    res.status(204).json({ message: "✅ Entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Internal Server error" });
  }
})

module.exports = router;
