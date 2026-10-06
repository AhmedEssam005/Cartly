const { body, param } = require("express-validator");

const cartOwnerValidation = [
	(req, res, next) => {
		const hasUser = req.user && req.user.id;
		const hasSession = req.cookies && req.cookies.sessionToken;
		if (!hasUser && !hasSession) {
			const error = new Error("Authentication or sessionToken cookie required");
			error.statusCode = 401;
			return next(error);
		}
		next();
	},
];

exports.getCartValidation = [...cartOwnerValidation];

exports.addToCartValidation = [
	...cartOwnerValidation,
	body("listingId")
		.notEmpty()
		.isInt({ min: 1 })
		.withMessage("listingId must be a positive integer"),
	body("quantity")
		.notEmpty()
		.isInt({ min: 1 })
		.withMessage("quantity must be at least 1"),
];

exports.removeFromCartValidation = [
	...cartOwnerValidation,
	param("listingId")
		.notEmpty()
		.isInt({ min: 1 })
		.withMessage("listingId must be a positive integer"),
];

exports.decreaseCartItemQuantityBy1Validation = [
	...cartOwnerValidation,
	param("listingId")
		.notEmpty()
		.isInt({ min: 1 })
		.withMessage("listingId must be a positive integer"),
];

exports.clearCartValidation = [...cartOwnerValidation];

exports.mergeCartValidation = [
	(req, res, next) => {
		if (!req.user || !req.user.id) {
			const error = new Error("Authentication required to merge cart");
			error.statusCode = 401;
			return next(error);
		}
		if (!req.cookies || !req.cookies.sessionToken) {
			const error = new Error("Guest sessionToken cookie required to merge");
			error.statusCode = 400;
			return next(error);
		}
		next();
	},
];
