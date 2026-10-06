const { param, query, body } = require("express-validator");

exports.sellerIdParamValidator = [
	param("sellerId").isUUID().withMessage("sellerId must be a valid UUID"),
];

exports.productIdParamValidator = [
	param("productId")
		.isInt({ min: 1 })
		.withMessage("productId must be a positive integer"),
];

exports.submissionIdParamValidator = [
	param("submissionId")
		.isInt({ min: 1 })
		.withMessage("submissionId must be a positive integer"),
];

exports.categoryIdParamValidator = [
	param("categoryId")
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
];

exports.listSellersValidator = [
	query("kycStatus")
		.optional()
		.isIn(["pending", "approved", "rejected"])
		.withMessage("kycStatus must be pending, approved, or rejected"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("limit must be between 1 and 100"),
];

exports.listSubmissionsValidator = [
	query("status")
		.optional()
		.isIn(["pending", "approved", "rejected"])
		.withMessage("status must be pending, approved, or rejected"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("limit must be between 1 and 100"),
];

exports.reviewSubmissionValidator = [
	param("submissionId")
		.isInt({ min: 1 })
		.withMessage("submissionId must be a positive integer"),
	body("reviewComment")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 500 })
		.withMessage("reviewComment cannot exceed 500 characters"),
];

exports.createCategoryValidator = [
	body("name")
		.isString()
		.trim()
		.isLength({ min: 1, max: 255 })
		.withMessage("name is required and must be 1-255 characters"),
	body("slug")
		.isString()
		.trim()
		.isLength({ min: 1, max: 255 })
		.withMessage("slug is required and must be 1-255 characters"),
	body("parentCategoryId")
		.optional({ values: "null" })
		.isInt({ min: 1 })
		.withMessage("parentCategoryId must be a positive integer"),
];

exports.updateCategoryValidator = [
	param("categoryId")
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
	body("name")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 255 }),
	body("slug")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 255 }),
	body("parentCategoryId")
		.optional({ values: "null" })
		.isInt({ min: 1 }),
];
