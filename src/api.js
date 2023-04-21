// This is your test secret API key.
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const serverless = require("serverless-http");

const router = express.Router();
console.log("process.env.STRIPE_KEY")
console.log(process.env.STRIPE_KEY)
app.use(express.json());
app.use(cors());

const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.map((item) => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name,
            },
            unit_amount: item.unit_amount,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/fail`,
    });
    res.status(200).send({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/", (req, res) => {
  res.json({
    hello: "hi this is is stripe backend",
  });
});

app.use(`/.netlify/functions/api`, router);

module.exports.handler = serverless(app);
