const db = require("../../db/index");

const {
	catalogSubmissions,
	catalogSubmissionsImages,
	catalogSubmissionCategories,
	catalogProducts,
	catalogProductCategories,
	productImages,
	categories,
	profile,
} = require("../../db/schema/schema");

const { eq, asc, and } = require("drizzle-orm");

exports.getCatalogSubmissionById = async (submissionId, user) => {
	const [submission] = await db
		.select()
		.from(catalogSubmissions)
		.where(eq(catalogSubmissions.submissionId, Number(submissionId)));

	if (!submission) {
		const error = new Error("Catalog submission not found");
		error.statusCode = 404;
		throw error;
	}

	if (user && user.id && submission.sellerId !== user.id) {
		const [userProfile] = await db
			.select({ role: profile.role })
			.from(profile)
			.where(eq(profile.profileId, user.id));

		if (!userProfile || userProfile.role !== "admin") {
			const error = new Error("Forbidden: You cannot view this submission");
			error.statusCode = 403;
			throw error;
		}
	}

	const images = await db
		.select()
		.from(catalogSubmissionsImages)
		.where(eq(catalogSubmissionsImages.submissionId, submissionId))
		.orderBy(asc(catalogSubmissionsImages.displayOrder));

	const categoriesList = await db
		.select({
			categoryId: categories.categoryId,
			name: categories.name,
			slug: categories.slug,
		})
		.from(catalogSubmissionCategories)
		.innerJoin(
			categories,
			eq(catalogSubmissionCategories.categoryId, categories.categoryId),
		)
		.where(eq(catalogSubmissionCategories.submissionId, submissionId));

	return {
		...submission,
		images,
		categories: categoriesList,
	};
};

exports.getSellerCatalogSubmissions = async (sellerId) => {
	const submissions = await db
		.select()
		.from(catalogSubmissions)
		.where(eq(catalogSubmissions.sellerId, sellerId))
		.orderBy(asc(catalogSubmissions.createdAt));

	return submissions;
};

exports.getPendingCatalogSubmissions = async () => {
	const submissions = await db
		.select()
		.from(catalogSubmissions)
		.where(eq(catalogSubmissions.status, "pending"))
		.orderBy(asc(catalogSubmissions.createdAt));

	return submissions;
};

exports.rejectCatalogSubmission = async (
	submissionId,
	reviewerId,
	reviewComment,
) => {
	const [updatedSubmission] = await db
		.update(catalogSubmissions)
		.set({
			status: "rejected",
			reviewerBy: reviewerId,
			reviewComment,
			reviewedAt: new Date(),
		})
		.where(
			and(
				eq(catalogSubmissions.submissionId, submissionId),
				eq(catalogSubmissions.status, "pending"),
			),
		)
		.returning();

	if (!updatedSubmission) {
		const error = new Error("Catalog submission not found");
		error.statusCode = 404;
		throw error;
	}

	return updatedSubmission;
};

exports.createCatalogSubmission = async (submissionData) => {
	const { sellerId, brand, title, description, gtin, categories, images } =
		submissionData;

	return await db.transaction(async (trx) => {
		const [submission] = await trx
			.insert(catalogSubmissions)
			.values({
				sellerId,
				title,
				brand,
				gtin,
				description,
				status: "pending",
			})
			.returning();

		await trx.insert(catalogSubmissionCategories).values(
			categories.map((categoryId) => ({
				submissionId: submission.submissionId,
				categoryId,
			})),
		);

		await trx.insert(catalogSubmissionsImages).values(
			images.map((imageUrl, index) => ({
				submissionId: submission.submissionId,
				imageUrl,
				displayOrder: index + 1,
				isPrimary: index === 0,
			})),
		);

		return submission;
	});
};

exports.approveCatalogSubmission = async (
	submissionId,
	reviewerId,
	reviewComment,
) => {
	return await db.transaction(async (trx) => {
		const [submission] = await trx
			.select()
			.from(catalogSubmissions)
			.where(
				and(
					eq(catalogSubmissions.submissionId, submissionId),
					eq(catalogSubmissions.status, "pending"),
				),
			);

		if (!submission) {
			const error = new Error("Catalog submission not found");
			error.statusCode = 404;
			throw error;
		}

		const [catalogProduct] = await trx
			.insert(catalogProducts)
			.values({
				brand: submission.brand,
				title: submission.title,
				description: submission.description,
				gtin: submission.gtin,
			})
			.returning();

		if (!catalogProduct) {
			const error = new Error("Failed to create catalog product");
			error.statusCode = 500;
			throw error;
		}

		const submissionCategories = await trx
			.select()
			.from(catalogSubmissionCategories)
			.where(eq(catalogSubmissionCategories.submissionId, submissionId));

		if (submissionCategories.length > 0) {
			await trx.insert(catalogProductCategories).values(
				submissionCategories.map(({ categoryId }) => ({
					catalogProductId: catalogProduct.catalogProductId,
					categoryId,
				})),
			);
		}

		const submissionImages = await trx
			.select()
			.from(catalogSubmissionsImages)
			.where(eq(catalogSubmissionsImages.submissionId, submissionId));

		if (submissionImages.length > 0) {
			await trx.insert(productImages).values(
				submissionImages.map(({ imageUrl, displayOrder, isPrimary }) => ({
					catalogProductId: catalogProduct.catalogProductId,
					imageUrl,
					displayOrder,
					isPrimary,
				})),
			);
		}

		const [updatedSubmission] = await trx
			.update(catalogSubmissions)
			.set({
				status: "approved",
				reviewerBy: reviewerId,
				reviewComment,
				reviewedAt: new Date(),
			})
			.where(
				and(
					eq(catalogSubmissions.submissionId, submissionId),
					eq(catalogSubmissions.status, "pending"),
				),
			)
			.returning();

		if (!updatedSubmission) {
			const error = new Error("Catalog submission not found");
			error.statusCode = 404;
			throw error;
		}

		return {
			submission: updatedSubmission,
			product: catalogProduct,
		};
	});
};
