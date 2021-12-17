const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

const { userById, read, update, history } = require("../controllers/user");
// sends back a json response with the user info coming from req.profile
router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/orders/by/user/:userId", requireSignin, isAuth, history);

// whenever there's a 'userId' in the route parameter, call the userById method:
router.param("userId", userById);

module.exports = router;
