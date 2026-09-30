const db = require("../../db/index");
const {
	orders,
	orderAddress,
	orderSeller,
	orderListing,
	addresses,
	cart,
	cartListing,
	sellerListings,
} = require("../../db/schema/schema");
const crypto = require("crypto");
const { eq, and, gte } = require("drizzle-orm");

exports.createOrder = async (userId, addressId) => {
	return await db.transaction(async (tx) => {
		const userCart = await tx
			.select({
				cartId: cart.cartId,
				listingId: sellerListings.listingId,
				quantity: cartListing.quantity,
				price: sellerListings.price,
				inventory: sellerListings.inventory,
				isActive: sellerListings.isActive,
				sellerId: sellerListings.sellerId,
			})
			.from(cart)
			.innerJoin(cartListing, eq(cart.cartId, cartListing.cartId))
			.innerJoin(
				sellerListings,
				eq(cartListing.listingId, sellerListings.listingId),
			)
			.where(eq(cart.userId, userId))
			.for("update");

		if (userCart.length === 0) {
			const error = new Error("Cart not found");
			error.statusCode = 404;
			throw error;
		}

		const [address] = await tx
			.select()
			.from(addresses)
			.where(
				and(eq(addresses.addressId, addressId), eq(addresses.userId, userId)),
			);

		if (!address) {
			const error = new Error("Address not found");
			error.statusCode = 404;
			throw error;
		}

		const orderedItems = [];

		for (const item of userCart) {
			if (!item.isActive || item.inventory < item.quantity) {
				const error = new Error(
					`Item with listingId ${item.listingId} is not available or has insufficient inventory`,
				);
				error.statusCode = 400;
				throw error;
			}

			const sellerGroup = orderedItems.find(
				(orderedItem) => orderedItem.seller.sellerId === item.sellerId,
			);

			const itemSubtotal = item.price * item.quantity;
			const itemPlatformFee = Math.round(itemSubtotal * 0.05);

			if (!sellerGroup) {
				orderedItems.push({
					seller: {
						sellerId: item.sellerId,
						subtotal: itemSubtotal,
						platformFee: itemPlatformFee,
					},
					items: [
						{
							listingId: item.listingId,
							quantity: item.quantity,
							price: item.price,
						},
					],
				});
			} else {
				sellerGroup.items.push({
					listingId: item.listingId,
					quantity: item.quantity,
					price: item.price,
				});

				sellerGroup.seller.subtotal += itemSubtotal;
				sellerGroup.seller.platformFee += itemPlatformFee;
			}
		}

		const [order] = await tx
			.insert(orders)
			.values({
				userId,
			})
			.returning();

		await tx.insert(orderAddress).values({
			orderId: order.orderId,
			recipientName: address.recipientName,
			phoneNumber: address.phoneNumber,
			streetLine1: address.streetLine1,
			streetLine2: address.streetLine2,
			city: address.city,
			state: address.state,
			postalCode: address.postalCode,
			country: address.country,
		});

		const orderSellers = await tx
			.insert(orderSeller)
			.values(
				orderedItems.map((item) => ({
					orderId: order.orderId,
					sellerId: item.seller.sellerId,
					subtotal: item.seller.subtotal,
					platformFee: item.seller.platformFee,
				})),
			)
			.returning();

		for (const orderSellerItem of orderSellers) {
			const sellerGroup = orderedItems.find(
				(item) => item.seller.sellerId === orderSellerItem.sellerId,
			);

			await tx.insert(orderListing).values(
				sellerGroup.items.map((item) => ({
					orderSellerId: orderSellerItem.orderSellerId,
					listingId: item.listingId,
					quantity: item.quantity,
					historicalUnitPrice: item.price,
				})),
			);

			for (const item of sellerGroup.items) {
				await tx
					.update(sellerListings)
					.set({
						inventory: sql`${sellerListings.inventory} - ${item.quantity}`,
						updatedAt: new Date(),
					})
					.where(eq(sellerListings.listingId, item.listingId));
			}
		}

		const cartId = userCart[0].cartId;

		await tx.delete(cartListing).where(eq(cartListing.cartId, cartId));

		await tx.delete(cart).where(eq(cart.cartId, cartId));

		return order;
	});
};
