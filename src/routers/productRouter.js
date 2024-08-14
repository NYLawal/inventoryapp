// module.exports = router;const express = require('express');
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { admin } = require("../middleware/roles");

const {
  addProduct,
  viewAllProducts,
  viewProductsbySearch,
  getOneProduct,
  editProduct,
  deleteProduct
} = require("../controllers/productController");


router.route("/add").post([authenticateUser, admin], addProduct);
router.route("/all").get([authenticateUser, admin], viewAllProducts);
router.route("/search/:keyword").get(authenticateUser, viewProductsbySearch);
router
.route("/:id")
.get(authenticateUser, getOneProduct)
.patch([authenticateUser, admin, editImg], editProduct)
.delete([authenticateUser, admin], deleteProduct);



module.exports = router;
