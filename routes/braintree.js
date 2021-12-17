const express = require("express");
const router = express.Router();

const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { Token, Payment } = require("../controllers/braintree");

router.get("/getToken/:userId", requireSignin, Token);
router.post("/payment/:userId", requireSignin, Payment);

// Anytime there is a 'userId' in the URL param,
// we want to run the userById controller method
router.param("userId", userById);

module.exports = router;
