const express = require("express");
const paymentController = require("./payment.controller");
const paymentValidator = require("./payment.validator");
const isAuth = require("../../middlewares/isAuth");
const isAdmin = require("../../middlewares/isAdmin");
const commonValidator = require("../../middlewares/commonValidator");

const orderPaymentRouter = express.Router({ mergeParams: true });
const adminPaymentRouter = express.Router();

// Customer routes: /api/orders/:orderId/payment
orderPaymentRouter.post(
	"/:orderId/payment",
	isAuth,
	paymentValidator.orderIdParamValidator,
	commonValidator,
	paymentController.createPayment,
);

orderPaymentRouter.get(
	"/:orderId/payment",
	isAuth,
	paymentValidator.orderIdParamValidator,
	commonValidator,
	paymentController.getPaymentByOrderId,
);

// Admin routes: /api/admin/payments
adminPaymentRouter.get(
	"/",
	isAuth,
	isAdmin,
	paymentValidator.adminListPaymentsValidator,
	commonValidator,
	paymentController.getAdminPayments,
);

adminPaymentRouter.get(
	"/:paymentId",
	isAuth,
	isAdmin,
	paymentValidator.paymentIdParamValidator,
	commonValidator,
	paymentController.getAdminPaymentById,
);

adminPaymentRouter.patch(
	"/:paymentId/approve",
	isAuth,
	isAdmin,
	paymentValidator.paymentIdParamValidator,
	commonValidator,
	paymentController.approvePayment,
);

adminPaymentRouter.patch(
	"/:paymentId/reject",
	isAuth,
	isAdmin,
	paymentValidator.paymentIdParamValidator,
	commonValidator,
	paymentController.rejectPayment,
);

module.exports = {
	orderPaymentRouter,
	adminPaymentRouter,
};
