const { param, query } = require("express-validator");

exports.productIdParamValidator = [
	param("productId")
		.isInt({ min: 1 })
		.withMessage("productId must be a positive integer"),
];

exports.categoryIdParamValidator = [
	param("categoryId")
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
];

exports.listingIdParamValidator = [
	param("listingId")
		.isInt({ min: 1 })
		.withMessage("listingId must be a positive integer"),
];

exports.browseProductsValidator = [
	query("search")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 100 })
		.withMessage("search query cannot exceed 100 characters"),
	query("categoryId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
	query("brand")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 100 }),
	query("sort")
		.optional()
		.isIn(["newest", "title_asc", "title_desc"])
		.withMessage("sort must be one of: newest, title_asc, title_desc"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("limit must be between 1 and 100"),
];
