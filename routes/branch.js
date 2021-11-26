const express = require("express");
const router = express.Router();

const {
  createBranch,
  branchById,
  readBranch,
  updateBranch,
  removeBranch,
  listAllBranches,
} = require("../controllers/branch");
const { requireSignin, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/adminBranch/:branchId", readBranch);
router.post("/createBranch/:userId", requireSignin, isAdmin, createBranch);
router.put(
  "/updateBranch/:branchId/:userId",
  requireSignin,
  isAdmin,
  updateBranch
);
router.delete(
  "/deleteBranch/:branchId/:userId",
  requireSignin,
  isAdmin,
  removeBranch
);
router.get("/branches", listAllBranches);

router.param("branchId", branchById);
router.param("userId", userById);

module.exports = router;
