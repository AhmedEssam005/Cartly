const reviewService = require("./review.service");
const uploadImages = require("../../utils/uploadImages");
const logger = require("../../configs/logger");

exports.createReview = async (req, res, next) => {
	try {
		const listingId = Number(req.params.listingId);
		let images = [];
		if (req.files && req.files.length > 0) {
			const uploadedImages = await uploadImages(req.files, "Cartly", "reviews");
			images = uploadedImages.map((img) => img.publicUrl);
		}
		const review = await reviewService.createReview(req.user.id, listingId, {
			rating: req.body.rating,
			comment: req.body.comment,
			images,
		});
		logger.info(
			`User ${req.user.id} created review for listing ${listingId}`,
		);
		res.status(201).json(review);
	} catch (error) {
		next(error);
	}
};

exports.getListingReviews = async (req, res, next) => {
	try {
		const listingId = Number(req.params.listingId);
		const { page, limit, rating } = req.query;
		const currentUserId = req.user ? req.user.id : null;
		const result = await reviewService.getListingReviews(listingId, {
			page,
			limit,
			rating,
			currentUserId,
		});
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.getReviewById = async (req, res, next) => {
	try {
		const reviewId = Number(req.params.reviewId);
		const currentUserId = req.user ? req.user.id : null;
		const review = await reviewService.getReviewById(reviewId, currentUserId);
		res.status(200).json(review);
	} catch (error) {
		next(error);
	}
};

exports.updateReview = async (req, res, next) => {
	try {
		const reviewId = Number(req.params.reviewId);
		const review = await reviewService.updateReview(
			reviewId,
			req.user.id,
			req.body,
		);
		logger.info(`User ${req.user.id} updated review ${reviewId}`);
		res.status(200).json(review);
	} catch (error) {
		next(error);
	}
};

exports.deleteReview = async (req, res, next) => {
	try {
		const reviewId = Number(req.params.reviewId);
		await reviewService.deleteReview(reviewId, req.user);
		logger.info(`Review ${reviewId} deleted by user ${req.user.id}`);
		res.status(200).json({ message: "Review deleted successfully" });
	} catch (error) {
		next(error);
	}
};

exports.likeReview = async (req, res, next) => {
	try {
		const reviewId = Number(req.params.reviewId);
		const result = await reviewService.likeReview(reviewId, req.user.id);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.unlikeReview = async (req, res, next) => {
	try {
		const reviewId = Number(req.params.reviewId);
		const result = await reviewService.unlikeReview(reviewId, req.user.id);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};
