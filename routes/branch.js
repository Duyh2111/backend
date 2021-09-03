const express = require("express");
const router = express.Router();

const {
  create,
  branchById,
  read,
  update,
  remove,
  list,
} = require("../controllers/branch");
const { requireSignin, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/branch/:branchId", read);
router.post("/branch/create/:userId", requireSignin, isAdmin, create);
router.put("/branch/:branchId/:userId", requireSignin, isAdmin, update);
router.delete("/branch/:branchId/:userId", requireSignin, isAdmin, remove);
router.get("/branches", list);

router.param("branchId", branchById);
router.param("userId", userById);

module.exports = router;
