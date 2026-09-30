const profileService = require("./profile.service");
const logger = require("../../configs/logger");

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

exports.getProfile = async (req, res, next) => {
	try {
		const userProfile = await profileService.getProfile(req.user.id);
		res.status(200).json(userProfile);
		logger.info(`Profile retrieved successfully for userId: ${req.user.id}`);
	} catch (error) {
		next(error);
	}
};

exports.updateProfile = async (req, res, next) => {
	try {
		const updatedProfile = await profileService.updateProfile(
			req.user.id,
			req.body,
		);
		res.status(200).json(updatedProfile);
		logger.info(`Profile updated successfully for userId: ${req.user.id}`);
	} catch (error) {
		next(error);
	}
};

exports.submitSellerKyc = async (req, res, next) => {
	try {
		const seller = await profileService.submitSellerKyc(req.user.id, req.body);
		logger.info(`Seller KYC submitted successfully for userId: ${req.user.id}`);
		res.status(201).json({
			message: "Seller KYC submitted successfully and is pending review",
			seller,
		});
	} catch (error) {
		next(error);
	}
};
