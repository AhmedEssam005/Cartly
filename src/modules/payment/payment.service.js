const db = require("../../db/index");
const {
	payments,
	orders,
	orderSeller,
	orderListing,
	sellerListings,
} = require("../../db/schema/schema");
const { eq, and, desc, count, sql, inArray } = require("drizzle-orm");

exports.createPaymentForOrder = async (orderId, userId) => {
	const [order] = await db
		.select()
		.from(orders)
		.where(and(eq(orders.orderId, orderId), eq(orders.userId, userId)));

	if (!order) {
		const error = new Error("Order not found");
		error.statusCode = 404;
		throw error;
	}

	if (order.status !== "pending") {
		const error = new Error(
			`Cannot initiate payment for order with status '${order.status}'. Only pending orders can be paid.`,
		);
		error.statusCode = 400;
		throw error;
	}

	const [existingPayment] = await db
		.select()
		.from(payments)
		.where(eq(payments.orderId, orderId));

	if (existingPayment) {
		if (existingPayment.status === "paid") {
			const error = new Error("Order is already paid");
			error.statusCode = 400;
			throw error;
		}
		if (existingPayment.status === "pending") {
			return existingPayment;
		}
	}

	const sellers = await db
		.select({
			subTotal: orderSeller.subTotal,
			platformFee: orderSeller.platformFee,
		})
		.from(orderSeller)
		.where(eq(orderSeller.orderId, orderId));

	if (sellers.length === 0) {
		const error = new Error("No seller orders found for this order");
		error.statusCode = 400;
		throw error;
	}

	const totalAmount = sellers.reduce(
		(sum, s) => sum + (Number(s.subTotal) + Number(s.platformFee)),
		0,
	);

	const providerReference = `MANUAL-${orderId}-${Date.now()}`;

	const [newPayment] = await db
		.insert(payments)
		.values({
			orderId,
			provider: "manual",
			providerReference,
			amount: totalAmount,
			currency: "EGP",
			status: "pending",
		})
		.returning();

	return newPayment;
};

exports.getPaymentByOrderId = async (orderId, userId) => {
	const [order] = await db
		.select()
		.from(orders)
		.where(and(eq(orders.orderId, orderId), eq(orders.userId, userId)));

	if (!order) {
		const error = new Error("Order not found");
		error.statusCode = 404;
		throw error;
	}

	const [payment] = await db
		.select()
		.from(payments)
		.where(eq(payments.orderId, orderId));

	if (!payment) {
		const error = new Error("Payment not found for this order");
		error.statusCode = 404;
		throw error;
	}

	return payment;
};

exports.getAdminPayments = async ({ status, page = 1, limit = 20 }) => {
	const pageNum = Math.max(1, Number(page));
	const limitNum = Math.max(1, Math.min(100, Number(limit)));
	const offset = (pageNum - 1) * limitNum;

	let whereClause = undefined;
	if (status) {
		whereClause = eq(payments.status, status);
	}

	const paymentsList = await db
		.select()
		.from(payments)
		.where(whereClause)
		.limit(limitNum)
		.offset(offset)
		.orderBy(desc(payments.createdAt));

	const [{ totalCount }] = await db
		.select({ totalCount: count() })
		.from(payments)
		.where(whereClause);

	return {
		payments: paymentsList,
		pagination: {
			total: Number(totalCount),
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(Number(totalCount) / limitNum),
		},
	};
};

exports.getAdminPaymentById = async (paymentId) => {
	const [payment] = await db
		.select()
		.from(payments)
		.where(eq(payments.paymentId, paymentId));

	if (!payment) {
		const error = new Error("Payment not found");
		error.statusCode = 404;
		throw error;
	}

	const [order] = await db
		.select()
		.from(orders)
		.where(eq(orders.orderId, payment.orderId));

	const sellers = await db
		.select()
		.from(orderSeller)
		.where(eq(orderSeller.orderId, payment.orderId));

	return {
		...payment,
		order: {
			...order,
			sellers,
		},
	};
};

