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
  hideProduct,
  getProductsbySearch,
  deleteProduct
} = require("../controllers/productController");


router.post("/add", [authenticateUser, admin], addProduct);
router.post("/addvariant/:id", [authenticateUser, admin], addVariant);
router.patch("/edit/:id", [authenticateUser, admin], editProduct)
router.patch("/hide/:id", [authenticateUser, admin], hideProduct)
router.get("/all", getAllProducts)
router.get("search/:keyword", getProductsbySearch)
router.get("/:id", getOneProduct)
router.post("/alert/:id", lowStockAlert)
router.delete("/:id",[authenticateUser, admin], deleteProduct)




module.exports = router;
