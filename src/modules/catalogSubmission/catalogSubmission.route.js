const router = require("express").Router();
const catalogSubmissionController = require("./catalogSubmission.controller");
const catalogSubmissionValidator = require("./catalogSubmission.validator");
const commonValidator = require("../../middlewares/commonValidator");
const isAuth = require("../../middlewares/isAuth");
const isAdmin = require("../../middlewares/isAdmin");

router.get(
	"/:submissionId",
	isAuth,
	catalogSubmissionValidator.getCatalogSubmissionByIdValidator,
	commonValidator,
	catalogSubmissionController.getCatalogSubmissionById,
);

router.get(
	"/seller",
	isAuth,
	catalogSubmissionController.getSellerCatalogSubmissions,
);

router.get(
	"/pending",
	isAuth,
	isAdmin,
	catalogSubmissionController.getPendingCatalogSubmissions,
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
