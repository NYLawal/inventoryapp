const Product = require("../models/productModel");
const { BadUserRequestError, NotFoundError } = require("../middleware/errors");
const {
    addProductValidator, editProductValidator, addVariantValidator
} = require("../validators/productValidator");
const validateMongoId = require("../validators/mongoIdValidator");
const SENDMAIL = require('../utils/mailHandler');


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

const getAllProducts = async (req, res, next) => {
    const productsExists = await Product.find({});

    if (!productsExists) {
        throw new NotFoundError("Error: no products found");
    }

    let prod_no = productsExists.length;

    res.status(200).json({
        status: "Success",
        message: `${prod_no} product(s) found`,
        products: productsExists
    });

};

const getOneProduct = async (req, res, next) => {
    const productExists = await Product.findById({ _id: req.params.id });

    if (!productExists) {
        throw new NotFoundError("Error: no such product found");
    }

    let prod_variants = productExists.variations.length;

    res.status(200).json({
        status: "Success",
        message: `product found with ${prod_variants} variants`,
        productExists
    });

};

const getProductsbySearch = async (req, res, next) => {
    const keyword = req.params.keyword;
    if (!keyword) {
        throw new BadUserRequestError(
            "Input a valid search term for the product(s)"
        );
    }

    const products = await Product.find({
        $or: [
            { productName: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
        ],
    })
        .sort({ keyword: 1 })
        .select("-createdAt -updatedAt -__v");

    if (products.length < 1) {
        throw new NotFoundError(`No products meet your search for ${keyword}`);
    }

    res.status(200).json({
        status: "Success",
        message: `${products.length} products found`,
        products,
    });
};

const lowStockAlert = async (req, res, next) => {
    const productId = req.params.id // product bought
    const variantId = req.query.id // variant bought

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

    const product = await Product.findById({ _id: productId });

    if (!product) {
        throw new NotFoundError("Error: no such product found");
    }

    // check if quantity of product variant remaining has reached the low stock quantity
    for (let i = 0; i < product.variations.length; i++) {
        if (product.variations[i]._id == variantId) {
            if (product.variations[i].lowStockNo == product.variations[i].noInStock) {
                let product_name = product.productName;
                let msg = `Hello admin, be informed that ${product_name} with variant id ${variantId} is low on stock.\n
                Only ${product.variations[i].noInStock} of it are remaining.`
                await SENDMAIL("demoadmin@gmail.com", "LOW STOCK ALERT!!", msg);
                return res.status(200).send("alert sent");
            }
        }
    }
    res.status(200).send("product is not yet low on stock");
};


const hideProduct = async (req, res, next) => {
    const productId = req.params.id;
    const variantId = req.query.id;

    // check if id is a valid MongoId
    const { error } = validateMongoId(req.params);
    if (error)
        throw new BadUserRequestError(
            "Please pass in a valid mongoId for the product"
        );

    // validate id of the product's variant to hide
    const variantIdValidatorResponse = validateMongoId(req.query)
    const variantIdValidatorError = variantIdValidatorResponse.error
    if (variantIdValidatorError) throw new BadUserRequestError("Please pass in a valid mongoId for the variant")


    // check if product exists in database
    const product = await Product.findById({ _id: productId });
    if (!product) throw new NotFoundError("Error: no such product found");

    // if variant to hide is specified, find the variant and hide
    if (variantId != undefined) {
        for (let i = 0; i < product.variations.length; i++) {
            if (product.variations[i]._id == variantId) {
                product.variations[i].isVisible = false;
                product.save()

                return res.status(200).json({
                    status: "Success",
                    message: "this variant's visibility is now set to false",
                    variant: product.variations[i]
                });
            }
        }
        throw new NotFoundError("Error:no such product found"); // no matches for variantId
    }
    else { // variant to hide is not specified, set all variants to hidden
        for (let i = 0; i < product.variations.length; i++) {
            product.variations[i].isVisible = false;
        }
        product.save()
    }
    res.status(200).json({
        status: "Success",
        message: "product's visibility is set to false",
        product
    });
};

const deleteProduct = async (req, res, next) => {
    const productId = req.params.id;
    const { error } = validateMongoId(req.params);
    if (error)
        throw new BadUserRequestError(
            "Please pass in a valid mongoId for the product"
        );

    const product = await Product.findById({ _id: productId });
    if (!product) throw new NotFoundError("Error: No such product exists");

    res.status(200).json({
        status: "Success",
        message: "Product successfully deleted",
    });

    res.status(500).json({
        status: "Failed",
        message: "Product not deleted",
    });
};


module.exports = {
    addProduct, addVariant, editProduct, getAllProducts, getOneProduct, getProductsbySearch, lowStockAlert, hideProduct, deleteProduct
};