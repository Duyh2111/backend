const express = require("express");
const router = express.Router();

const {
  createProduct,
  productById,
  readProduct,
  removeProduct,
  updateProduct,
  listAllProducts,
  listCategoriesRelated,
  listBranchRelated,
  listAllCategories,
  listAllBranches,
  listBySearch,
  photoProduct,
  productListSearch,
} = require("../controllers/product");
const { requireSignin, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/adminProduct/:productId", readProduct);
router.post("/createProduct/:userId", requireSignin, isAdmin, createProduct);
router.delete(
  "/deleteProduct/:productId/:userId",
  requireSignin,
  isAdmin,
  removeProduct
);
router.put(
  "/updateProduct/:productId/:userId",
  requireSignin,
  isAdmin,
  updateProduct
);

router.get("/products", listAllProducts);
router.get("/search", productListSearch);
router.get("/relatedCategory/:productId", listCategoriesRelated);
router.get("/relatedBranch/:productId", listBranchRelated);
router.get("/categories", listAllCategories);
router.get("/branches", listAllBranches);
router.post("/by/search", listBySearch);
router.get("/product/photo/:productId", photoProduct);

router.param("userId", userById);
// whenever there's a 'productId' in the route parameter, call the productById method
router.param("productId", productById);

module.exports = router;
