const Joi = require("joi");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(", ");
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }),
  role: Joi.string().valid("admin", "soc", "employee").default("employee")
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema
};
