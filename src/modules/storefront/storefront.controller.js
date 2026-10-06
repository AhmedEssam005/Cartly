const storefrontService = require("./storefront.service");

exports.getProducts = async (req, res, next) => {
	try {
		const { search, categoryId, brand, sort, page, limit } = req.query;
		const result = await storefrontService.getProducts({
			search,
			categoryId,
			brand,
			sort,
			page,
			limit,
		});
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.getProductById = async (req, res, next) => {
	try {
		const productId = Number(req.params.productId);
		const product = await storefrontService.getProductById(productId);
		res.status(200).json(product);
	} catch (error) {
		next(error);
	}
};

exports.getCategories = async (req, res, next) => {
	try {
		const categories = await storefrontService.getCategories();
		res.status(200).json(categories);
	} catch (error) {
		next(error);
	}
};

exports.getCategoryById = async (req, res, next) => {
	try {
		const categoryId = Number(req.params.categoryId);
		const category = await storefrontService.getCategoryById(categoryId);
		res.status(200).json(category);
	} catch (error) {
		next(error);
	}
};

exports.getProductListings = async (req, res, next) => {
	try {
		const productId = Number(req.params.productId);
		const listings = await storefrontService.getProductListings(productId);
		res.status(200).json(listings);
	} catch (error) {
		next(error);
	}
};

exports.getListingById = async (req, res, next) => {
	try {
		const listingId = Number(req.params.listingId);
		const listing = await storefrontService.getListingById(listingId);
		res.status(200).json(listing);
	} catch (error) {
		next(error);
	}
};
