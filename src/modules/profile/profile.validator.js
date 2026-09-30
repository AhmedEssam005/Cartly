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

exports.updateProfileValidator = [
	body("firstName")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("firstName must be 1-50 characters"),
	body("lastName")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("lastName must be 1-50 characters"),
];

exports.sellerKycValidator = [
	body("nationalId")
		.isString()
		.trim()
		.isLength({ min: 14, max: 14 })
		.withMessage("nationalId must be exactly 14 digits"),
	body("storeName")
		.isString()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("storeName must be between 2 and 100 characters"),
	body("tin")
		.isString()
		.trim()
		.isLength({ min: 9, max: 12 })
		.withMessage("tin (tax number) must be between 9 and 12 characters"),
	body("bankIban")
		.isString()
		.trim()
		.isLength({ min: 15, max: 34 })
		.withMessage("bankIban must be between 15 and 34 characters"),
	body("storeLogo")
		.optional()
		.isString()
		.trim(),
];

