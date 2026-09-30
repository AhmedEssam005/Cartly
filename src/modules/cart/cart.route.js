const router = require("express").Router();
const cartController = require("./cart.controller");
const cartValidator = require("./cart.validator");
const commonValidator = require("../../middlewares/commonValidator");
const opIsAuth = require("../../middlewares/opIsAuth");

router.get(
	"/",
	opIsAuth,
	cartValidator.getCartValidation,
	commonValidator,
	cartController.getCart,
);

router.post(
	"/add",
	opIsAuth,
	cartValidator.addToCartValidation,
	commonValidator,
	cartController.addToCart,
);

router.delete(
	"/remove/:listingId",
	opIsAuth,
	cartValidator.removeFromCartValidation,
	commonValidator,
	cartController.removeFromCart,
);

router.patch(
	"/decrease/:listingId",
	opIsAuth,
	cartValidator.decreaseCartItemQuantityBy1Validation,
	commonValidator,
	cartController.decreaseCartItemQuantityBy1,
);

router.delete(
	"/clear",
	opIsAuth,
	cartValidator.clearCartValidation,
	commonValidator,
	cartController.clearCart,
);

router.post(
	"/merge",
	opIsAuth,
	cartValidator.mergeCartValidation,
	commonValidator,
	cartController.mergeCart,
);

module.exports = router;
