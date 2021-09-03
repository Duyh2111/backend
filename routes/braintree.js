const express = require("express");
const router = express.Router();

const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { Token, Payment } = require("../controllers/braintree");

router.get("/braintree/getToken/:userId", requireSignin, Token);
router.post("/braintree/payment/:userId", requireSignin, Payment);
router.param("userId", userById);

module.exports = router;
