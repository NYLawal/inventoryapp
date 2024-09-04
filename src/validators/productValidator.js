const Joi = require("joi");
const { ValidationError } = require("../middleware/errors");


function addProductValidator(product) {
    const schema = Joi.object({
        productName: Joi.string()
            .min(5)
            .max(50)
            .required()
            .error(
                new ValidationError(
                    "product name cannot be empty and must be between 5 and 50 characters"
                )
            ),
        description: Joi.string()
            .required()
            .min(5)
            .max(255)
            .error(
                new ValidationError(
                    "please input a description of the product"
                )
            ),
        category: Joi.string()
            .required()
            .min(5)
            .max(50)
            .error(
                new ValidationError(
                    "please input the product's category between 5 and 50 characters"
                )
            ),
        variations: Joi.object({
            variantInfo: Joi.string().required().error(
                new ValidationError(
                    "please input something specific to this variant"
                )
            ),
            price: Joi.number().required().error(
                new ValidationError(
                    "please input the product's price"
                )
            ),
            noInStock: Joi.number().required().error(
                new ValidationError(
                    "please input how many of this product are in stock"
                )
            ),
            lowStockNo: Joi.number().required().error(
                new ValidationError(
                    "please input the quantity of this product for low stock alert"
                )
            ),
            imageUrl: Joi.string(),
            isVisible: Joi.boolean()
        })
    }).strict();

    return schema.validate(product);
}

function addVariantValidator(product) {
    const schema = Joi.object({
        variantInfo: Joi.string().required().error(
            new ValidationError(
                "please input something specific to this variant"
            )
        ),
        price: Joi.number().required().error(
            new ValidationError(
                "please input the product's price"
            )
        ),
        noInStock: Joi.number().required().error(
            new ValidationError(
                "please input how many of this product are in stock"
            )
        ),
        lowStockNo: Joi.number().required().error(
            new ValidationError(
                "please input the quantity of this product for low stock alert"
            )
        ),
        imageUrl: Joi.string(),
        isVisible: Joi.boolean()
    })
        .strict();

    return schema.validate(product);
}


function editProductValidator(product) {
    const schema = Joi.object({
        productName: Joi.string()
            .min(5)
            .max(50)
            .error(
                new ValidationError(
                    "product name must be between 5 and 50 characters"
                )
            ),
        description: Joi.string()
            .min(5)
            .max(255)
            .error(
                new ValidationError(
                    "please input a description between 5 and 255 characters"
                )
            ),
        category: Joi.string()
            .min(5)
            .max(50)
            .error(
                new ValidationError(
                    "please input the product's category between 5 and 50 characters"
                )
            ),
        variantInfo: Joi.string().error(
            new ValidationError(
                "please input something specific to this variant"
            )
        ),
        price: Joi.number().error(
            new ValidationError(
                "please input a valid price for the product"
            )
        ),
        noInStock: Joi.number().error(
            new ValidationError(
                "please input a valid number in stock for this product"
            )
        ),
        lowStockNo: Joi.number().error(
            new ValidationError(
                "please input a valid number for low stock alert"
            )
        ),
        imageUrl: Joi.string(),
        isVisible: Joi.boolean()
    })
        .strict();

    return schema.validate(product);
}



module.exports = { addProductValidator, addVariantValidator, editProductValidator };