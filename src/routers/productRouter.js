// module.exports = router;const express = require('express');
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { admin } = require("../middleware/roles");

const {
  addProduct, 
  addVariant, 
  editProduct,
  getAllProducts,
  getOneProduct,
  lowStockAlert,
  hideProduct
} = require("../controllers/productController");


router.post("/add", [authenticateUser, admin], addProduct);
router.post("/addvariant/:id", [authenticateUser, admin], addVariant);
router.patch("/edit/:id", [authenticateUser, admin], editProduct)
router.patch("/hide/:id", [authenticateUser, admin], hideProduct)
router.get("/all", getAllProducts)
router.get("/:id", getOneProduct)
router.post("/alert/:id", lowStockAlert)




module.exports = router;
