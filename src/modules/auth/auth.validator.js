const { body, param } = require("express-validator");

exports.registerUserValidator = [
	body("email").isEmail().withMessage("Invalid email address"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long")
		.isStrongPassword()
		.withMessage(
			"Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
		),
	body("firstName").notEmpty().withMessage("First name is required"),
	body("lastName").notEmpty().withMessage("Last name is required"),
];

exports.meValidator = [param("userId").isUUID().withMessage("Invalid user ID")];
