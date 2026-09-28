const router = require("express").Router();
const sellerListingController = require("./sellerListing.controller");
const sellerListingValidator = require("./sellerListing.validator");
const commonValidator = require("../../middlewares/commonValidator");
const isAuth = require("../../middlewares/isAuth");
const isSeller = require("../../middlewares/isSeller");

router.post(
	"/",
	isAuth,
	isSeller,
	sellerListingValidator.addSellerListingValidator,
	commonValidator,
	sellerListingController.addSellerListing,
);

router.put(
	"/:listingId",
	isAuth,
	isSeller,
	sellerListingValidator.updateSellerListingValidator,
	commonValidator,
	sellerListingController.updateSellerListing,
);

router.get(
	"/:listingId",
	isAuth,
	isSeller,
	sellerListingValidator.getListingByIdValidator,
	commonValidator,
	sellerListingController.getListingById,
);
router.get(
	"/",
	isAuth,
	isSeller,
	sellerListingController.getSellerListingsBySellerId,
);

router.patch(
	"/:listingId/deactivate",
	isAuth,
	isSeller,
	sellerListingValidator.deactivateSellerListingValidator,
	commonValidator,
	sellerListingController.deactivateSellerListing,
);

router.patch(
	"/:listingId/activate",
	isAuth,
	isSeller,
	sellerListingValidator.activateSellerListingValidator,
	commonValidator,
	sellerListingController.activateSellerListing,
);

module.exports = router;
