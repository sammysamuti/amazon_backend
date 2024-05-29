const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { setGlobalOptions } = require("firebase-functions/v2");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();

setGlobalOptions({ maxInstances: 10 });
app.use(cors({ origin: true }));
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Success!",
  });
});

app.post("/payment/create", async (req, res) => {
  const total = parseInt(req.query.total, 10);
  if (total <= 0) {
    return res.status(403).json({
      message: "Total must be greater than 0",
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd",
  });

  console.log(paymentIntent);

  res.status(200).json({
    message: "Payment intent created successfully",
    clientSecret: paymentIntent.client_secret,
    paymentIntent,
  });
});

const port = 5000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

exports.api = onRequest(app);
