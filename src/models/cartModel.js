const mongoose = require ("mongoose");


const CartSchema = new mongoose.Schema({
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orders: {
      type: [{
        variantId: {
            type: mongoose.Types.ObjectId
          },
          productName: {
            type: String,
           },
          variantInfo: {
            type: String,
           },
          unit_price: {
            type: Number,
            default: 0,
           },
          quantity: {
            type: Number,
            default: 0,
           },
         subtotal: {
             type: Number,
             default: 0,
           },
      }],
    },
    total: {
      type: Number,
      default: 0,
    }
 },
{
  timestamps: true
}) 


const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;