const cartService = require("./cart.service");
const logger = require("../../configs/logger");

exports.getCart = async (req, res, next) => {
	try {
		const userId = req.user ? req.user.id : null;
		const sessionToken = req.cookies.sessionToken || null;
		const cartItems = await cartService.getCart({ userId, sessionToken });
		res.status(200).json(cartItems);
		logger.info(
			`Cart items retrieved successfully for userId: ${userId}, sessionToken: ${sessionToken}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.addToCart = async (req, res, next) => {
	try {
		const userId = req.user ? req.user.id : null;
		const sessionToken = req.cookies.sessionToken || null;
		const { listingId, quantity } = req.body;
		const cartItem = await cartService.addToCart({
			userId,
			sessionToken,
			listingId,
			quantity,
		});
		const newToken = cartItem.sessionToken;
		if (newToken) {
			res.cookie("sessionToken", newToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
			});
		}
		res.status(201).json(cartItem);
		logger.info(
			`Item added to cart successfully for userId: ${userId}, sessionToken: ${sessionToken}, listingId: ${listingId}, quantity: ${quantity}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.removeFromCart = async (req, res, next) => {
	try {
		const userId = req.user ? req.user.id : null;
		const sessionToken = req.cookies.sessionToken || null;
		const { listingId } = req.params;
		const deletedItem = await cartService.removeFromCart(
			{ userId, sessionToken },
			listingId,
		);
		res.status(204).send();
		logger.info(
			`Item removed from cart successfully for userId: ${userId}, sessionToken: ${sessionToken}, listingId: ${listingId}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.decreaseCartItemQuantityBy1 = async (req, res, next) => {
	try {
		const userId = req.user ? req.user.id : null;
		const sessionToken = req.cookies.sessionToken || null;
		const { listingId } = req.params;
		const updatedItem = await cartService.decreaseCartItemQuantityBy1(
			{ userId, sessionToken },
			listingId,
		);
		res.status(200).json(updatedItem);
		logger.info(
			`Item quantity decreased by 1 successfully for userId: ${userId}, sessionToken: ${sessionToken}, listingId: ${listingId}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.mergeGuestCartWithUserCart = async (req, res, next) => {
	try {
		const userId = req.user ? req.user.id : null;
		const sessionToken = req.cookies.sessionToken || null;
		const mergedCart = await cartService.mergeGuestCartToUserCart({
			userId,
			sessionToken,
		});
		res.status(201).json(mergedCart);
		logger.info(
			`Guest cart merged with user cart successfully for userId: ${userId}, sessionToken: ${sessionToken}`,
		);
	} catch (error) {
		next(error);
	}
};

exports.clearCart = async (req, res, next) => {
	try {
		const userId = req.user ? req.user.id : null;
		const sessionToken = req.cookies.sessionToken || null;
		await cartService.clearCart({ userId, sessionToken });
		res.status(204).send();
		logger.info(
			`Cart cleared successfully for userId: ${userId}, sessionToken: ${sessionToken}`,
		);
	} catch (error) {
		next(error);
	}
};
