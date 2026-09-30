const db = require("../../db/index");
const {
	cart,
	cartListing,
	sellerListings,
	catalogProducts,
	productImages,
} = require("../../db/schema/schema");
const { eq, and, sql } = require("drizzle-orm");
const crypto = require("crypto");

const identifyCartOwner = ({ userId, sessionToken }) => {
	if (userId) {
		return {
			type: "user",
			userId,
		};
	}

	if (sessionToken) {
		return {
			type: "guest",
			sessionToken,
		};
	}

	return {
		type: "guest",
		sessionToken: null,
	};
};

exports.getCart = async ({ userId, sessionToken }) => {
	const owner = identifyCartOwner({ userId, sessionToken });
	if (owner.type === "user" || (owner.type === "guest" && owner.sessionToken)) {
		const ownerCondition =
			owner.type === "user"
				? eq(cart.userId, owner.userId)
				: eq(cart.sessionToken, owner.sessionToken);

		const [userCart] = await db
			.select({ cartId: cart.cartId })
			.from(cart)
			.where(ownerCondition);

		if (!userCart?.cartId) {
			return [];
		}
		const userCartItems = await db
			.select({
				cartId: cart.cartId,
				listingId: sellerListings.listingId,
				quantity: cartListing.quantity,
				price: sql`${sellerListings.price} / 100.0`.mapWith(Number),
				title: catalogProducts.title,
				brand: catalogProducts.brand,
				imageUrl: productImages.imageUrl,
			})
			.from(cart)
			.innerJoin(cartListing, eq(cart.cartId, cartListing.cartId))
			.innerJoin(
				sellerListings,
				eq(cartListing.listingId, sellerListings.listingId),
			)
			.innerJoin(
				catalogProducts,
				eq(sellerListings.catalogProductId, catalogProducts.catalogProductId),
			)
			.leftJoin(
				productImages,
				and(
					eq(catalogProducts.catalogProductId, productImages.catalogProductId),
					eq(productImages.isPrimary, true),
				),
			)
			.where(eq(cart.cartId, userCart.cartId));
		return userCartItems;
	}

	return [];
};

exports.addToCart = async ({ userId, sessionToken }, listingId, quantity) => {
	const owner = identifyCartOwner({ userId, sessionToken });

	if (owner.type === "user") {
		return await db.transaction(async (tx) => {
			let [userCart] = await tx
				.select()
				.from(cart)
				.where(eq(cart.userId, owner.userId));
			if (!userCart) {
				const [newCart] = await tx
					.insert(cart)
					.values({ userId: owner.userId })
					.returning();
				userCart = newCart;
			}
			const [existingCartItem] = await tx
				.select()
				.from(cartListing)
				.where(
					and(
						eq(cartListing.cartId, userCart.cartId),
						eq(cartListing.listingId, listingId),
					),
				);

			const [listing] = await tx
				.select()
				.from(sellerListings)
				.where(eq(sellerListings.listingId, listingId));
			if (
				!listing ||
				!listing.isActive ||
				listing.inventory < Number(quantity) + (existingCartItem?.quantity || 0)
			) {
				const error = new Error(
					"Listing not found or insufficient inventory",
				);
				error.statusCode = 400;
				throw error;
			}

			let newCartItem;
			if (existingCartItem) {
				[newCartItem] = await tx
					.update(cartListing)
					.set({ quantity: existingCartItem.quantity + Number(quantity) })
					.where(eq(cartListing.cartListingId, existingCartItem.cartListingId))
					.returning();
			} else {
				[newCartItem] = await tx
					.insert(cartListing)
					.values({ cartId: userCart.cartId, listingId, quantity })
					.returning();
			}
			return newCartItem;
		});
	}

	if (owner.type === "guest" && !owner.sessionToken)
		owner.sessionToken = crypto.randomBytes(32).toString("hex");

	if (owner.type === "guest" && owner.sessionToken) {
		return await db.transaction(async (tx) => {
			let [guestCart] = await tx
				.select()
				.from(cart)
				.where(eq(cart.sessionToken, owner.sessionToken));
			if (!guestCart) {
				const [newCart] = await tx
					.insert(cart)
					.values({ sessionToken: owner.sessionToken })
					.returning();
				guestCart = newCart;
			}
			const [existingCartItem] = await tx
				.select()
				.from(cartListing)
				.where(
					and(
						eq(cartListing.cartId, guestCart.cartId),
						eq(cartListing.listingId, listingId),
					),
				);

			const [listing] = await tx
				.select()
				.from(sellerListings)
				.where(eq(sellerListings.listingId, listingId));
			if (
				!listing ||
				!listing.isActive ||
				listing.inventory < Number(quantity) + (existingCartItem?.quantity || 0)
			) {
				const error = new Error(
					"Listing not found or insufficient inventory",
				);
				error.statusCode = 400;
				throw error;
			}
			let newCartItem;
			if (existingCartItem) {
				[newCartItem] = await tx
					.update(cartListing)
					.set({ quantity: existingCartItem.quantity + Number(quantity) })
					.where(eq(cartListing.cartListingId, existingCartItem.cartListingId))
					.returning();
			} else {
				[newCartItem] = await tx
					.insert(cartListing)
					.values({ cartId: guestCart.cartId, listingId, quantity })
					.returning();
			}
			return { cartListing: newCartItem, sessionToken: owner.sessionToken };
		});
	}
};

