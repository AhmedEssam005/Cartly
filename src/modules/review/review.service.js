const db = require("../../db/index");
const {
	reviews,
	reviewImages,
	reviewLikes,
	orders,
	orderSeller,
	orderListing,
	sellerListings,
	profile,
} = require("../../db/schema/schema");
const { eq, and, desc, asc, count, sql, inArray } = require("drizzle-orm");

// Verify that the user has bought this listing in a confirmed/completed order
async function verifyPurchase(userId, listingId) {
	const [purchase] = await db
		.select({ orderListingId: orderListing.orderListingId })
		.from(orderListing)
		.innerJoin(
			orderSeller,
			eq(orderListing.orderSellerId, orderSeller.orderSellerId),
		)
		.innerJoin(orders, eq(orderSeller.orderId, orders.orderId))
		.where(
			and(
				eq(orders.userId, userId),
				eq(orderListing.listingId, listingId),
				inArray(orders.status, ["confirmed", "processing", "completed"]),
			),
		)
		.limit(1);

	return !!purchase;
}

exports.createReview = async (userId, listingId, reviewData) => {
	const { rating, comment, images = [] } = reviewData;

	// 1. Verify listing exists
	const [listing] = await db
		.select({ listingId: sellerListings.listingId })
		.from(sellerListings)
		.where(eq(sellerListings.listingId, listingId));

	if (!listing) {
		const error = new Error("Listing not found");
		error.statusCode = 404;
		throw error;
	}

	// 2. Check purchase eligibility
	const hasPurchased = await verifyPurchase(userId, listingId);
	if (!hasPurchased) {
		const error = new Error(
			"Purchase required: You can only review listings you have purchased in a confirmed order",
		);
		error.statusCode = 403;
		throw error;
	}

	// 3. Check if review already exists
	const [existing] = await db
		.select({ reviewId: reviews.reviewId })
		.from(reviews)
		.where(and(eq(reviews.userId, userId), eq(reviews.listingId, listingId)));

	if (existing) {
		const error = new Error(
			"You have already reviewed this listing. You can update your existing review.",
		);
		error.statusCode = 409;
		throw error;
	}

	// 4. Create review & insert images in transaction
	return await db.transaction(async (tx) => {
		const [newReview] = await tx
			.insert(reviews)
			.values({
				userId,
				listingId,
				rating: Number(rating),
				comment,
			})
			.returning();

		let insertedImages = [];
		if (images && images.length > 0) {
			insertedImages = await tx
				.insert(reviewImages)
				.values(
					images.map((img) => ({
						reviewId: newReview.reviewId,
						imageUrl: img,
					})),
				)
				.returning();
		}

		return {
			...newReview,
			images: insertedImages,
		};
	});
};

exports.getListingReviews = async (
	listingId,
	{ page = 1, limit = 20, rating, currentUserId },
) => {
	const pageNum = Math.max(1, Number(page));
	const limitNum = Math.max(1, Math.min(100, Number(limit)));
	const offset = (pageNum - 1) * limitNum;

	const conditions = [eq(reviews.listingId, listingId)];
	if (rating) {
		conditions.push(eq(reviews.rating, Number(rating)));
	}

	const whereClause = and(...conditions);

	const reviewsList = await db
		.select({
			reviewId: reviews.reviewId,
			rating: reviews.rating,
			comment: reviews.comment,
			createdAt: reviews.createdAt,
			updatedAt: reviews.updatedAt,
			user: {
				userId: profile.profileId,
				firstName: profile.firstName,
				lastName: profile.lastName,
			},
		})
		.from(reviews)
		.innerJoin(profile, eq(reviews.userId, profile.profileId))
		.where(whereClause)
		.limit(limitNum)
		.offset(offset)
		.orderBy(desc(reviews.createdAt));

	const reviewIds = reviewsList.map((r) => r.reviewId);

	let imagesByReview = {};
	let likesByReview = {};
	let userLikedReviews = new Set();

	if (reviewIds.length > 0) {
		const images = await db
			.select()
			.from(reviewImages)
			.where(inArray(reviewImages.reviewId, reviewIds));

		for (const img of images) {
			if (!imagesByReview[img.reviewId]) {
				imagesByReview[img.reviewId] = [];
			}
			imagesByReview[img.reviewId].push(img);
		}

		const likes = await db
			.select({
				reviewId: reviewLikes.reviewId,
				likeCount: count(reviewLikes.reviewLikeId),
			})
			.from(reviewLikes)
			.where(inArray(reviewLikes.reviewId, reviewIds))
			.groupBy(reviewLikes.reviewId);

		for (const l of likes) {
			likesByReview[l.reviewId] = Number(l.likeCount);
		}

		if (currentUserId) {
			const userLikes = await db
				.select({ reviewId: reviewLikes.reviewId })
				.from(reviewLikes)
				.where(
					and(
						inArray(reviewLikes.reviewId, reviewIds),
						eq(reviewLikes.userId, currentUserId),
					),
				);
			for (const ul of userLikes) {
				userLikedReviews.add(ul.reviewId);
			}
		}
	}

	// Overall rating stats for listing
	const [stats] = await db
		.select({
			totalReviews: count(reviews.reviewId),
			averageRating: sql`COALESCE(ROUND(AVG(${reviews.rating})::numeric, 1), 0)`.mapWith(
				Number,
			),
		})
		.from(reviews)
		.where(eq(reviews.listingId, listingId));

	const enrichedReviews = reviewsList.map((r) => ({
		...r,
		images: imagesByReview[r.reviewId] || [],
		likesCount: likesByReview[r.reviewId] || 0,
		isLiked: userLikedReviews.has(r.reviewId),
	}));

	return {
		summary: {
			totalReviews: Number(stats?.totalReviews || 0),
			averageRating: stats?.averageRating || 0,
		},
		reviews: enrichedReviews,
		pagination: {
			total: Number(stats?.totalReviews || 0),
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(Number(stats?.totalReviews || 0) / limitNum),
		},
	};
};

