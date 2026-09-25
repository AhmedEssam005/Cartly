const router = require("express").Router();
const authController = require("./auth.controller");
const isAuth = require("../../middlewares/isAuth");
const authValidator = require("./auth.validator");
const commonValidator = require("../../middlewares/commonValidator");
router.post(
	"/register",
	authValidator.registerUserValidator,
	commonValidator,
	authController.registerUser,
);
router.get(
	"/me",
	isAuth,
	authValidator.meValidator,
	commonValidator,
	authController.me,
);

module.exports = router;
