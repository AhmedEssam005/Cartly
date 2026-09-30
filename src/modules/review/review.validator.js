const { param, query, body } = require("express-validator");

exports.listingIdParamValidator = [
	param("listingId")
		.isInt({ min: 1 })
		.withMessage("listingId must be a positive integer"),
];

exports.reviewIdParamValidator = [
	param("reviewId")
		.isInt({ min: 1 })
		.withMessage("reviewId must be a positive integer"),
];

exports.createReviewValidator = [
	param("listingId")
		.isInt({ min: 1 })
		.withMessage("listingId must be a positive integer"),
	body("rating")
		.isInt({ min: 1, max: 5 })
		.withMessage("rating is required and must be an integer between 1 and 5"),
	body("comment")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 1000 })
		.withMessage("comment cannot exceed 1000 characters"),
];

exports.updateReviewValidator = [
	param("reviewId")
		.isInt({ min: 1 })
		.withMessage("reviewId must be a positive integer"),
	body("rating")
		.optional()
		.isInt({ min: 1, max: 5 })
		.withMessage("rating must be an integer between 1 and 5"),
	body("comment")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 1000 })
		.withMessage("comment cannot exceed 1000 characters"),
];

exports.listReviewsValidator = [
	query("rating")
		.optional()
		.isInt({ min: 1, max: 5 })
		.withMessage("rating must be between 1 and 5"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("limit must be between 1 and 100"),
];
