const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");
const { admin } = require("../middleware/roles");

const {
    addProductToCart,
    viewCart,
    deleteOrder,
    submitOrder
   } = require("../controllers/cartController");
   
   
   router.route("/view").get([authenticateUser], viewCart);
   router.route("/add/:id/").post([authenticateUser], addProductToCart);
   router.route("/processpayment").post([authenticateUser], submitOrder);
   router.route("/deleteorder/:id/").delete([authenticateUser], deleteOrder);
   
   
   module.exports = router;