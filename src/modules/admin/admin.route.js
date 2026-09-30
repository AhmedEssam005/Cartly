const express = require("express");
const adminController = require("./admin.controller");
const adminValidator = require("./admin.validator");
const catalogValidator = require("../catalog/catalog.validator");
const isAuth = require("../../middlewares/isAuth");
const isAdmin = require("../../middlewares/isAdmin");
const commonValidator = require("../../middlewares/commonValidator");
const upload = require("../../configs/multer");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(isAuth, isAdmin);

// --- Seller / KYC Management ---
router.get(
	"/sellers",
	adminValidator.listSellersValidator,
	commonValidator,
	adminController.getSellers,
);

router.get(
	"/sellers/:sellerId",
	adminValidator.sellerIdParamValidator,
	commonValidator,
	adminController.getSellerById,
);

router.patch(
	"/sellers/:sellerId/kyc/approve",
	adminValidator.sellerIdParamValidator,
	commonValidator,
	adminController.approveSellerKyc,
);

router.patch(
	"/sellers/:sellerId/kyc/reject",
	adminValidator.sellerIdParamValidator,
	commonValidator,
	adminController.rejectSellerKyc,
);

// --- Catalog Submissions Moderation ---
router.get(
	"/catalog-submissions",
	adminValidator.listSubmissionsValidator,
	commonValidator,
	adminController.getCatalogSubmissions,
);

router.get(
	"/catalog-submissions/:submissionId",
	adminValidator.submissionIdParamValidator,
	commonValidator,
	adminController.getCatalogSubmissionById,
);

router.patch(
	"/catalog-submissions/:submissionId/approve",
	adminValidator.reviewSubmissionValidator,
	commonValidator,
	adminController.approveCatalogSubmission,
);

router.patch(
	"/catalog-submissions/:submissionId/reject",
	adminValidator.reviewSubmissionValidator,
	commonValidator,
	adminController.rejectCatalogSubmission,
);

// --- Catalog Products Management ---
router.post(
	"/catalog-products",
	upload.array("images", 10),
	catalogValidator.createCatalogProductValidator,
	commonValidator,
	adminController.createCatalogProduct,
);

router.patch(
	"/catalog-products/:productId",
	upload.array("images", 10),
	catalogValidator.updateCatalogProductValidator,
	commonValidator,
	adminController.updateCatalogProduct,
);

router.patch(
	"/catalog-products/:productId/hide",
	adminValidator.productIdParamValidator,
	commonValidator,
	adminController.hideCatalogProduct,
);

router.patch(
	"/catalog-products/:productId/show",
	adminValidator.productIdParamValidator,
	commonValidator,
	adminController.showCatalogProduct,
);

// --- Categories Management ---
router.post(
	"/categories",
	adminValidator.createCategoryValidator,
	commonValidator,
	adminController.createCategory,
);

router.patch(
	"/categories/:categoryId",
	adminValidator.updateCategoryValidator,
	commonValidator,
	adminController.updateCategory,
);

router.delete(
	"/categories/:categoryId",
	adminValidator.categoryIdParamValidator,
	commonValidator,
	adminController.deleteCategory,
);

module.exports = router;
