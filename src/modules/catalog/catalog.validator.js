const { body, param, query } = require("express-validator");

exports.getAllBrandsValidator = [
	query("search").optional().isString().withMessage("Search must be a string"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Limit must be a positive integer"),
];

exports.getCatalogProductByIdValidator = [
	param("productId")
		.notEmpty()
		.isInt()
		.withMessage("Product ID must be a valid integer"),
];

exports.getCatalogProductByGtinValidator = [
	param("gtin")
		.isString({ min: 8 })
		.withMessage("GTIN must be a valid string with at least 8 characters"),
];

exports.getCatalogProductsValidator = [
	query("search").optional().isString().withMessage("Search must be a string"),
	query("brand").optional().isString().withMessage("Brand must be a string"),
	query("categoryId")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Category ID must be a valid integer"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Limit must be a positive integer"),
];

exports.createCatalogProductValidator = [
	body("title")
		.notEmpty()
		.isString()
		.withMessage("Title is required and must be a string"),
	body("brand").notEmpty().isString().withMessage("Brand must be a string"),
	body("description")
		.optional()
		.isString()
		.withMessage("Description must be a string"),
	body("gtin")
		.notEmpty()
		.isString({ min: 8 })
		.withMessage(
			"GTIN is required and must be a valid string with at least 8 characters",
		),
	body("images")
		.optional()
		.isArray({ min: 1 })
		.withMessage(
			"Images are required and must be an array with at least one element",
		),
	body("productCategories")
		.optional()
		.isArray({ min: 1 })
		.withMessage(
			"Product categories are required and must be an array with at least one element",
		),
];

exports.updateCatalogProductValidator = [
	param("productId").notEmpty().withMessage("Product ID is required"),
	body("title")
		.notEmpty()
		.isString()
		.withMessage("Title is required and must be a string"),
	body("brand")
		.notEmpty()
		.isString()
		.withMessage("Brand is required and must be a string"),
	body("description")
		.optional()
		.isString()
		.withMessage("Description must be a string"),
	body("gtin")
		.notEmpty()
		.isString({ min: 8 })
		.withMessage(
			"GTIN is required and must be a valid string with at least 8 characters",
		),
	body("images")
		.optional()
		.isArray({ min: 1 })
		.withMessage("Images must be an array with at least one element"),
	body("productCategories")
		.optional()
		.isArray({ min: 1 })
		.withMessage(
			"Product categories must be an array with at least one element",
		),
];

exports.softDeleteCatalogProductValidator = [
	param("productId").notEmpty().isInt().withMessage("Product ID is required"),
];
