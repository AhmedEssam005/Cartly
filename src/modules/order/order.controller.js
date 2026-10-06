const orderService = require("./order.service");
const logger = require("../../configs/logger");

exports.createOrder = async (req, res, next) => {
	try {
		const order = await orderService.createOrder(
			req.user.id,
			req.body.addressId,
		);
		res.status(201).json(order);
		logger.info(`Order created successfully for userId: ${req.user.id}`);
	} catch (error) {
		next(error);
	}
};

exports.getOrders = async (req, res, next) => {
	try {
		const orders = await orderService.getOrders(req.user.id);
		res.status(200).json(orders);
		logger.info(`Orders retrieved successfully for userId: ${req.user.id}`);
	} catch (error) {
		next(error);
	}
};

exports.getOrderById = async (req, res, next) => {
	try {
		const order = await orderService.getOrderById(
			req.params.orderId,
			req.user.id,
		);
		res.status(200).json(order);
		logger.info(
			`Order ${req.params.orderId} retrieved successfully for userId: ${req.user.id}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.cancelOrder = async (req, res, next) => {
	try {
		const cancelledOrder = await orderService.cancelOrder(
			req.params.orderId,
			req.user.id,
		);
		res.status(200).json(cancelledOrder);
		logger.info(
			`Order ${req.params.orderId} cancelled successfully for userId: ${req.user.id}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.getSellerOrders = async (req, res, next) => {
	try {
		const sellerOrders = await orderService.getSellerOrders(req.user.id);
		res.status(200).json(sellerOrders);
		logger.info(
			`Seller orders retrieved successfully for sellerId: ${req.user.id}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.getSellerOrderById = async (req, res, next) => {
	try {
		const sellerOrder = await orderService.getSellerOrderById(
			req.params.orderSellerId,
			req.user.id,
		);
		res.status(200).json(sellerOrder);
		logger.info(
			`Seller order ${req.params.orderSellerId} retrieved successfully for sellerId: ${req.user.id}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.updateSellerOrderStatus = async (req, res, next) => {
	try {
		const { fulfillmentStatus, trackingNumber } = req.body;
		const updatedSellerOrder = await orderService.updateSellerOrderStatus(
			req.params.orderSellerId,
			req.user.id,
			fulfillmentStatus,
			trackingNumber,
		);
		res.status(200).json(updatedSellerOrder);
		logger.info(
			`Seller order ${req.params.orderSellerId} updated to ${fulfillmentStatus} for sellerId: ${req.user.id}`,
		);
	} catch (error) {
		next(error);
	}
};
