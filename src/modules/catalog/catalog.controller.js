const catalogService = require("./catalog.service");
const logger = require("../../configs/logger");

exports.getAllBrands = async (req, res, next) => {
	try {
		const { page, limit, search } = req.query;
		const pageNum = Number(page) || 1;
		const limitNum = Number(limit) || 20;
		const offset = (pageNum - 1) * limitNum;
		const brandsList = await catalogService.getAllBrands(search, limit, offset);
		logger.info(`Retrieved ${brandsList.length} brands from the catalog`);
		res.status(200).json(brandsList);
	} catch (err) {
		next(err);
	}
};

exports.getAllCategories = async (req, res, next) => {
	try {
		const categoriesList = await catalogService.getAllCategories();
		logger.info(
			`Retrieved ${categoriesList.length} categories from the catalog`,
		);
		res.status(200).json(categoriesList);
	} catch (err) {
		next(err);
	}
};

exports.getCatalogProductById = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const product = await catalogService.getCatalogProductById(productId);
		res.status(200).json(product);
	} catch (err) {
		next(err);
	}
};

exports.getCatalogProductByGtin = async (req, res, next) => {
	try {
		const { gtin } = req.params;
		const product = await catalogService.getCatalogProductByGtin(gtin);
		res.status(200).json(product);
	} catch (err) {
		next(err);
	}
};

exports.getCatalogProducts = async (req, res, next) => {
	try {
		const { page, limit, search, brand, categoryId } = req.query;
		const pageNum = Number(page) || 1;
		const limitNum = Number(limit) || 20;
		const offset = (pageNum - 1) * limitNum;
		const productsList = await catalogService.getCatalogProducts(
			search,
			brand,
			categoryId,
			limit,
			offset,
		);
		logger.info(`Retrieved ${productsList.length} products from the catalog`);
		res.status(200).json(productsList);
	} catch (err) {
		next(err);
	}
};

exports.createCatalogProduct = async (req, res, next) => {
	try {
		const productData = req.body;
		const newProduct = await catalogService.createCatalogProduct(productData);
		logger.info(
			`Created new catalog product with ID: ${newProduct.catalogProductId}`,
		);
		res.status(201).json(newProduct);
	} catch (err) {
		next(err);
	}
};

exports.updateCatalogProduct = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const productData = req.body;
		const updatedProduct = await catalogService.updateCatalogProduct(
			productId,
			productData,
		);
		logger.info(
			`Updated catalog product with ID: ${updatedProduct.catalogProductId}`,
		);
		res.status(200).json(updatedProduct);
	} catch (err) {
		next(err);
	}
};

exports.softDeleteCatalogProduct = async (req, res, next) => {
	try {
		const { productId } = req.params;
		await catalogService.softDeleteCatalogProduct(productId);
		logger.info(`Soft deleted catalog product with ID: ${productId}`);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};
