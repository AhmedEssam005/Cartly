const db = require("../../db/index");
const { profile, addresses, sellerInfo } = require("../../db/schema/schema");
const logger = require("../../configs/logger");
const { eq, and, count } = require("drizzle-orm");

exports.addAddress = async (addressData, profileId) => {
	const {
		label,
		recipientName,
		phoneNumber,
		streetLine1,
		streetLine2,
		city,
		state,
		postalCode,
		country,
	} = addressData;
	try {
		return await db.transaction(async (trx) => {
			const [{ count: addressCount }] = await trx
				.select({ count: count(addresses.addressId) })
				.from(addresses)
				.where(eq(addresses.userId, profileId));

			const isDefault = Number(addressCount) === 0;
			const [newAddress] = await trx
				.insert(addresses)
				.values({
					userId: profileId,
					label,
					recipientName,
					phoneNumber,
					streetLine1,
					streetLine2,
					city,
					state,
					postalCode,
					country,
					isDefault,
				})
				.returning();
			return newAddress;
		});

	} catch (error) {
		throw error;
	}
};
exports.getAllAddresses = async (profileId) => {
	try {
		const addressesList = await db
			.select()
			.from(addresses)
			.where(eq(addresses.userId, profileId))
			.execute();
		return addressesList;
	} catch (error) {
		throw error;
	}
};
exports.getAddress = async (addressId, profileId) => {
	try {
		const address = await db
			.select()
			.from(addresses)
			.where(
				and(
					eq(addresses.addressId, addressId),
					eq(addresses.userId, profileId),
				),
			)
			.execute();
		return address;
	} catch (error) {
		throw error;
	}
};
exports.updateAddress = async (addressId, addressData, profileId) => {
	const {
		label,
		recipientName,
		phoneNumber,
		streetLine1,
		streetLine2,
		city,
		state,
		postalCode,
		country,
	} = addressData;
	try {
		const updatedAddress = await db
			.update(addresses)
			.set({
				label,
				recipientName,
				phoneNumber,
				streetLine1,
				streetLine2,
				city,
				state,
				postalCode,
				country,
			})
			.where(
				and(
					eq(addresses.addressId, addressId),
					eq(addresses.userId, profileId),
				),
			)
			.returning();
		if (!updatedAddress.length) {
			const error = new Error("Address not found");
			error.statusCode = 404;
			throw error;
		}
		return updatedAddress;
	} catch (error) {
		throw error;
	}
};
exports.deleteAddress = async (addressId, profileId) => {
	try {
		const deletedAddress = await db
			.delete(addresses)
			.where(
				and(
					eq(addresses.addressId, addressId),
					eq(addresses.userId, profileId),
				),
			)
			.returning();
		if (!deletedAddress.length) {
			const error = new Error("Address not found");
			error.statusCode = 404;
			throw error;
		}
		return deletedAddress;
	} catch (error) {
		throw error;
	}
};

exports.setDefaultAddress = async (addressId, profileId) => {
	try {
		await db.transaction(async (trx) => {
			await trx
				.update(addresses)
				.set({ isDefault: false })
				.where(eq(addresses.userId, profileId));
			const updatedAddress = await trx
				.update(addresses)
				.set({ isDefault: true })
				.where(
					and(
						eq(addresses.addressId, addressId),
						eq(addresses.userId, profileId),
					),
				)
				.returning();
			if (!updatedAddress.length) {
				const error = new Error(
					"Address not found, or does not belong to the user. Transaction rolled back",
				);
				error.statusCode = 404;
				throw error;
			}
		});
	} catch (error) {
		throw error;
	}
};

exports.getProfile = async (userId) => {
	const [userProfile] = await db
		.select()
		.from(profile)
		.where(eq(profile.profileId, userId));

	if (!userProfile) {
		const error = new Error("Profile not found");
		error.statusCode = 404;
		throw error;
	}

	const [seller] = await db
		.select()
		.from(sellerInfo)
		.where(eq(sellerInfo.userId, userId));

	return {
		...userProfile,
		sellerInfo: seller || null,
	};
};

exports.updateProfile = async (userId, data) => {
	const updateData = {
		updatedAt: new Date(),
	};

	if (data.firstName !== undefined) {
		updateData.firstName = data.firstName;
	}
	if (data.lastName !== undefined) {
		updateData.lastName = data.lastName;
	}

	const [updatedProfile] = await db
		.update(profile)
		.set(updateData)
		.where(eq(profile.profileId, userId))
		.returning();

	if (!updatedProfile) {
		const error = new Error("Profile not found");
		error.statusCode = 404;
		throw error;
	}

	return updatedProfile;
};

exports.submitSellerKyc = async (userId, kycData) => {
	const { nationalId, storeName, tin, bankIban, storeLogo } = kycData;

	const [existingSeller] = await db
		.select()
		.from(sellerInfo)
		.where(eq(sellerInfo.userId, userId));

	if (existingSeller) {
		if (existingSeller.kycStatus === "approved") {
			const error = new Error("Seller KYC is already approved");
			error.statusCode = 400;
			throw error;
		}
		if (existingSeller.kycStatus === "pending") {
			const error = new Error("Seller KYC application is already pending review");
			error.statusCode = 400;
			throw error;
		}
		const [updated] = await db
			.update(sellerInfo)
			.set({
				nationalId,
				storeName,
				tin,
				bankIban,
				storeLogo,
				kycStatus: "pending",
				updatedAt: new Date(),
			})
			.where(eq(sellerInfo.userId, userId))
			.returning();

		return updated;
	}

	const [newSeller] = await db
		.insert(sellerInfo)
		.values({
			userId,
			nationalId,
			storeName,
			tin,
			bankIban,
			storeLogo,
			kycStatus: "pending",
		})
		.returning();

	return newSeller;
};
