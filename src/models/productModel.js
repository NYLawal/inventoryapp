const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        variations: [{
            price: Number,
            noInStock: Number,
            lowStockNo: Number,
            imageUrl: {
                type: String,
                default: "",
            },
            isVisible: {
                type: Boolean,
                default: true,
            },
        }],
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

productSchema.index({ "productName": "text", "description": "text", "category": "text" });
module.exports = Product;