exports.removeFromCart = async ({ userId, sessionToken }, listingId) => {
	const owner = identifyCartOwner({ userId, sessionToken });
	if (owner.type === "user" || (owner.type === "guest" && owner.sessionToken)) {
		const ownerCondition =
			owner.type === "user"
				? eq(cart.userId, owner.userId)
				: eq(cart.sessionToken, owner.sessionToken);
		const [cartRow] = await db
			.select({ cartId: cart.cartId })
			.from(cart)
			.where(ownerCondition);
		if (!cartRow) {
			const error = new Error("Cart not found");
			error.statusCode = 404;
			throw error;
		}
		const cartId = cartRow.cartId;
		const [deletedItem] = await db
			.delete(cartListing)
			.where(
				and(
					eq(cartListing.cartId, cartId),
					eq(cartListing.listingId, listingId),
				),
			)
			.returning();
		if (!deletedItem) {
			const error = new Error("Item not found in cart");
			error.statusCode = 404;
			throw error;
		}
	} else {
		const error = new Error("Cart owner not identified");
		error.statusCode = 400;
		throw error;
	}
};

exports.decreaseCartItemQuantityBy1 = async (
	{ userId, sessionToken },
	listingId,
) => {
	const owner = identifyCartOwner({ userId, sessionToken });
	if (owner.type === "user" || (owner.type === "guest" && owner.sessionToken)) {
		const ownerCondition =
			owner.type === "user"
				? eq(cart.userId, owner.userId)
				: eq(cart.sessionToken, owner.sessionToken);
		return await db.transaction(async (tx) => {
			const [cartRow] = await tx
				.select({ cartId: cart.cartId })
				.from(cart)
				.where(ownerCondition);
			if (!cartRow) {
				const error = new Error("Cart not found");
				error.statusCode = 404;
				throw error;
			}
			const cartId = cartRow.cartId;
			const [existingCartItem] = await tx
				.select()
				.from(cartListing)
				.where(
					and(
						eq(cartListing.cartId, cartId),
						eq(cartListing.listingId, listingId),
					),
				);
			if (!existingCartItem) {
				const error = new Error("Item not found in cart");
				error.statusCode = 404;
				throw error;
			}
			if (existingCartItem.quantity <= 1) {
				await tx
					.delete(cartListing)
					.where(eq(cartListing.cartListingId, existingCartItem.cartListingId));
				return { message: "Item removed from cart" };
			} else {
				const [updatedCartItem] = await tx
					.update(cartListing)
					.set({ quantity: existingCartItem.quantity - 1 })
					.where(eq(cartListing.cartListingId, existingCartItem.cartListingId))
					.returning();
				return { message: "Item quantity decreased by 1", updatedCartItem };
			}
		});
	} else {
		const error = new Error("Cart owner not identified");
		error.statusCode = 400;
		throw error;
	}
};

exports.mergeGuestCartToUserCart = async (userId, sessionToken) => {
	return await db.transaction(async (tx) => {
		const guestCart = await tx
			.select({
				cartId: cart.cartId,
				listingId: sellerListings.listingId,
				quantity: cartListing.quantity,
				inventory: sellerListings.inventory,
				isActive: sellerListings.isActive,
			})
			.from(cart)
			.innerJoin(cartListing, eq(cart.cartId, cartListing.cartId))
			.innerJoin(
				sellerListings,
				eq(cartListing.listingId, sellerListings.listingId),
			)
			.where(eq(cart.sessionToken, sessionToken));

		if (guestCart.length === 0) {
			return;
		}
		const guestCartId = guestCart[0].cartId;

		const userCart = await tx
			.select({
				cartId: cart.cartId,
				cartListingId: cartListing.cartListingId,
				listingId: cartListing.listingId,
				cartListingQuantity: cartListing.quantity,
			})
			.from(cart)
			.innerJoin(cartListing, eq(cart.cartId, cartListing.cartId))
			.where(eq(cart.userId, userId));

		if (userCart.length === 0) {
			const [updatedCart] = await tx
				.update(cart)
				.set({ userId: userId, sessionToken: null, updatedAt: new Date() })
				.where(eq(cart.cartId, guestCartId))
				.returning();
			return updatedCart;
		}

		for (const guestCartItem of guestCart) {
			if (
				guestCartItem.isActive === false ||
				guestCartItem.inventory < guestCartItem.quantity
			) {
				continue;
			}
			const userCartItem = userCart.find(
				(item) => item.listingId === guestCartItem.listingId,
			);
			if (userCartItem) {
				let newQuantity =
					userCartItem.cartListingQuantity + guestCartItem.quantity;
				if (newQuantity > guestCartItem.inventory) {
					newQuantity = guestCartItem.inventory;
				}
				await tx
					.update(cartListing)
					.set({ quantity: newQuantity })
					.where(eq(cartListing.cartListingId, userCartItem.cartListingId));
			} else {
				await tx.insert(cartListing).values({
					cartId: userCart[0].cartId,
					listingId: guestCartItem.listingId,
					quantity: guestCartItem.quantity,
				});
			}
		}
		await tx.delete(cart).where(eq(cart.sessionToken, sessionToken));
		const [updatedUserCart] = await tx
			.update(cart)
			.set({ updatedAt: new Date() })
			.where(eq(cart.userId, userId))
			.returning();
		return updatedUserCart;
	});
};

exports.clearCart = async ({ userId, sessionToken }) => {
	const owner = identifyCartOwner({ userId, sessionToken });
	if (owner.type === "user" || (owner.type === "guest" && owner.sessionToken)) {
		const ownerCondition =
			owner.type === "user"
				? eq(cart.userId, owner.userId)
				: eq(cart.sessionToken, owner.sessionToken);
		const [deletedCart] = await db
			.delete(cart)
			.where(ownerCondition)
			.returning({ cartId: cart.cartId });
		if (!deletedCart) {
			const error = new Error("Cart not found");
			error.statusCode = 404;
			throw error;
		}
	} else {
		const error = new Error("Cart owner not identified");
		error.statusCode = 400;
		throw error;
	}
};
