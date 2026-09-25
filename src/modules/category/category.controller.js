const categoryService = require("./category.service");
const logger = require("../../configs/logger");

exports.getCategories = async (req, res, next) => {
	try {
		const parentCategoryId = req.query.parentCategoryId
			? Number(req.query.parentCategoryId)
			: null;
		const categories = await categoryService.getCategories(parentCategoryId);
		logger.info("Categories retrieved successfully");
		res.status(200).json(categories);
	} catch (error) {
		next(error);
	}
};

exports.getCategoryById = async (req, res, next) => {
	try {
		const categoryId = Number(req.params.categoryId);
		const category = await categoryService.getCategoryById(categoryId);
		logger.info("Category retrieved successfully", { categoryId });
		res.status(200).json(category);
	} catch (error) {
		next(error);
	}
};

exports.createCategory = async (req, res, next) => {
	try {
		const { slug, name } = req.body;
		const parentCategoryId = req.body.parentCategoryId
			? Number(req.body.parentCategoryId)
			: null;
		const newCategory = await categoryService.addCategory(
			{ slug, name },
			parentCategoryId,
		);
		logger.info("Category created successfully", {
			categoryId: newCategory.categoryId,
		});
		res.status(201).json(newCategory);
	} catch (error) {
		next(error);
	}
};

exports.deleteCategory = async (req, res, next) => {
	try {
		const categoryId = req.params.categoryId;
		const deletedCategory = await categoryService.deleteCategory(categoryId);
		logger.info("Category deleted successfully", { categoryId });
		res.status(200).json(deletedCategory);
	} catch (error) {
		next(error);
	}
};

exports.updateCategory = async (req, res, next) => {
	try {
		const categoryId = Number(req.params.categoryId);
		const { slug, name } = req.body;
		const parentCategoryId = req.body.parentCategoryId
			? Number(req.body.parentCategoryId)
			: null;
		const updatedCategory = await categoryService.updateCategory(
			{ categoryId, slug, name },
			parentCategoryId,
		);
		logger.info("Category updated successfully", { categoryId });
		res.status(200).json(updatedCategory);
	} catch (error) {
		next(error);
	}
};
