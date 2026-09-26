const catalogValidator = require("./catalog.validator");
const catalogController = require("./catalog.controller");
const isAuth = require("../../middlewares/isAuth");
const isAdmin = require("../../middlewares/isAdmin");
const commonValidator = require("../../middlewares/commonValidator");
const router = require("express").Router();

router.get(
	"/metadata/brands",
	isAuth,
	catalogValidator.getAllBrandsValidator,
	commonValidator,
	catalogController.getAllBrands,
);

router.get("/metadata/categories", isAuth, catalogController.getAllCategories);

router.get(
	"/:productId",
	isAuth,
	catalogValidator.getCatalogProductByIdValidator,
	commonValidator,
	catalogController.getCatalogProductById,
);

router.get(
	"/gtin/:gtin",
	isAuth,
	catalogValidator.getCatalogProductByGtinValidator,
	commonValidator,
	catalogController.getCatalogProductByGtin,
);

router.get(
	"/",
	isAuth,
	catalogValidator.getCatalogProductsValidator,
	commonValidator,
	catalogController.getCatalogProducts,
);

router.post(
	"/",
	isAuth,
	isAdmin,
	catalogValidator.createCatalogProductValidator,
	commonValidator,
	catalogController.createCatalogProduct,
);

router.put(
	"/:productId",
	isAuth,
	isAdmin,
	catalogValidator.updateCatalogProductValidator,
	commonValidator,
	catalogController.updateCatalogProduct,
);

router.delete(
	"/:productId",
	isAuth,
	isAdmin,
	catalogValidator.softDeleteCatalogProductValidator,
	commonValidator,
	catalogController.softDeleteCatalogProduct,
);
