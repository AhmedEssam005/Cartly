const express = require("express");
const reviewController = require("./review.controller");
const reviewValidator = require("./review.validator");
const isAuth = require("../../middlewares/isAuth");
const opIsAuth = require("../../middlewares/opIsAuth");
const commonValidator = require("../../middlewares/commonValidator");
const upload = require("../../configs/multer");

const listingReviewsRouter = express.Router({ mergeParams: true });
const reviewsRouter = express.Router();

// Routes mounted at /api/listings/:listingId/reviews
listingReviewsRouter.post(
	"/:listingId/reviews",
	isAuth,
	upload.array("images", 5),
	reviewValidator.createReviewValidator,
	commonValidator,
	reviewController.createReview,
);

listingReviewsRouter.get(
	"/:listingId/reviews",
	opIsAuth,
	reviewValidator.listingIdParamValidator,
	reviewValidator.listReviewsValidator,
	commonValidator,
	reviewController.getListingReviews,
);

// Routes mounted at /api/reviews
reviewsRouter.get(
	"/:reviewId",
	opIsAuth,
	reviewValidator.reviewIdParamValidator,
	commonValidator,
	reviewController.getReviewById,
);

reviewsRouter.patch(
	"/:reviewId",
	isAuth,
	reviewValidator.updateReviewValidator,
	commonValidator,
	reviewController.updateReview,
);

reviewsRouter.delete(
	"/:reviewId",
	isAuth,
	reviewValidator.reviewIdParamValidator,
	commonValidator,
	reviewController.deleteReview,
);

reviewsRouter.post(
	"/:reviewId/like",
	isAuth,
	reviewValidator.reviewIdParamValidator,
	commonValidator,
	reviewController.likeReview,
);

reviewsRouter.delete(
	"/:reviewId/like",
	isAuth,
	reviewValidator.reviewIdParamValidator,
	commonValidator,
	reviewController.unlikeReview,
);

module.exports = {
	listingReviewsRouter,
	reviewsRouter,
};
