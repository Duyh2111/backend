const express = require("express");
const router = express.Router();

const { requireSignin, isAdmin } = require("../controllers/auth");
const { userById, addOrderToHistory } = require("../controllers/user");
const { create, listOrders, getStatus, updateStatus, orderById } = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");

router.post(
    "/order/create/:userId",
    requireSignin,
    addOrderToHistory,
    decreaseQuantity,
    create
);

router.get('/order/list/:userId', requireSignin, isAdmin, listOrders)
router.get('/order/status-values/:userId', requireSignin, isAdmin, getStatus)
router.put(
  "/order/:orderId/status/:userId",
  requireSignin,
  isAdmin,
  updateStatus
);
router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;
