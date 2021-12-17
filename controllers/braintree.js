const User = require("../models/user");
const braintree = require("braintree");
require("dotenv").config();

// connect to braintree use
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.Token = (req, res) => {
  // Use the gateway variable and call .generate() method on it
  // generate takes two arguments "empty object", "function"
  gateway.clientToken.generate({}, function (err, response) {
    if (!err) {
      res.send(response);
    } else {
      res.status(500).send(err);
    }
  });
};

exports.Payment = (req, res) => {
  // Get the payment method from client side:
  let nonceFromTheClient = req.body.paymentMethodNonce;
  // Get the amount from client side
  let amountFromTheClient = req.body.amount;
  // connecting to the braintree using gateway and call .transaction.sale() method on gateway
  let newTransaction = gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (!error) {
        res.status(200).json(result);
      } else {
        res.status(500).json(error);
      }
    }
  );
};
