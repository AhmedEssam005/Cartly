const db = require("../../db/index");
const {
	sellerListings,
	catalogProducts,
	catalogProductCategories,
	productImages,
	categories,
} = require("../../db/schema/schema");
const { eq, and } = require("drizzle-orm");

exports.addSellerListing = async (sellerListingData) => {
	// error handling in controller - violation constraint -
	const { sellerId, sku, catalogProductId, price, inventory } =
		sellerListingData;
	const [product] = await db
		.select({
			catalogProductId: catalogProducts.catalogProductId,
		})
		.from(catalogProducts)
		.where(
			and(
				eq(catalogProducts.catalogProductId, catalogProductId),
				eq(catalogProducts.isHidden, false),
			),
		);

	if (!product) {
		const error = new Error("Catalog product not found");
		error.statusCode = 404;
		throw error;
	}

	const [newListing] = await db
		.insert(sellerListings)
		.values({
			sellerId,
			sku,
			catalogProductId,
			price: Math.round(Number(price) * 100), // Convert price to piasters
			inventory,
		})
		.returning();
	return newListing;
};

exports.updateSellerListing = async (sellerListingData) => {
	const { listingId, sellerId, sku, price, inventory } = sellerListingData;
	const [updatedListing] = await db
		.update(sellerListings)
		.set({
			sku,
			price: Math.round(Number(price) * 100), // Convert price to piasters
			inventory,
		})
		.where(
			and(
				eq(sellerListings.listingId, listingId),
				eq(sellerListings.sellerId, sellerId),
			),
		)
		.returning();
	if (!updatedListing) {
		const error = new Error("Listing not found");
		error.statusCode = 404;
		throw error;
	}
	return updatedListing;
};

exports.getSellerListingsBySellerId = async (sellerId) => {
	//! gonna need to nearly same service for user store front
	const listings = await db
		.select({
			listingId: sellerListings.listingId,
			sellerId: sellerListings.sellerId,
			sku: sellerListings.sku,
			price: sellerListings.price / 100, // Convert price from piasters to dollars
			inventory: sellerListings.inventory,
			isActive: sellerListings.isActive,
			image: productImages.imageUrl,
		})
		.from(sellerListings)
		.innerJoin(
			catalogProducts,
			eq(sellerListings.catalogProductId, catalogProducts.catalogProductId),
		)
		.leftJoin(
			productImages,
			and(
				eq(catalogProducts.catalogProductId, productImages.catalogProductId),
				eq(productImages.isPrimary, true),
			),
		)
		.where(eq(sellerListings.sellerId, sellerId));
	return listings;
};
exports.getListingById = async (listingId, sellerId) => {
	const [listing] = await db
		.select({
			listingId: sellerListings.listingId,
			sellerId: sellerListings.sellerId,
			sku: sellerListings.sku,
			price: sellerListings.price / 100, // Convert price from piasters to dollars
			isActive: sellerListings.isActive,
			inventory: sellerListings.inventory,

			catalogProductId: catalogProducts.catalogProductId,
			gtin: catalogProducts.gtin,
			brand: catalogProducts.brand,
			title: catalogProducts.title,
			description: catalogProducts.description,
		})
		.from(sellerListings)
		.innerJoin(
			catalogProducts,
			eq(sellerListings.catalogProductId, catalogProducts.catalogProductId),
		)
		.where(
			and(
				eq(sellerListings.listingId, listingId),
				eq(sellerListings.sellerId, sellerId),
			),
		);

	if (!listing) {
		const error = new Error("Listing not found");
		error.statusCode = 404;
		throw error;
	}

	const [categoriesResult, images] = await Promise.all([
		db
			.select({
				categoryId: categories.categoryId,
				name: categories.name,
			})
			.from(catalogProductCategories)
			.innerJoin(
				categories,
				eq(catalogProductCategories.categoryId, categories.categoryId),
			)
			.where(
				eq(catalogProductCategories.catalogProductId, listing.catalogProductId),
			),

		db
			.select({
				imageId: productImages.imageId,
				imageUrl: productImages.imageUrl,
				isPrimary: productImages.isPrimary,
				displayOrder: productImages.displayOrder,
			})
			.from(productImages)
			.where(eq(productImages.catalogProductId, listing.catalogProductId)),
	]);

	return {
		...listing,
		categories: categoriesResult,
		images,
	};
};

exports.deactivateSellerListing = async (listingId, sellerId) => {
	const [deactivatedListing] = await db
		.update(sellerListings)
		.set({ isActive: false })
		.where(
			and(
				eq(sellerListings.listingId, listingId),
				eq(sellerListings.sellerId, sellerId),
			),
		)
		.returning();
	if (!deactivatedListing) {
		const error = new Error("Listing not found");
		error.statusCode = 404;
		throw error;
	}
	return deactivatedListing;
};

exports.activateSellerListing = async (listingId, sellerId) => {
	const [activatedListing] = await db
		.update(sellerListings)
		.set({ isActive: true })
		.where(
			and(
				eq(sellerListings.listingId, listingId),
				eq(sellerListings.sellerId, sellerId),
			),
		)
		.returning();
	if (!activatedListing) {
		const error = new Error("Listing not found");
		error.statusCode = 404;
		throw error;
	}
	return activatedListing;
};
