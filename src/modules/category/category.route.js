const router = require("express").Router();
const categoryController = require("./category.controller");
const categoryValidator = require("./category.validator");
const commonValidator = require("../../middlewares/commonValidator");
const isAuth = require("../../middlewares/isAuth");
const isAdmin = require("../../middlewares/isAdmin");

router.get(
	"/",
	isAuth,
	categoryValidator.getCategoriesValidator,
	commonValidator,
	categoryController.getCategories,
);

router.get(
	"/:categoryId",
	isAuth,
	categoryValidator.getCategoryByIdValidator,
	commonValidator,
	categoryController.getCategoryById,
);

router.post(
	"/",
	isAuth,
	isAdmin,
	categoryValidator.createCategoryValidator,
	commonValidator,
	categoryController.createCategory,
);

router.patch(
	"/:categoryId",
	isAuth,
	isAdmin,
	categoryValidator.updateCategoryValidator,
	commonValidator,
	categoryController.updateCategory,
);

router.delete(
	"/:categoryId",
	isAuth,
	isAdmin,
	categoryValidator.deleteCategoryValidator,
	commonValidator,
	categoryController.deleteCategory,
);

module.exports = router;
