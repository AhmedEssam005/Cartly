const adminService = require("./admin.service");
const catalogService = require("../catalog/catalog.service");
const uploadImages = require("../../utils/uploadImages");
const logger = require("../../configs/logger");

// --- Sellers & KYC ---

exports.getSellers = async (req, res, next) => {
	try {
		const { kycStatus, page, limit } = req.query;
		const result = await adminService.getSellers({ kycStatus, page, limit });
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.getSellerById = async (req, res, next) => {
	try {
		const seller = await adminService.getSellerById(req.params.sellerId);
		res.status(200).json(seller);
	} catch (error) {
		next(error);
	}
};

exports.approveSellerKyc = async (req, res, next) => {
	try {
		const result = await adminService.approveSellerKyc(req.params.sellerId);
		logger.info(
			`Admin ${req.user.id} approved seller KYC for ${req.params.sellerId}`,
		);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.rejectSellerKyc = async (req, res, next) => {
	try {
		const result = await adminService.rejectSellerKyc(req.params.sellerId);
		logger.info(
			`Admin ${req.user.id} rejected seller KYC for ${req.params.sellerId}`,
		);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

// --- Catalog Products Management ---

exports.createCatalogProduct = async (req, res, next) => {
	try {
		let images = [];
		if (req.files && req.files.length > 0) {
			const uploadedImages = await uploadImages(
				req.files,
				"Cartly",
				"catalog-products",
			);
			images = uploadedImages.map((img) => img.publicUrl);
		}
		const productCategories = req.body.productCategories
			? Array.isArray(req.body.productCategories)
				? req.body.productCategories.map(Number)
				: [Number(req.body.productCategories)]
			: [];

		const product = await catalogService.createCatalogProduct({
			...req.body,
			images,
			productCategories,
		});

		logger.info(
			`Admin ${req.user.id} created catalog product ${product.catalogProductId}`,
		);
		res.status(201).json(product);
	} catch (error) {
		next(error);
	}
};

exports.updateCatalogProduct = async (req, res, next) => {
	try {
		const productId = Number(req.params.productId);
		let images = undefined;
		if (req.files && req.files.length > 0) {
			const uploadedImages = await uploadImages(
				req.files,
				"Cartly",
				"catalog-products",
			);
			images = uploadedImages.map((img) => img.publicUrl);
		}
		const productCategories = req.body.productCategories
			? Array.isArray(req.body.productCategories)
				? req.body.productCategories.map(Number)
				: [Number(req.body.productCategories)]
			: undefined;

		const product = await catalogService.updateCatalogProduct(productId, {
			...req.body,
			images,
			productCategories,
		});

		logger.info(`Admin ${req.user.id} updated catalog product ${productId}`);
		res.status(200).json(product);
	} catch (error) {
		next(error);
	}
};

exports.hideCatalogProduct = async (req, res, next) => {
	try {
		const productId = Number(req.params.productId);
		const product = await adminService.hideCatalogProduct(productId);
		logger.info(`Admin ${req.user.id} hid catalog product ${productId}`);
		res.status(200).json({ message: "Catalog product hidden", product });
	} catch (error) {
		next(error);
	}
};

exports.showCatalogProduct = async (req, res, next) => {
	try {
		const productId = Number(req.params.productId);
		const product = await adminService.showCatalogProduct(productId);
		logger.info(`Admin ${req.user.id} unhid catalog product ${productId}`);
		res.status(200).json({ message: "Catalog product made visible", product });
	} catch (error) {
		next(error);
	}
};

// --- Catalog Submissions Moderation ---

exports.getCatalogSubmissions = async (req, res, next) => {
	try {
		const { status, page, limit } = req.query;
		const result = await adminService.getCatalogSubmissions({
			status,
			page,
			limit,
		});
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.getCatalogSubmissionById = async (req, res, next) => {
	try {
		const submission = await adminService.getCatalogSubmissionById(
			Number(req.params.submissionId),
		);
		res.status(200).json(submission);
	} catch (error) {
		next(error);
	}
};

exports.approveCatalogSubmission = async (req, res, next) => {
	try {
		const submissionId = Number(req.params.submissionId);
		const result = await adminService.approveCatalogSubmission(
			submissionId,
			req.user.id,
			req.body.reviewComment,
		);
		logger.info(
			`Admin ${req.user.id} approved catalog submission ${submissionId}`,
		);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

exports.rejectCatalogSubmission = async (req, res, next) => {
	try {
		const submissionId = Number(req.params.submissionId);
		const result = await adminService.rejectCatalogSubmission(
			submissionId,
			req.user.id,
			req.body.reviewComment,
		);
		logger.info(
			`Admin ${req.user.id} rejected catalog submission ${submissionId}`,
		);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

// --- Categories ---

exports.createCategory = async (req, res, next) => {
	try {
		const category = await adminService.createCategory(req.body);
		res.status(201).json(category);
	} catch (error) {
		next(error);
	}
};

exports.updateCategory = async (req, res, next) => {
	try {
		const category = await adminService.updateCategory(
			Number(req.params.categoryId),
			req.body,
		);
		res.status(200).json(category);
	} catch (error) {
		next(error);
	}
};

exports.deleteCategory = async (req, res, next) => {
	try {
		const result = await adminService.deleteCategory(
			Number(req.params.categoryId),
		);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};
