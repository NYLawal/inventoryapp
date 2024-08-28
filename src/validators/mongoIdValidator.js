const Joi = require("joi")
Joi.objectId = require('joi-objectid')(Joi)


function validateMongoId(product) {
const schema =
  Joi.object({
    id: Joi.objectId()
  }).strict()

return schema.validate(product);
}


module.exports = validateMongoId;





