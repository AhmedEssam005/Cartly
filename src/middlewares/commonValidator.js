const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed");
		error.statusCode = 422;
		error.details = errors.array();
		return next(error);
	}
	next();
};