exports.approvePayment = async (paymentId) => {
	return await db.transaction(async (tx) => {
		const [payment] = await tx
			.select()
			.from(payments)
			.where(eq(payments.paymentId, paymentId))
			.for("update");

		if (!payment) {
			const error = new Error("Payment not found");
			error.statusCode = 404;
			throw error;
		}

		if (payment.status !== "pending") {
			const error = new Error(
				`Cannot approve payment with status '${payment.status}'. Only pending payments can be approved.`,
			);
			error.statusCode = 400;
			throw error;
		}

		const [order] = await tx
			.select()
			.from(orders)
			.where(eq(orders.orderId, payment.orderId))
			.for("update");

		if (!order) {
			const error = new Error("Associated order not found");
			error.statusCode = 404;
			throw error;
		}

		if (order.status !== "pending") {
			const error = new Error(
				`Cannot confirm order with status '${order.status}'. Only pending orders can be confirmed.`,
			);
			error.statusCode = 400;
			throw error;
		}

		const [updatedPayment] = await tx
			.update(payments)
			.set({
				status: "paid",
			})
			.where(eq(payments.paymentId, paymentId))
			.returning();

		const [updatedOrder] = await tx
			.update(orders)
			.set({
				status: "confirmed",
				updatedAt: new Date(),
			})
			.where(eq(orders.orderId, order.orderId))
			.returning();

		return {
			message: "Payment approved and order confirmed successfully",
			payment: updatedPayment,
			order: updatedOrder,
		};
	});
};

exports.rejectPayment = async (paymentId) => {
	return await db.transaction(async (tx) => {
		const [payment] = await tx
			.select()
			.from(payments)
			.where(eq(payments.paymentId, paymentId))
			.for("update");

		if (!payment) {
			const error = new Error("Payment not found");
			error.statusCode = 404;
			throw error;
		}

		if (payment.status !== "pending") {
			const error = new Error(
				`Cannot reject payment with status '${payment.status}'. Only pending payments can be rejected.`,
			);
			error.statusCode = 400;
			throw error;
		}

		const [order] = await tx
			.select()
			.from(orders)
			.where(eq(orders.orderId, payment.orderId))
			.for("update");

		if (!order) {
			const error = new Error("Associated order not found");
			error.statusCode = 404;
			throw error;
		}

		const [updatedPayment] = await tx
			.update(payments)
			.set({
				status: "failed",
			})
			.where(eq(payments.paymentId, paymentId))
			.returning();

		const wasAlreadyCancelled = order.status === "cancelled";

		const [updatedOrder] = await tx
			.update(orders)
			.set({
				status: "cancelled",
				updatedAt: new Date(),
			})
			.where(eq(orders.orderId, order.orderId))
			.returning();

		await tx
			.update(orderSeller)
			.set({
				fulfillmentStatus: "cancelled",
			})
			.where(eq(orderSeller.orderId, order.orderId));

		if (!wasAlreadyCancelled) {
			const sellerOrderRows = await tx
				.select({ orderSellerId: orderSeller.orderSellerId })
				.from(orderSeller)
				.where(eq(orderSeller.orderId, order.orderId));

			const orderSellerIds = sellerOrderRows.map((r) => r.orderSellerId);

			if (orderSellerIds.length > 0) {
				const listings = await tx
					.select()
					.from(orderListing)
					.where(inArray(orderListing.orderSellerId, orderSellerIds));

				for (const item of listings) {
					await tx
						.update(sellerListings)
						.set({
							inventory: sql`${sellerListings.inventory} + ${item.quantity}`,
							updatedAt: new Date(),
						})
						.where(eq(sellerListings.listingId, item.listingId));
				}
			}
		}

		return {
			message: "Payment rejected, order cancelled, and inventory restored",
			payment: updatedPayment,
			order: updatedOrder,
		};
	});
};
