const router = require("express").Router();
const orderController = require("./order.controller");
const orderValidator = require("./order.validator");
const commonValidator = require("../../middlewares/commonValidator");
const isAuth = require("../../middlewares/isAuth");
const isSeller = require("../../middlewares/isSeller");

// Seller routes (isAuth + isSeller)
router.get("/seller", isAuth, isSeller, orderController.getSellerOrders);
router.get(
	"/seller/:orderSellerId",
	isAuth,
	isSeller,
	orderValidator.getSellerOrderByIdValidator,
	commonValidator,
	orderController.getSellerOrderById,
);
router.patch(
	"/seller/:orderSellerId/status",
	isAuth,
	isSeller,
	orderValidator.updateSellerOrderStatusValidator,
	commonValidator,
	orderController.updateSellerOrderStatus,
);

// Customer routes (isAuth)
router.post(
	"/",
	isAuth,
	orderValidator.createOrderValidator,
	commonValidator,
	orderController.createOrder,
);
router.get("/", isAuth, orderController.getOrders);
router.get(
	"/:orderId",
	isAuth,
	orderValidator.getOrderByIdValidator,
	commonValidator,
	orderController.getOrderById,
);
router.patch(
	"/:orderId/cancel",
	isAuth,
	orderValidator.cancelOrderValidator,
	commonValidator,
	orderController.cancelOrder,
);

module.exports = router;
