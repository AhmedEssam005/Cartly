const router = require("express").Router();
const catalogSubmissionController = require("./catalogSubmission.controller");
const catalogSubmissionValidator = require("./catalogSubmission.validator");
const commonValidator = require("../../middlewares/commonValidator");
const isAuth = require("../../middlewares/isAuth");
const isAdmin = require("../../middlewares/isAdmin");
const isSeller = require("../../middlewares/isSeller");

router.get(
	"/seller",
	isAuth,
	isSeller,
	catalogSubmissionController.getSellerCatalogSubmissions,
);

router.get(
	"/pending",
	isAuth,
	isAdmin,
	catalogSubmissionController.getPendingCatalogSubmissions,
);
router.get(
	"/:submissionId",
	isAuth,
    isAdmin,
	catalogSubmissionValidator.getCatalogSubmissionByIdValidator,
	commonValidator,
	catalogSubmissionController.getCatalogSubmissionById,
);

router.patch(
	"/:submissionId/reject",
	isAuth,
	isAdmin,
	catalogSubmissionValidator.rejectCatalogSubmissionValidator,
	commonValidator,
	catalogSubmissionController.rejectCatalogSubmission,
);

router.post(
	"/",
	isAuth,
    isSeller,
	catalogSubmissionValidator.createCatalogSubmissionValidator,
	commonValidator,
	catalogSubmissionController.createCatalogSubmission,
);

router.patch(
	"/:submissionId/approve",
	isAuth,
	isAdmin,
	catalogSubmissionValidator.approveCatalogSubmissionValidator,
	commonValidator,
	catalogSubmissionController.approveCatalogSubmission,
);
