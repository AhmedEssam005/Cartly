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
const { eq, and, gte, sql, desc, inArray } = require("drizzle-orm");

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
					subTotal: item.seller.subtotal,
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

exports.getOrders = async (userId) => {
	const userOrders = await db
		.select()
		.from(orders)
		.where(eq(orders.userId, userId))
		.orderBy(desc(orders.createdAt));

	if (userOrders.length === 0) {
		return [];
	}

	const orderIds = userOrders.map((order) => order.orderId);

	const sellers = await db
		.select()
		.from(orderSeller)
		.where(inArray(orderSeller.orderId, orderIds));

	let listings = [];
	if (sellers.length > 0) {
		const orderSellerIds = sellers.map((seller) => seller.orderSellerId);
		listings = await db
			.select()
			.from(orderListing)
			.where(inArray(orderListing.orderSellerId, orderSellerIds));
	}

	const sellersWithItems = sellers.map((seller) => {
		const items = listings.filter(
			(item) => item.orderSellerId === seller.orderSellerId,
		);
		return {
			...seller,
			items,
			orderListings: items,
		};
	});

	return userOrders.map((order) => {
		const matchedSellers = sellersWithItems.filter(
			(seller) => seller.orderId === order.orderId,
		);
		return {
			...order,
			sellers: matchedSellers,
			orderSellers: matchedSellers,
		};
	});
};

exports.getOrderById = async (orderId, userId) => {
	const numericOrderId = Number(orderId);
	const [order] = await db
		.select()
		.from(orders)
		.where(and(eq(orders.orderId, numericOrderId), eq(orders.userId, userId)));

	if (!order) {
		const error = new Error("Order not found");
		error.statusCode = 404;
		throw error;
	}

	const [address] = await db
		.select()
		.from(orderAddress)
		.where(eq(orderAddress.orderId, numericOrderId));

	const sellers = await db
		.select()
		.from(orderSeller)
		.where(eq(orderSeller.orderId, numericOrderId));

	let listings = [];
	if (sellers.length > 0) {
		const orderSellerIds = sellers.map((seller) => seller.orderSellerId);
		listings = await db
			.select()
			.from(orderListing)
			.where(inArray(orderListing.orderSellerId, orderSellerIds));
	}

	const sellersWithItems = sellers.map((seller) => {
		const items = listings.filter(
			(item) => item.orderSellerId === seller.orderSellerId,
		);
		return {
			...seller,
			items,
			orderListings: items,
		};
	});

	return {
		...order,
		address: address || null,
		orderAddress: address || null,
		sellers: sellersWithItems,
		orderSellers: sellersWithItems,
	};
};

exports.cancelOrder = async (orderId, userId) => {
	const numericOrderId = Number(orderId);

	return await db.transaction(async (tx) => {
		const [order] = await tx
			.select()
			.from(orders)
			.where(
				and(eq(orders.orderId, numericOrderId), eq(orders.userId, userId)),
			)
			.for("update");

		if (!order) {
			const error = new Error("Order not found");
			error.statusCode = 404;
			throw error;
		}

		if (order.status !== "pending") {
			const error = new Error("Only pending orders can be cancelled");
			error.statusCode = 400;
			throw error;
		}

		const [updatedOrder] = await tx
			.update(orders)
			.set({
				status: "cancelled",
				updatedAt: new Date(),
			})
			.where(eq(orders.orderId, numericOrderId))
			.returning();

		await tx
			.update(orderSeller)
			.set({
				fulfillmentStatus: "cancelled",
			})
			.where(eq(orderSeller.orderId, numericOrderId));

		const sellers = await tx
			.select({ orderSellerId: orderSeller.orderSellerId })
			.from(orderSeller)
			.where(eq(orderSeller.orderId, numericOrderId));

		if (sellers.length > 0) {
			const orderSellerIds = sellers.map((s) => s.orderSellerId);
			const items = await tx
				.select({
					listingId: orderListing.listingId,
					quantity: orderListing.quantity,
				})
				.from(orderListing)
				.where(inArray(orderListing.orderSellerId, orderSellerIds));

			for (const item of items) {
				await tx
					.update(sellerListings)
					.set({
						inventory: sql`${sellerListings.inventory} + ${item.quantity}`,
						updatedAt: new Date(),
					})
					.where(eq(sellerListings.listingId, item.listingId));
			}
		}

		return updatedOrder;
	});
};

