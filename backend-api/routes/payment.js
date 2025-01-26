require("dotenv").config();
const { STRIPE_PRIVATE_KEY, STRIPE_PRICE_ID_PRO, STRIPE_PRICE_ID_PREMIUM, FRONT_END, BACK_END, STRIPE_WEBHOOK_SECRET_KEY } = process.env;
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const Subscription = require("../models/Subscription");
const User = require("../models/User");

router.post("/create-checkout-session", express.json(), async (req, res) => {
  const { userId, subscriptionType } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Fetch the user's current active subscription
    const existingSubscription = await Subscription.findOne({
      user_id: userId,
      status_type: "Active",
    });

    if (existingSubscription) {
      if (existingSubscription.subscription_type === "premium") {
        return res.status(400).json({ message: "You already have a premium subscription." });
      }

      if (existingSubscription.subscription_type === "pro" && subscriptionType === "premium") {
        // ✅ User is upgrading from Pro to Premium → Update Subscription Instead
        const updatedSubscription = await stripe.subscriptions.update(
          existingSubscription.stripeSubscriptionId,
          { cancel_at_period_end: false, items: [{ price: STRIPE_PRICE_ID_PREMIUM }] }
        );

        existingSubscription.subscription_type = "premium";
        existingSubscription.stripeSubscriptionId = updatedSubscription.id;
        await existingSubscription.save();

        return res.json({ message: "Subscription upgraded successfully." });
      }

      // ❌ Prevent Pro → Pro upgrades
      if (existingSubscription.subscription_type === "pro" && subscriptionType === "pro") {
        return res.status(400).json({ message: "You already have a Pro subscription." });
      }
    }

    // ✅ If the user has a free subscription, allow upgrade
    if (!existingSubscription || existingSubscription.subscription_type === "free") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: subscriptionType === "pro" ? STRIPE_PRICE_ID_PRO : STRIPE_PRICE_ID_PREMIUM,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${BACK_END}/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONT_END}/home`,
        metadata: { userId, subscriptionType },
      });

      return res.json({ url: session.url });
    }

    return res.status(400).json({ message: "Invalid subscription state." });

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

        const { userId, subscriptionType } = eventData.metadata;
        const stripeSubscriptionId = eventData.subscription;

        // Find existing active subscription
        let existingSubscription = await Subscription.findOne({ user_id: userId, status_type: "Active" });

        if (existingSubscription) {
          if (existingSubscription.subscription_type === "premium") {
            console.log("❌ User already has Premium. No changes made.");
            return res.status(400).json({ message: "You already have a premium subscription." });
          }

          if (existingSubscription.subscription_type === "pro" && subscriptionType === "premium") {
            // ✅ Upgrade from Pro to Premium
            existingSubscription.subscription_type = "premium";
            existingSubscription.stripeSubscriptionId = stripeSubscriptionId;
            existingSubscription.lastPayment = new Date();
            existingSubscription.status_type = "Active";
            existingSubscription.cancelAtPeriodEnd = false;
            await existingSubscription.save();

            console.log("✅ Subscription upgraded from Pro to Premium.");
            return res.status(200).json({ message: "Subscription upgraded successfully." });
          }

          if (existingSubscription.subscription_type === "free") {
            // ✅ Upgrade from Free to Pro or Premium
            existingSubscription.subscription_type = subscriptionType; // Change to Pro or Premium
            existingSubscription.stripeSubscriptionId = stripeSubscriptionId;
            existingSubscription.customer_id = eventData.customer
            existingSubscription.lastPayment = new Date();
            existingSubscription.status_type = "Active";
            existingSubscription.cancelAtPeriodEnd = false;
            await existingSubscription.save();

            console.log(`✅ Free user upgraded to ${subscriptionType}.`);
            return res.status(200).json({ message: `Subscription upgraded to ${subscriptionType} successfully.` });
          }

          console.log("❌ User already has an active subscription. No new subscription created.");
          return res.status(400).json({ message: "You already have an active subscription." });
        }

        // ✅ If no active subscription, create a new one
        const startDate = new Date();
        let endDate = new Date(startDate);
        if (subscriptionType === "pro" || subscriptionType === "premium") {
          endDate.setFullYear(startDate.getFullYear() + 1);
        }

        const newSubscription = new Subscription({
          user_id: userId,
          customer_id: eventData.customer,
          subscription_type: subscriptionType,
          start_date: startDate,
          end_date: endDate,
          status_type: "Active",
          stripeSubscriptionId: stripeSubscriptionId,
          cancelAtPeriodEnd: false,
          lastPayment: new Date(),
        });

        await newSubscription.save();
        console.log("✅ New subscription record created.");

        // Update user to be a paying customer
        await User.findByIdAndUpdate(userId, { isPayingCustomer: "yes" });

        break;
      }

      case 'invoice.paid': {
        console.log("✅ Subscription renewed:", eventData.subscription);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.subscription },
          { status: "active", lastPayment: new Date() }
        );

        break;
      }

      case 'invoice.payment_failed': {
        console.log("❌ Payment failed for:", eventData.subscription);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.subscription },
          { status: "past_due" }
        );

        break;
      }

      case 'customer.subscription.updated': {
        console.log("🔄 Subscription updated:", eventData.id);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.id },
          {
            status_type: eventData.status,
            cancelAtPeriodEnd: eventData.cancel_at_period_end,
          }
        );

        break;
      }

      case 'customer.subscription.deleted': {
        console.log("❌ Subscription canceled:", eventData.id);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: eventData.id },
          { status: "canceled", canceledAt: new Date() }
        );

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${eventType}`);
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
      return res.status(404).json({ message: "payment not found" });
    }
    res.status(204).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
})

module.exports = router;
