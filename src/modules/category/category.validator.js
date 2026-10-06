const { body, query, param } = require("express-validator");

exports.getCategoriesValidator = [
	query("parentCategoryId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("parentCategoryId must be a positive integer"),
];

exports.getCategoryByIdValidator = [
	param("categoryId")
		.exists()
		.withMessage("categoryId is required")
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
];

exports.createCategoryValidator = [
	body("slug").exists().notEmpty().withMessage("slug is required"),
	body("name").exists().notEmpty().withMessage("name is required"),
	body("parentCategoryId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("parentCategoryId must be a positive integer"),
];

exports.updateCategoryValidator = [
	param("categoryId")
		.exists()
		.withMessage("categoryId is required")
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
	body("slug").exists().notEmpty().withMessage("slug is required"),
	body("name").exists().notEmpty().withMessage("name is required"),
	body("parentCategoryId")
		.optional()
		.isInt({ min: 1 })
		.withMessage("parentCategoryId must be a positive integer"),
];

exports.deleteCategoryValidator = [
	param("categoryId")
		.exists()
		.withMessage("categoryId is required")
		.isInt({ min: 1 })
		.withMessage("categoryId must be a positive integer"),
];
