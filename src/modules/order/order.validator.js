const { body, param } = require("express-validator");

exports.createOrderValidator = [
	body("addressId")
		.isInt({ min: 1 })
		.withMessage("addressId must be a positive integer"),
];

exports.getOrderByIdValidator = [
	param("orderId")
		.isInt({ min: 1 })
		.withMessage("orderId must be a positive integer"),
];

exports.cancelOrderValidator = [
	param("orderId")
		.isInt({ min: 1 })
		.withMessage("orderId must be a positive integer"),
];

exports.getSellerOrderByIdValidator = [
	param("orderSellerId")
		.isInt({ min: 1 })
		.withMessage("orderSellerId must be a positive integer"),
];

exports.updateSellerOrderStatusValidator = [
	param("orderSellerId")
		.isInt({ min: 1 })
		.withMessage("orderSellerId must be a positive integer"),
	body("fulfillmentStatus")
		.isIn(["processing", "shipped", "delivered"])
		.withMessage(
			"fulfillmentStatus must be one of: processing, shipped, delivered",
		),
	body("trackingNumber")
		.optional()
		.isString()
		.trim()
		.withMessage("trackingNumber must be a string"),
];
