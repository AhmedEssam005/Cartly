const { body, param, oneOf, cookie } = require("express-validator");

const tokenUserIdValidation = [
	oneOf([
		body("user.id").notEmpty().isUUID(),
		cookie("sessionToken").isString().notEmpty(),
	]),
];

exports.addToCartValidation = [
	...tokenUserIdValidation,
	body("listingId").notEmpty().isInt(),
	body("quantity").notEmpty().isInt({ min: 1 }),
];

exports.getCartValidation = [...tokenUserIdValidation];

exports.removeFromCartValidation = [
	...tokenUserIdValidation,
	param("listingId").notEmpty().isInt(),
];
exports.decreaseCartItemQuantityBy1Validation = [
	...tokenUserIdValidation,
	param("listingId").notEmpty().isInt(),
];

exports.clearCartValidation = [...tokenUserIdValidation];

exports.mergeCartValidation = [...tokenUserIdValidation];
