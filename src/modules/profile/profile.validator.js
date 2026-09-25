const { body, param } = require("express-validator");

const optionalText = (field, label) =>
	body(field)
		.optional({ values: "null" })
		.isString()
		.withMessage(`${label} must be a string`)
		.trim()
		.isLength({ max: 255 })
		.withMessage(`${label} must be at most 255 characters`);

const requiredText = (field, label) =>
	body(field)
		.exists({ values: "falsy" })
		.withMessage(`${label} is required`)
		.isString()
		.withMessage(`${label} must be a string`)
		.trim()
		.notEmpty()
		.withMessage(`${label} cannot be empty`)
		.isLength({ max: 255 })
		.withMessage(`${label} must be at most 255 characters`);

const addressFieldsValidator = [
	optionalText("label", "label"),
	requiredText("recipientName", "recipientName"),
	body("phoneNumber")
		.exists({ values: "falsy" })
		.withMessage("phoneNumber is required")
		.isString()
		.withMessage("phoneNumber must be a string")
		.trim()
		.matches(/^[+0-9() -]{7,20}$/)
		.withMessage("phoneNumber must be a valid phone number"),
	requiredText("streetLine1", "streetLine1"),
	optionalText("streetLine2", "streetLine2"),
	requiredText("city", "city"),
	optionalText("state", "state"),
	optionalText("postalCode", "postalCode"),
	requiredText("country", "country"),
];

exports.addressIdValidator = [
	param("addressId")
		.isInt({ min: 1 })
		.withMessage("addressId must be a positive integer"),
];

exports.createAddressValidator = addressFieldsValidator;
exports.updateAddressValidator = [
	...exports.addressIdValidator,
	...addressFieldsValidator,
];
