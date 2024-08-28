// module.exports = router;const express = require('express');
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { admin } = require("../middleware/roles");

const {
  addProduct, addVariant, editProduct
} = require("../controllers/productController");


router.route("/add").post([authenticateUser, admin], addProduct);
router.route("/addvariant/:id").post([authenticateUser, admin], addVariant);
router.patch("/edit/:id", [authenticateUser, admin], editProduct)




module.exports = router;
