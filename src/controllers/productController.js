const User = require("../models/userModel");
const Product = require("../models/productModel");
const { BadUserRequestError, NotFoundError } = require("../middleware/errors");
const {
    addProductValidator, editProductValidator, addVariantValidator
} = require("../validators/productValidator");
const validateMongoId = require("../validators/mongoIdValidator");


const addProduct = async (req, res, next) => {
    const { error } = addProductValidator(req.body);
    if (error) throw error;

    // change user input to number
    req.body.price = parseFloat(req.body.price);
    req.body.noInStock = parseInt(req.body.noInStock);

    const { productName, category } = req.body;
    const productExists = await Product.findOne({
        $and: [{ productName }, { category }],
    });

    if (productExists) {
        throw new BadUserRequestError("Error: this product has already been added");
    }
    const newProduct = await Product.create(req.body);
    // newProduct.variations.push(req.body.variations)
    // newProduct.save()

    res.status(201).json({
        status: "Success",
        message: "new product added",
        newProduct,
    });
};


const addVariant = async (req, res, next) => {
    const productId = req.params.id;
    const { error } = validateMongoId(req.params);
    if (error)
        throw new BadUserRequestError(
            "Please pass in a valid mongoId for the product"
        );

    const addVariantValidatorResponse = await addVariantValidator(req.body)
    const addVariantValidatorError = addVariantValidatorResponse.error
    if (addVariantValidatorError) throw addVariantValidatorError

    const product = await Product.findById({ _id: productId })
    if (!product) {
        throw new BadUserRequestError("Error: no such product found");
    }

    // change user input to number
    req.body.price = parseFloat(req.body.price);
    req.body.noInStock = parseInt(req.body.noInStock);

    product.variations.push(req.body)
    product.save()

    res.status(200).json({
        status: "Success",
        message: "product variant added",
        product,
    });
};


const editProduct = async (req, res, next) => {
    const productId = req.params.id;
    const variantId = req.query.id;
    let productUpdate;

    // check if id is a valid MongoId
    const { error } = validateMongoId(req.params);
    if (error)
        throw new BadUserRequestError(
            "Please pass in a valid mongoId for the product"
        );

    // validate id of the product's variant to edit
    const variantIdValidatorResponse = validateMongoId(req.query)
    const variantIdValidatorError = variantIdValidatorResponse.error
    if (variantIdValidatorError) throw new BadUserRequestError("Please pass in a valid mongoId for the variant")

    // validate product info to edit
    const editProductValidatorResponse = await editProductValidator(req.body)
    const editProductValidatorError = editProductValidatorResponse.error
    if (editProductValidatorError) throw editProductValidatorError

    // change user input to number
    if (req.body.price) req.body.price = parseFloat(req.body.price);
    if (req.body.noInStock) req.body.noInStock = parseInt(req.body.noInStock);

    // check if product exists in database
    const product = await Product.findById({ _id: productId });
    if (!product) throw new NotFoundError("Error: no such product found");

    // if request to update a variation of the product is made, find the variation and update
    if (variantId != undefined) {
        for (let i = 0; i < product.variations.length; i++) {
            if (product.variations[i]._id == variantId) {
                if (req.body.price) product.variations[i].price = req.body.price;
                if (req.body.noInStock) product.variations[i].noInStock = req.body.noInStock;
                if (req.body.imageUrl) product.variations[i].imageUrl = req.body.imageUrl;
                if (req.body.lowStockNo) product.variations[i].lowStockNo = req.body.lowStockNo;
                if (req.body.isVisible) product.variations[i].isVisible = req.body.isVisible;
                product.save()

                return res.status(200).json({
                    status: "Success",
                    message: "product updated successfully",
                    product
                });
            }
        }
        throw new NotFoundError("Error:no such product found"); // no matches for variantId
    }
    else {
        productUpdate = await Product.findByIdAndUpdate({ _id: productId }, { $set: req.body }, { new: true });
    }
    res.status(200).json({
        status: "Success",
        message: "product updated successfully",
        product: productUpdate,
    });
};


module.exports = {
    addProduct, addVariant, editProduct
};