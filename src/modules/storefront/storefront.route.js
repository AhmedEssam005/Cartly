const express = require("express");
const storefrontController = require("./storefront.controller");
const storefrontValidator = require("./storefront.validator");
const commonValidator = require("../../middlewares/commonValidator");
const opIsAuth = require("../../middlewares/opIsAuth");

const router = express.Router();

// Storefront routes are public (with optional authentication)
router.use(opIsAuth);

// Products
router.get(
	"/products",
	storefrontValidator.browseProductsValidator,
	commonValidator,
	storefrontController.getProducts,
);

router.get(
	"/products/:productId",
	storefrontValidator.productIdParamValidator,
	commonValidator,
	storefrontController.getProductById,
);

router.get(
	"/products/:productId/listings",
	storefrontValidator.productIdParamValidator,
	commonValidator,
	storefrontController.getProductListings,
);

// Listings
router.get(
	"/listings/:listingId",
	storefrontValidator.listingIdParamValidator,
	commonValidator,
	storefrontController.getListingById,
);

// Categories
router.get("/categories", storefrontController.getCategories);

router.get(
	"/categories/:categoryId",
	storefrontValidator.categoryIdParamValidator,
	commonValidator,
	storefrontController.getCategoryById,
);

module.exports = router;
