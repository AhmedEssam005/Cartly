const authService = require("./auth.service");

exports.registerUser = async (req, res, next) => {
	try {
		const { email, password, firstName, lastName } = req.body;
		const userData = { email, password, firstName, lastName };
		const result = await authService.registerUser(userData);
		res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

exports.me = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const profile = await authService.me(userId);
		res.status(200).json(profile);
	} catch (err) {
		next(err);
	}
};