exports.getReviewById = async (reviewId, currentUserId) => {
	const [review] = await db
		.select({
			reviewId: reviews.reviewId,
			listingId: reviews.listingId,
			rating: reviews.rating,
			comment: reviews.comment,
			createdAt: reviews.createdAt,
			updatedAt: reviews.updatedAt,
			user: {
				userId: profile.profileId,
				firstName: profile.firstName,
				lastName: profile.lastName,
			},
		})
		.from(reviews)
		.innerJoin(profile, eq(reviews.userId, profile.profileId))
		.where(eq(reviews.reviewId, reviewId));

	if (!review) {
		const error = new Error("Review not found");
		error.statusCode = 404;
		throw error;
	}

	const images = await db
		.select()
		.from(reviewImages)
		.where(eq(reviewImages.reviewId, reviewId));

	const [{ likeCount }] = await db
		.select({ likeCount: count(reviewLikes.reviewLikeId) })
		.from(reviewLikes)
		.where(eq(reviewLikes.reviewId, reviewId));

	let isLiked = false;
	if (currentUserId) {
		const [userLike] = await db
			.select({ reviewLikeId: reviewLikes.reviewLikeId })
			.from(reviewLikes)
			.where(
				and(
					eq(reviewLikes.reviewId, reviewId),
					eq(reviewLikes.userId, currentUserId),
				),
			);
		isLiked = !!userLike;
	}

	return {
		...review,
		images,
		likesCount: Number(likeCount),
		isLiked,
	};
};

exports.updateReview = async (reviewId, userId, { rating, comment }) => {
	const [review] = await db
		.select()
		.from(reviews)
		.where(eq(reviews.reviewId, reviewId));

	if (!review) {
		const error = new Error("Review not found");
		error.statusCode = 404;
		throw error;
	}

	if (review.userId !== userId) {
		const error = new Error("Forbidden: You can only edit your own review");
		error.statusCode = 403;
		throw error;
	}

	const updateFields = { updatedAt: new Date() };
	if (rating !== undefined) updateFields.rating = Number(rating);
	if (comment !== undefined) updateFields.comment = comment;

	const [updatedReview] = await db
		.update(reviews)
		.set(updateFields)
		.where(eq(reviews.reviewId, reviewId))
		.returning();

	return updatedReview;
};

exports.deleteReview = async (reviewId, user) => {
	const [review] = await db
		.select()
		.from(reviews)
		.where(eq(reviews.reviewId, reviewId));

	if (!review) {
		const error = new Error("Review not found");
		error.statusCode = 404;
		throw error;
	}

	if (review.userId !== user.id) {
		const [userProfile] = await db
			.select({ role: profile.role })
			.from(profile)
			.where(eq(profile.profileId, user.id));

		if (!userProfile || userProfile.role !== "admin") {
			const error = new Error("Forbidden: You can only delete your own review");
			error.statusCode = 403;
			throw error;
		}
	}

	return await db.transaction(async (tx) => {
		await tx.delete(reviewImages).where(eq(reviewImages.reviewId, reviewId));
		await tx.delete(reviewLikes).where(eq(reviewLikes.reviewId, reviewId));
		const [deleted] = await tx
			.delete(reviews)
			.where(eq(reviews.reviewId, reviewId))
			.returning();
		return deleted;
	});
};

exports.likeReview = async (reviewId, userId) => {
	const [review] = await db
		.select({ reviewId: reviews.reviewId })
		.from(reviews)
		.where(eq(reviews.reviewId, reviewId));

	if (!review) {
		const error = new Error("Review not found");
		error.statusCode = 404;
		throw error;
	}

	try {
		await db.insert(reviewLikes).values({
			reviewId,
			userId,
		});
	} catch (err) {
		// If already liked (23505 duplicate key), silently ignore (idempotent)
		if (err.cause?.code === "23505" || err.code === "23505") {
			return { message: "Review already liked", liked: true };
		}
		throw err;
	}

	return { message: "Review liked successfully", liked: true };
};

exports.unlikeReview = async (reviewId, userId) => {
	const [review] = await db
		.select({ reviewId: reviews.reviewId })
		.from(reviews)
		.where(eq(reviews.reviewId, reviewId));

	if (!review) {
		const error = new Error("Review not found");
		error.statusCode = 404;
		throw error;
	}

	await db
		.delete(reviewLikes)
		.where(
			and(
				eq(reviewLikes.reviewId, reviewId),
				eq(reviewLikes.userId, userId),
			),
		);

	return { message: "Review unliked successfully", liked: false };
};
