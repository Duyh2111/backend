const express = require("express");
const router = express.Router();

const {
  createCategory,
  categoryById,
  readCategory,
  updateCategory,
  removeCategory,
  listAllCategories,
} = require("../controllers/category");
const { requireSignin, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/adminCategory/:categoryId", readCategory);
router.post("/createCategory/:userId", requireSignin, isAdmin, createCategory);
router.put(
  "/updateCategory/:categoryId/:userId",
  requireSignin,
  isAdmin,
  updateCategory
);
router.delete(
  "/deleteCategory/:categoryId/:userId",
  requireSignin,
  isAdmin,
  removeCategory
);
router.get("/categories", listAllCategories);

// whenever there's a 'categoryId' in the route parameter,
// call the categoryById middleware method
router.param("categoryId", categoryById);
router.param("userId", userById);

module.exports = router;
