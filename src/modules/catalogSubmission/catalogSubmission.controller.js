const catalogSubmissionService = require("./catalogSubmission.service");
const logger = require("../../configs/logger");

exports.getCatalogSubmissionById = async (req, res, next) => {
	try {
		const { submissionId } = req.params;
		const submission =
			await catalogSubmissionService.getCatalogSubmissionById(submissionId);
		logger.info(`Retrieved catalog submission with ID: ${submissionId}`);
		res.status(200).json(submission);
	} catch (err) {
		next(err);
	}
};

exports.getSellerCatalogSubmissions = async (req, res, next) => {
	try {
		const submissions =
			await catalogSubmissionService.getSellerCatalogSubmissions(req.user.id);
		logger.info(`Retrieved catalog submissions for seller ID: ${req.user.id}`);
		res.status(200).json(submissions);
	} catch (err) {
		next(err);
	}
};

exports.getPendingCatalogSubmissions = async (req, res, next) => {
	try {
		const submissions =
			await catalogSubmissionService.getPendingCatalogSubmissions();
		logger.info(`Retrieved pending catalog submissions`);
		res.status(200).json(submissions);
	} catch (err) {
		next(err);
	}
};

exports.rejectCatalogSubmission = async (req, res, next) => {
	try {
		const { submissionId } = req.params;
		const { reviewComment } = req.body;
		const updatedSubmission =
			await catalogSubmissionService.rejectCatalogSubmission(
				submissionId,
				req.user.id,
				reviewComment,
			);
		logger.info(`Rejected catalog submission with ID: ${submissionId}`);
		res.status(200).json(updatedSubmission);
	} catch (err) {
		next(err);
	}
};

exports.createCatalogSubmission = async (req, res, next) => {
	try {
		const newSubmission =
			await catalogSubmissionService.createCatalogSubmission({
				...req.body,
				sellerId: req.user.id,
			});
		logger.info(
			`Created new catalog submission with ID: ${newSubmission.submissionId}`,
		);
		res.status(201).json(newSubmission);
	} catch (err) {
		next(err);
	}
};

exports.approveCatalogSubmission = async (req, res, next) => {
	try {
		const { submissionId } = req.params;
		const { reviewComment } = req.body;
		const updatedSubmission =
			await catalogSubmissionService.approveCatalogSubmission(
				submissionId,
				req.user.id,
				reviewComment,
			);
		logger.info(`Approved catalog submission with ID: ${submissionId}`);
		res.status(200).json(updatedSubmission);
	} catch (err) {
		next(err);
	}
};
