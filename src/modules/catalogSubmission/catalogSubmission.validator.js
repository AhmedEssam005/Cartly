const { param, body } = require("express-validator");

exports.getCatalogSubmissionByIdValidator = [
	param("submissionId")
		.notEmpty()
		.withMessage("submissionId is required")
		.isInt()
		.withMessage("submissionId must be an integer"),
];

exports.rejectCatalogSubmissionValidator = [
	param("submissionId")
		.notEmpty()
		.withMessage("submissionId is required")
		.isInt()
		.withMessage("submissionId must be an integer"),
	body("reviewComment")
		.optional()
		.isString()
		.withMessage("reviewComment must be a string"),
];

exports.createCatalogSubmissionValidator = [
	body("title")
		.notEmpty()
		.withMessage("title is required")
		.isString()
		.withMessage("title must be a string"),

	body("description")
		.notEmpty()
		.withMessage("description is required")
		.isString()
		.withMessage("description must be a string"),

	body("brand")
		.notEmpty()
		.withMessage("brand is required")
		.isString()
		.withMessage("brand must be a string"),

	body("gtin").optional().isString().withMessage("gtin must be a string"),

	body("categories")
		.isArray({ min: 1 })
		.withMessage("categories must be a non-empty array"),

	body("categories.*").isInt().withMessage("each category must be an integer"),

	body("images")
		.isArray({ min: 1 })
		.withMessage("images must be a non-empty array"),

	body("images.*").isString().withMessage("each image must be a string (URL)"),
];

exports.approveCatalogSubmissionValidator = [
	param("submissionId")
		.notEmpty()
		.withMessage("submissionId is required")
		.isInt()
		.withMessage("submissionId must be an integer"),

	body("reviewComment")
		.optional()
		.isString()
		.withMessage("reviewComment must be a string"),
];
