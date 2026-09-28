const { body, param } = require("express-validator");

exports.addSellerListingValidator = [
	body("sku").notEmpty().withMessage("SKU is required"),
	body("catalogProductId")
		.notEmpty()
		.isInt({ min: 1 })
		.withMessage("Catalog Product ID is required"),
	body("price")
		.isFloat({ gt: 0 })
		.withMessage("Price must be a positive number"),
	body("inventory")
		.isInt({ min: 0 })
		.withMessage("Inventory must be a non-negative integer"),
];

exports.updateSellerListingValidator = [
	body("sku")
		.length({ min: 1, max: 64 })
		.withMessage("SKU must be a non-empty string with a maximum length of 64 characters"),
	body("price")
		.isFloat({ gt: 0 })
		.withMessage("Price must be a positive number"),
	body("inventory")
		.isInt({ min: 0 })
		.withMessage("Inventory must be a non-negative integer"),
	param("listingId").isInt().withMessage("Listing ID must be an integer"),
];

exports.getListingByIdValidator = [
	param("listingId").isInt().withMessage("Listing ID must be an integer"),
];

exports.deactivateSellerListingValidator = [
	param("listingId").isInt().withMessage("Listing ID must be an integer"),
];

exports.activateSellerListingValidator = [
	param("listingId").isInt().withMessage("Listing ID must be an integer"),
];
