const Joi = require("joi");
const { ValidationError } = require("../middleware/errors");

function userSignUpValidator(user) {
    const schema = Joi.object({
      firstname: Joi.string()
        .min(3)
        .max(25)
        .error(
            new ValidationError(
              "first name must be between 3 and 25 characters"
            )
          ),
      lastname: Joi.string()
        .min(3)
        .max(25)
        .error(
            new ValidationError(
              "last name must be between 3 and 25 characters"
            )
          ),
      email: Joi.string()
        .required()
        .email()
        .error(
          new ValidationError(
            "please input a valid email"
          )
        ),
      password: Joi.string()
        .required()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/)
        .messages({ "string.pattern.base": "invalid password" })
        .error(
          new ValidationError(
            "password must be between 8 and 25 characters with at least one number, a lowercase letter, an uppercase letter"
          )
        ),
      
    }).strict();
  
    return schema.validate(user);
  }


  function userLogInValidator(user) {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .email()
        .error(
          new ValidationError(
            "invalid email or password"
          )
        ),
        password: Joi.string()
        .required()
        .min(8)
        .max(25)
        .error(
          new ValidationError(
            "invalid email or password"
          )
        )
    }).strict();
  
    return schema.validate(user);
}

function forgotPasswordValidator(user){
const schema = Joi.object({
  email:Joi.string()
  .required()
  .email()
  .error(
    new ValidationError(
      "Input a valid email"
    )
  ),
}).strict()

return schema.validate(user);
}

function resetPasswordValidator(user) {
  const schema = Joi.object({
  password: Joi.string()
  .required()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/)
  .messages({ "string.pattern.base": "invalid password" })
  .error(
    new ValidationError(
      "password must be between 8 and 25 characters with at least one number, a lowercase letter, an uppercase letter"
    )
  )
}).strict()

return schema.validate(user);
}



  module.exports = {userSignUpValidator, userLogInValidator, forgotPasswordValidator, resetPasswordValidator};