exports.getSellerOrders = async (sellerId) => {
	const sellerOrders = await db
		.select({
			orderSeller: orderSeller,
			order: orders,
		})
		.from(orderSeller)
		.innerJoin(orders, eq(orderSeller.orderId, orders.orderId))
		.where(eq(orderSeller.sellerId, sellerId))
		.orderBy(desc(orders.createdAt));

	if (sellerOrders.length === 0) {
		return [];
	}

	const orderSellerIds = sellerOrders.map(
		(row) => row.orderSeller.orderSellerId,
	);

	const listings = await db
		.select()
		.from(orderListing)
		.where(inArray(orderListing.orderSellerId, orderSellerIds));

	return sellerOrders.map(({ orderSeller: sellerRow, order: orderRow }) => {
		const items = listings.filter(
			(item) => item.orderSellerId === sellerRow.orderSellerId,
		);
		return {
			...sellerRow,
			order: orderRow,
			items,
			orderListings: items,
		};
	});
};

exports.getSellerOrderById = async (orderSellerId, sellerId) => {
	const numericOrderSellerId = Number(orderSellerId);

	const [row] = await db
		.select({
			orderSeller: orderSeller,
			order: orders,
		})
		.from(orderSeller)
		.innerJoin(orders, eq(orderSeller.orderId, orders.orderId))
		.where(
			and(
				eq(orderSeller.orderSellerId, numericOrderSellerId),
				eq(orderSeller.sellerId, sellerId),
			),
		);

	if (!row) {
		const error = new Error("Seller order not found");
		error.statusCode = 404;
		throw error;
	}

	const listings = await db
		.select()
		.from(orderListing)
		.where(eq(orderListing.orderSellerId, numericOrderSellerId));

	return {
		...row.orderSeller,
		order: row.order,
		items: listings,
		orderListings: listings,
	};
};

exports.updateSellerOrderStatus = async (
	orderSellerId,
	sellerId,
	statusOrData,
	possibleTrackingNumber,
) => {
	const numericOrderSellerId = Number(orderSellerId);
	let fulfillmentStatus;
	let trackingNumber;

	if (typeof statusOrData === "object" && statusOrData !== null) {
		fulfillmentStatus = statusOrData.fulfillmentStatus;
		trackingNumber = statusOrData.trackingNumber;
	} else {
		fulfillmentStatus = statusOrData;
		trackingNumber = possibleTrackingNumber;
	}

	const [sellerOrder] = await db
		.select()
		.from(orderSeller)
		.where(
			and(
				eq(orderSeller.orderSellerId, numericOrderSellerId),
				eq(orderSeller.sellerId, sellerId),
			),
		);

	if (!sellerOrder) {
		const error = new Error("Seller order not found");
		error.statusCode = 404;
		throw error;
	}

	const VALID_TRANSITIONS = {
		pending: "processing",
		processing: "shipped",
		shipped: "delivered",
	};

	if (VALID_TRANSITIONS[sellerOrder.fulfillmentStatus] !== fulfillmentStatus) {
		const error = new Error(
			`Invalid status transition from '${sellerOrder.fulfillmentStatus}' to '${fulfillmentStatus}'`,
		);
		error.statusCode = 400;
		throw error;
	}

	const updatePayload = {
		fulfillmentStatus,
	};

	if (fulfillmentStatus === "shipped") {
		updatePayload.shippedAt = new Date();
		if (trackingNumber !== undefined && trackingNumber !== null) {
			updatePayload.trackingNumber = trackingNumber;
		}
	} else if (fulfillmentStatus === "delivered") {
		updatePayload.deliveredAt = new Date();
	}

	const [updatedSellerOrder] = await db
		.update(orderSeller)
		.set(updatePayload)
		.where(
			and(
				eq(orderSeller.orderSellerId, numericOrderSellerId),
				eq(orderSeller.sellerId, sellerId),
			),
		)
		.returning();

	return updatedSellerOrder;
};
