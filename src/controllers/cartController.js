const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const { BadUserRequestError, NotFoundError } = require("../middleware/errors");

const validateMongoId = require("../validators/mongoIdValidator");


// Add product to cart
const addProductToCart = async (req, res, next) => {
    const productId = req.params.id
    const variantId = req.query.id
    const productqty = req.body.quantity

    // check if id is a valid MongoId
    const { error } = validateMongoId(req.params);
    if (error)
        throw new BadUserRequestError(
            "Please pass in a valid mongoId for the product"
        );

    // validate id of the product's variant to add to cart
    const variantIdValidatorResponse = validateMongoId(req.query)
    const variantIdValidatorError = variantIdValidatorResponse.error
    if (variantIdValidatorError) throw new BadUserRequestError("Please pass in a valid mongoId for the variant")

    const product = await Product.findOne({ _id: productId })
    if (!product) throw new NotFoundError(`The product with this id: ${productId}, does not exist`)

    const variant = product.variations.find(avariant => avariant._id == variantId)
    if (!variant) throw new NotFoundError(`Product ${productId} does not have a variant with this id: ${variantId}`)

    let cart = await Cart.findOne({ customer: req.user._id })
    if (cart) {    // customer has products in cart
        let prdIndex = cart.orders.findIndex((p) => p.variantId == variantId);
        if (prdIndex > -1) {      // product found in cart
            let orderedProduct = cart.orders[prdIndex]
            orderedProduct.quantity += (+productqty)
            orderedProduct.subtotal += parseFloat(variant.price * productqty)
            cart.orders[prdIndex] = orderedProduct
            cart.total += (+variant.price * productqty)
        } else { //product not found in cart
            cart.orders.push({ variantId, variantInfo: variant.variantInfo, productName: product.productName, unit_price: +variant.price, quantity: productqty, subtotal: +variant.price * productqty });
            cart.total += (+variant.price * productqty)
        }
        cart = await cart.save();
        return res.status(200).json({
            message: "product successfully added to cart",
            status: "Success",
            cart: cart
        });
    } else {    // cart does not exist for user
        const newCart = await Cart.create({
            customer: req.user._id,
            orders: [{ variantId, variantInfo: variant.variantInfo, productName: product.productName, unit_price: variant.price, quantity: productqty, subtotal: +variant.price * productqty }],
            total: +variant.price * productqty
        });
        return res.status(201).json({
            status: "Success",
            message: "product successfully added to cart",
            cart: newCart
        });
    }
}

// View products in the cart
const viewCart = async (req, res) => {
    let cart = await Cart.findOne({ customer: req.user._id })
    if (!cart)
        return res.status(404).json({
            status: "Failed",
            message: "No items in your cart"
        });

    res.status(200).json({
        status: "Success",
        message: "Cart found!",
        cart: cart
    });
}

// Delete an order from orders in cart
const deleteOrder = async (req, res) => {
    const variantId = req.params.id
    const { error } = validateMongoId(req.params)
    if (error) throw new BadUserRequestError("Please pass in a valid mongoId for the product")

    let cart = await Cart.findOne({ customer: req.user._id })
    if (!cart)
        return res.status(404).json({
            status: "Failed",
            message: "Cart not found for this user"
        });

    for (let order of cart.orders) {
        if (order.variantId == variantId) {
            cart.total -= order.subtotal
            cart.orders.splice(order, 1)
            cart = await cart.save();

            if (cart.orders.length == 0) {  // all orders removed from cart
                await Cart.findOneAndDelete({ customer: req.user._id })
                return res.status(200).json({
                    status: "Success",
                    message: "Your cart is now empty, add products to place order",
                });
            }

            return res.status(200).json({
                status: "Success",
                message: "order removed successfully from cart",
                cart: cart
            });
        }
    }

    res.status(404).json({
        status: "Failed",
        message: "order does not exist in cart"
    });

}

//mock user wallet
const userWallet = {
    balance: 200000,
    currency: "Naira",
    token: "1234xxx",
}

// mock payment and delete cart for user
const submitOrder = async (req, res) => {
    const { amount, currency, token, cartId } = req.body;

    // check if cartId is a valid MongoId
    const { error } = validateMongoId({cartId});
    if (error)
        throw new BadUserRequestError(
            "Please pass in a valid mongoId for the cart"
        );

    if (currency != userWallet.currency || amount > userWallet.balance || token !== userWallet.token) {
        return res.status(400).json({
            status: "Failed",
            message: "An error occurred while processing the payment"
        })
    }

    const usercart = await Cart.findOneAndDelete({ _id: cartId }) // delete cart for user
    if (!usercart) throw new NotFoundError(`cart does not exist`)

    res.status(200).json({
        status: "Success",
        message: "Thank you for shopping with Barb Shoe Store. Your payment has been verified!",
    });
}


module.exports = { addProductToCart, viewCart, deleteOrder, submitOrder }