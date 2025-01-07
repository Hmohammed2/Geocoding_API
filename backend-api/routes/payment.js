require("dotenv").config();
const { STRIPE_PRIVATE_KEY, STRIPE_PRICE_ID_PRO, STRIPE_PRICE_ID_PREMIUM ,FRONT_END, BACK_END, STRIPE_WEBHOOK_SECRET_KEY } = process.env;
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const Subscription = require("../models/Subscription");

router.post("/create-checkout-session", async (req, res) => {
  const { userId, subscriptionType } = req.body;
  try {
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
      cancel_url: `${FRONT_END}/cancel`,
      metadata: {
        userId, // id needs to be linked here for the subscription data later
      },
    });

    console.log("Session created:", session);

    res.json({ url: session.url }); // url will need to be sent to the frontend
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/payment-success", async (req, res) => {
  try {
    // Retrieve the session. If you need more details, you can expand the line_items or customer
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    if (session.payment_status === "paid") {
      res.status(200).json({ message: "Customer has paid" });
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers/:customerId', async (req, res) => {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: req.params.customerId,
    return_url: `${FRONTEND_URL}`
  })

  console.log(portalSession)

  res.redirect(portalSession.url)
})

// router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET_KEY);
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     // When event that subscription is started
//     case 'checkout.session.completed':
//       console.log("New subscription Started!")
//       console.log(event.data)
//       break;
//     // Event when payment is successful (Every subscription interval)
//     case 'invoice.paid':
//       console.log("Invoice paid!")
//       console.log(event.data)
//       break;
//     // Event when payment fails due to card problems or insufficent funds
//     case 'invoice.payment_failed':
//       console.log("Invoice failed!")
//       console.log(event.data)
//       break;
//     // Event when subscription is updated
//     case "customer.subscription.updated":
//     console.log('Subscription updated!')
//     console.log(event.data)
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }
//   // Return a 200 response to acknowledge
//   res.send() 
// })

module.exports = router;
