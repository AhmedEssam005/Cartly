const { param, query } = require("express-validator");

exports.orderIdParamValidator = [
	param("orderId")
		.isInt({ min: 1 })
		.withMessage("orderId must be a positive integer"),
];

exports.paymentIdParamValidator = [
	param("paymentId")
		.isInt({ min: 1 })
		.withMessage("paymentId must be a positive integer"),
];

exports.adminListPaymentsValidator = [
	query("status")
		.optional()
		.isIn(["pending", "paid", "failed", "refunded", "partially_refunded"])
		.withMessage("Invalid payment status filter"),
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("limit must be between 1 and 100"),
];
