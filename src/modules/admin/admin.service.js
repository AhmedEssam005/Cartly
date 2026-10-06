const db = require("../../db/index");
const {
	profile,
	sellerInfo,
	catalogProducts,
	categories,
	catalogSubmissions,
} = require("../../db/schema/schema");
const { eq, and, desc, count } = require("drizzle-orm");
const catalogService = require("../catalog/catalog.service");
const catalogSubmissionService = require("../catalogSubmission/catalogSubmission.service");
const categoryService = require("../category/category.service");

exports.getSellers = async ({ kycStatus, page = 1, limit = 20 }) => {
	const pageNum = Math.max(1, Number(page));
	const limitNum = Math.max(1, Math.min(100, Number(limit)));
	const offset = (pageNum - 1) * limitNum;

	let whereClause = undefined;
	if (kycStatus) {
		whereClause = eq(sellerInfo.kycStatus, kycStatus);
	}

	const sellersList = await db
		.select({
			sellerId: sellerInfo.userId,
			storeName: sellerInfo.storeName,
			nationalId: sellerInfo.nationalId,
			tin: sellerInfo.tin,
			bankIban: sellerInfo.bankIban,
			storeLogo: sellerInfo.storeLogo,
			kycStatus: sellerInfo.kycStatus,
			createdAt: sellerInfo.createdAt,
			updatedAt: sellerInfo.updatedAt,
			firstName: profile.firstName,
			lastName: profile.lastName,
			role: profile.role,
		})
		.from(sellerInfo)
		.innerJoin(profile, eq(sellerInfo.userId, profile.profileId))
		.where(whereClause)
		.limit(limitNum)
		.offset(offset)
		.orderBy(desc(sellerInfo.createdAt));

	const [{ totalCount }] = await db
		.select({ totalCount: count() })
		.from(sellerInfo)
		.where(whereClause);

	return {
		sellers: sellersList,
		pagination: {
			total: Number(totalCount),
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(Number(totalCount) / limitNum),
		},
	};
};

exports.getSellerById = async (sellerId) => {
	const [seller] = await db
		.select({
			sellerId: sellerInfo.userId,
			storeName: sellerInfo.storeName,
			nationalId: sellerInfo.nationalId,
			tin: sellerInfo.tin,
			bankIban: sellerInfo.bankIban,
			storeLogo: sellerInfo.storeLogo,
			kycStatus: sellerInfo.kycStatus,
			createdAt: sellerInfo.createdAt,
			updatedAt: sellerInfo.updatedAt,
			firstName: profile.firstName,
			lastName: profile.lastName,
			role: profile.role,
		})
		.from(sellerInfo)
		.innerJoin(profile, eq(sellerInfo.userId, profile.profileId))
		.where(eq(sellerInfo.userId, sellerId));

	if (!seller) {
		const error = new Error("Seller not found");
		error.statusCode = 404;
		throw error;
	}

	return seller;
};

exports.approveSellerKyc = async (sellerId) => {
	return await db.transaction(async (tx) => {
		const [seller] = await tx
			.select()
			.from(sellerInfo)
			.where(eq(sellerInfo.userId, sellerId));

		if (!seller) {
			const error = new Error("Seller not found");
			error.statusCode = 404;
			throw error;
		}

		const [updatedSeller] = await tx
			.update(sellerInfo)
			.set({
				kycStatus: "approved",
				updatedAt: new Date(),
			})
			.where(eq(sellerInfo.userId, sellerId))
			.returning();

		await tx
			.update(profile)
			.set({
				role: "seller",
				updatedAt: new Date(),
			})
			.where(eq(profile.profileId, sellerId));

		return {
			message: "Seller KYC approved successfully",
			seller: updatedSeller,
		};
	});
};

exports.rejectSellerKyc = async (sellerId) => {
	const [seller] = await db
		.select()
		.from(sellerInfo)
		.where(eq(sellerInfo.userId, sellerId));

	if (!seller) {
		const error = new Error("Seller not found");
		error.statusCode = 404;
		throw error;
	}

	const [updatedSeller] = await db
		.update(sellerInfo)
		.set({
			kycStatus: "rejected",
			updatedAt: new Date(),
		})
		.where(eq(sellerInfo.userId, sellerId))
		.returning();

	return {
		message: "Seller KYC rejected",
		seller: updatedSeller,
	};
};

exports.hideCatalogProduct = async (productId) => {
	return await catalogService.softDeleteCatalogProduct(productId);
};

exports.showCatalogProduct = async (productId) => {
	const [restoredProduct] = await db
		.update(catalogProducts)
		.set({
			isHidden: false,
		})
		.where(eq(catalogProducts.catalogProductId, productId))
		.returning();

	if (!restoredProduct) {
		const error = new Error("Catalog product not found");
		error.statusCode = 404;
		throw error;
	}

	return restoredProduct;
};

exports.getCatalogSubmissions = async ({ status, page = 1, limit = 20 }) => {
	const pageNum = Math.max(1, Number(page));
	const limitNum = Math.max(1, Math.min(100, Number(limit)));
	const offset = (pageNum - 1) * limitNum;

	let whereClause = undefined;
	if (status) {
		whereClause = eq(catalogSubmissions.status, status);
	}

	const submissions = await db
		.select()
		.from(catalogSubmissions)
		.where(whereClause)
		.limit(limitNum)
		.offset(offset)
		.orderBy(desc(catalogSubmissions.createdAt));

	const [{ totalCount }] = await db
		.select({ totalCount: count() })
		.from(catalogSubmissions)
		.where(whereClause);

	return {
		submissions,
		pagination: {
			total: Number(totalCount),
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(Number(totalCount) / limitNum),
		},
	};
};

exports.getCatalogSubmissionById = async (submissionId) => {
	return await catalogSubmissionService.getCatalogSubmissionById(submissionId);
};

exports.approveCatalogSubmission = async (submissionId, adminId, reviewComment) => {
	return await catalogSubmissionService.approveCatalogSubmission(
		submissionId,
		adminId,
		reviewComment,
	);
};

exports.rejectCatalogSubmission = async (submissionId, adminId, reviewComment) => {
	return await catalogSubmissionService.rejectCatalogSubmission(
		submissionId,
		adminId,
		reviewComment,
	);
};

exports.createCategory = async (data) => {
	const parentCategoryId = data.parentCategoryId
		? Number(data.parentCategoryId)
		: null;
	return await categoryService.addCategory(
		{ slug: data.slug, name: data.name },
		parentCategoryId,
	);
};

exports.updateCategory = async (categoryId, data) => {
	const parentCategoryId =
		data.parentCategoryId !== undefined
			? data.parentCategoryId
				? Number(data.parentCategoryId)
				: null
			: null;
	return await categoryService.updateCategory(
		{
			categoryId: Number(categoryId),
			slug: data.slug,
			name: data.name,
		},
		parentCategoryId,
	);
};

exports.deleteCategory = async (categoryId) => {
	return await categoryService.deleteCategory(Number(categoryId));
};
