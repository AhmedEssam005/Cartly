const profileService = require("./profile.service");

exports.addAddress = async (req, res, next) => {
	try {
		const address = await profileService.addAddress(req.body, req.user.id);
		res.status(201).json(address);
	} catch (error) {
		next(error);
	}
};

exports.getAllAddresses = async (req, res, next) => {
	try {
		const addresses = await profileService.getAllAddresses(req.user.id);
		res.status(200).json(addresses);
	} catch (error) {
		next(error);
	}
};

exports.getAddress = async (req, res, next) => {
	try {
		const [address] = await profileService.getAddress(
			Number(req.params.addressId),
			req.user.id,
		);
		if (!address) {
			const error = new Error("Address not found");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json(address);
	} catch (error) {
		next(error);
	}
};

exports.updateAddress = async (req, res, next) => {
	try {
		const [address] = await profileService.updateAddress(
			Number(req.params.addressId),
			req.body,
			req.user.id,
		);
		res.status(200).json(address);
	} catch (error) {
		next(error);
	}
};

exports.deleteAddress = async (req, res, next) => {
	try {
		const [address] = await profileService.deleteAddress(
			Number(req.params.addressId),
			req.user.id,
		);
		res.status(200).json(address);
	} catch (error) {
		next(error);
	}
};

exports.setDefaultAddress = async (req, res, next) => {
	try {
		await profileService.setDefaultAddress(
			Number(req.params.addressId),
			req.user.id,
		);
		res.status(200).json({ message: "Default address updated" });
	} catch (error) {
		next(error);
	}
};
