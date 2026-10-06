const paymentService = require("./payment.service");
const logger = require("../../configs/logger");

exports.createPayment = async (req, res, next) => {
	try {
		const orderId = Number(req.params.orderId);
		const payment = await paymentService.createPaymentForOrder(
			orderId,
			req.user.id,
		);
		logger.info(
			`Payment initiated for order ${orderId} by userId: ${req.user.id}`,
		);
		res.status(201).json(payment);
	} catch (error) {
		next(error);
	}
};

exports.getPaymentByOrderId = async (req, res, next) => {
	try {
		const orderId = Number(req.params.orderId);
		const payment = await paymentService.getPaymentByOrderId(
			orderId,
			req.user.id,
		);
		res.status(200).json(payment);
	} catch (error) {
		next(error);
	}
};

exports.getAdminPayments = async (req, res, next) => {
	try {
		const { status, page, limit } = req.query;
		const result = await paymentService.getAdminPayments({
			status,
			page,
			limit,
		});
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.getAdminPaymentById = async (req, res, next) => {
	try {
		const paymentId = Number(req.params.paymentId);
		const payment = await paymentService.getAdminPaymentById(paymentId);
		res.status(200).json(payment);
	} catch (error) {
		next(error);
	}
};

exports.approvePayment = async (req, res, next) => {
	try {
		const paymentId = Number(req.params.paymentId);
		const result = await paymentService.approvePayment(paymentId);
		logger.info(`Admin ${req.user.id} approved payment ${paymentId}`);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.rejectPayment = async (req, res, next) => {
	try {
		const paymentId = Number(req.params.paymentId);
		const result = await paymentService.rejectPayment(paymentId);
		logger.info(`Admin ${req.user.id} rejected payment ${paymentId}`);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};
