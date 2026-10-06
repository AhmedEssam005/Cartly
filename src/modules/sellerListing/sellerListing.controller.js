const sellerListingService = require("./sellerListing.service");

exports.addSellerListing = async (req, res, next) => {
	try {
		const sellerListingData = req.body;

		const newListing = await sellerListingService.addSellerListing({
			...sellerListingData,
			sellerId: req.user.id,
		});
		res.status(201).json(newListing);
	} catch (err) {
		next(err);
	}
};

exports.updateSellerListing = async (req, res, next) => {
	try {
		const listingId = req.params.listingId;
		const sellerListingData = req.body;
		const updatedListing = await sellerListingService.updateSellerListing({
			...sellerListingData,
			listingId,
			sellerId: req.user.id,
		});
		res.status(200).json(updatedListing);
	} catch (err) {
		next(err);
	}
};

exports.getSellerListingsBySellerId = async (req, res, next) => {
	try {
		const listings = await sellerListingService.getSellerListingsBySellerId(
			req.user.id,
		);
		res.status(200).json(listings);
	} catch (err) {
		next(err);
	}
};

exports.getListingById = async (req, res, next) => {
	try {
		const listingId = req.params.listingId;
		const listing = await sellerListingService.getListingById(
			listingId,
			req.user.id,
		);
		res.status(200).json(listing);
	} catch (err) {
		next(err);
	}
};

exports.deactivateSellerListing = async (req, res, next) => {
	try {
		const listingId = req.params.listingId;
		await sellerListingService.deactivateSellerListing(listingId, req.user.id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

exports.activateSellerListing = async (req, res, next) => {
	try {
		const listingId = req.params.listingId;
		await sellerListingService.activateSellerListing(listingId, req.user.id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};
