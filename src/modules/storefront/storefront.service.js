const db = require("../../db/index");
const {
	catalogProducts,
	productImages,
	catalogProductCategories,
	categories,
	sellerListings,
	sellerInfo,
} = require("../../db/schema/schema");
const { eq, and, desc, asc, ilike, count, sql, inArray, gte, lte } = require("drizzle-orm");

exports.getProducts = async ({
	search,
	categoryId,
	brand,
	sort = "newest",
	page = 1,
	limit = 20,
}) => {
	const pageNum = Math.max(1, Number(page));
	const limitNum = Math.max(1, Math.min(100, Number(limit)));
	const offset = (pageNum - 1) * limitNum;

	const conditions = [eq(catalogProducts.isHidden, false)];

	if (search) {
		conditions.push(
			sql`(${catalogProducts.title} ILIKE ${`%${search}%`} OR ${catalogProducts.description} ILIKE ${`%${search}%`})`,
		);
	}

	if (brand) {
		conditions.push(eq(catalogProducts.brand, brand));
	}

	if (categoryId) {
		const matchingProductIds = db
			.select({ id: catalogProductCategories.catalogProductId })
			.from(catalogProductCategories)
			.where(eq(catalogProductCategories.categoryId, Number(categoryId)));

		conditions.push(inArray(catalogProducts.catalogProductId, matchingProductIds));
	}

	let orderByClause;
	switch (sort) {
		case "title_asc":
			orderByClause = asc(catalogProducts.title);
			break;
		case "title_desc":
			orderByClause = desc(catalogProducts.title);
			break;
		case "newest":
		default:
			orderByClause = desc(catalogProducts.createdAt);
			break;
	}

	const whereCombined = and(...conditions);

	const productsList = await db
		.select({
			productId: catalogProducts.catalogProductId,
			title: catalogProducts.title,
			brand: catalogProducts.brand,
			description: catalogProducts.description,
			gtin: catalogProducts.gtin,
			createdAt: catalogProducts.createdAt,
		})
		.from(catalogProducts)
		.where(whereCombined)
		.limit(limitNum)
		.offset(offset)
		.orderBy(orderByClause);

	const productIds = productsList.map((p) => p.productId);

	let imagesByProduct = {};
	let minPriceByProduct = {};

	if (productIds.length > 0) {
		// Fetch primary images
		const images = await db
			.select({
				productId: productImages.catalogProductId,
				imageUrl: productImages.imageUrl,
				isPrimary: productImages.isPrimary,
				displayOrder: productImages.displayOrder,
			})
			.from(productImages)
			.where(inArray(productImages.catalogProductId, productIds))
			.orderBy(asc(productImages.displayOrder));

		for (const img of images) {
			if (!imagesByProduct[img.productId]) {
				imagesByProduct[img.productId] = [];
			}
			imagesByProduct[img.productId].push(img);
		}

		// Fetch lowest active price
		const prices = await db
			.select({
				productId: sellerListings.catalogProductId,
				minPrice: sql`MIN(${sellerListings.price})`.mapWith(Number),
				offerCount: count(sellerListings.listingId),
			})
			.from(sellerListings)
			.where(
				and(
					inArray(sellerListings.catalogProductId, productIds),
					eq(sellerListings.isActive, true),
					sql`${sellerListings.inventory} > 0`,
				),
			)
			.groupBy(sellerListings.catalogProductId);

		for (const p of prices) {
			minPriceByProduct[p.productId] = {
				minPrice: p.minPrice,
				offerCount: Number(p.offerCount),
			};
		}
	}

	const enrichedProducts = productsList.map((p) => ({
		...p,
		images: imagesByProduct[p.productId] || [],
		pricing: minPriceByProduct[p.productId] || { minPrice: null, offerCount: 0 },
	}));

	const [{ totalCount }] = await db
		.select({ totalCount: count() })
		.from(catalogProducts)
		.where(whereCombined);

	return {
		products: enrichedProducts,
		pagination: {
			total: Number(totalCount),
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(Number(totalCount) / limitNum),
		},
	};
};

exports.getProductById = async (productId) => {
	const [product] = await db
		.select()
		.from(catalogProducts)
		.where(
			and(
				eq(catalogProducts.catalogProductId, productId),
				eq(catalogProducts.isHidden, false),
			),
		);

	if (!product) {
		const error = new Error("Product not found");
		error.statusCode = 404;
		throw error;
	}

	const images = await db
		.select({
			imageId: productImages.imageId,
			imageUrl: productImages.imageUrl,
			isPrimary: productImages.isPrimary,
			displayOrder: productImages.displayOrder,
		})
		.from(productImages)
		.where(eq(productImages.catalogProductId, productId))
		.orderBy(asc(productImages.displayOrder));

	const productCategoriesList = await db
		.select({
			categoryId: categories.categoryId,
			name: categories.name,
			slug: categories.slug,
		})
		.from(catalogProductCategories)
		.innerJoin(
			categories,
			eq(catalogProductCategories.categoryId, categories.categoryId),
		)
		.where(eq(catalogProductCategories.catalogProductId, productId));

	const listings = await db
		.select({
			listingId: sellerListings.listingId,
			price: sellerListings.price,
			inventory: sellerListings.inventory,
			seller: {
				sellerId: sellerInfo.userId,
				storeName: sellerInfo.storeName,
				storeLogo: sellerInfo.storeLogo,
			},
		})
		.from(sellerListings)
		.innerJoin(sellerInfo, eq(sellerListings.sellerId, sellerInfo.userId))
		.where(
			and(
				eq(sellerListings.catalogProductId, productId),
				eq(sellerListings.isActive, true),
			),
		)
		.orderBy(asc(sellerListings.price));

	return {
		productId: product.catalogProductId,
		title: product.title,
		description: product.description,
		brand: product.brand,
		gtin: product.gtin,
		createdAt: product.createdAt,
		images,
		categories: productCategoriesList,
		listings,
	};
};

exports.getCategories = async () => {
	return await db
		.select({
			categoryId: categories.categoryId,
			name: categories.name,
			slug: categories.slug,
			parentCategoryId: categories.parentCategoryId,
		})
		.from(categories)
		.orderBy(asc(categories.name));
};

exports.getCategoryById = async (categoryId) => {
	const [category] = await db
		.select({
			categoryId: categories.categoryId,
			name: categories.name,
			slug: categories.slug,
			parentCategoryId: categories.parentCategoryId,
		})
		.from(categories)
		.where(eq(categories.categoryId, categoryId));

	if (!category) {
		const error = new Error("Category not found");
		error.statusCode = 404;
		throw error;
	}

	const subcategories = await db
		.select({
			categoryId: categories.categoryId,
			name: categories.name,
			slug: categories.slug,
		})
		.from(categories)
		.where(eq(categories.parentCategoryId, categoryId));

	return {
		...category,
		subcategories,
	};
};

exports.getProductListings = async (productId) => {
	const [product] = await db
		.select({ catalogProductId: catalogProducts.catalogProductId })
		.from(catalogProducts)
		.where(
			and(
				eq(catalogProducts.catalogProductId, productId),
				eq(catalogProducts.isHidden, false),
			),
		);

	if (!product) {
		const error = new Error("Product not found");
		error.statusCode = 404;
		throw error;
	}

	return await db
		.select({
			listingId: sellerListings.listingId,
			price: sellerListings.price,
			inventory: sellerListings.inventory,
			seller: {
				sellerId: sellerInfo.userId,
				storeName: sellerInfo.storeName,
				storeLogo: sellerInfo.storeLogo,
			},
		})
		.from(sellerListings)
		.innerJoin(sellerInfo, eq(sellerListings.sellerId, sellerInfo.userId))
		.where(
			and(
				eq(sellerListings.catalogProductId, productId),
				eq(sellerListings.isActive, true),
			),
		)
		.orderBy(asc(sellerListings.price));
};

exports.getListingById = async (listingId) => {
	const [listing] = await db
		.select({
			listingId: sellerListings.listingId,
			sku: sellerListings.sku,
			price: sellerListings.price,
			inventory: sellerListings.inventory,
			isActive: sellerListings.isActive,
			catalogProductId: sellerListings.catalogProductId,
			sellerId: sellerListings.sellerId,
			storeName: sellerInfo.storeName,
			storeLogo: sellerInfo.storeLogo,
			productTitle: catalogProducts.title,
			productDescription: catalogProducts.description,
			productBrand: catalogProducts.brand,
			productGtin: catalogProducts.gtin,
			productIsHidden: catalogProducts.isHidden,
		})
		.from(sellerListings)
		.innerJoin(sellerInfo, eq(sellerListings.sellerId, sellerInfo.userId))
		.innerJoin(
			catalogProducts,
			eq(sellerListings.catalogProductId, catalogProducts.catalogProductId),
		)
		.where(
			and(
				eq(sellerListings.listingId, listingId),
				eq(sellerListings.isActive, true),
				eq(catalogProducts.isHidden, false),
			),
		);

	if (!listing) {
		const error = new Error("Listing not found or unavailable");
		error.statusCode = 404;
		throw error;
	}

	const images = await db
		.select({
			imageId: productImages.imageId,
			imageUrl: productImages.imageUrl,
			isPrimary: productImages.isPrimary,
			displayOrder: productImages.displayOrder,
		})
		.from(productImages)
		.where(eq(productImages.catalogProductId, listing.catalogProductId))
		.orderBy(asc(productImages.displayOrder));

	return {
		listingId: listing.listingId,
		sku: listing.sku,
		price: listing.price,
		inventory: listing.inventory,
		seller: {
			sellerId: listing.sellerId,
			storeName: listing.storeName,
			storeLogo: listing.storeLogo,
		},
		product: {
			productId: listing.catalogProductId,
			title: listing.productTitle,
			description: listing.productDescription,
			brand: listing.productBrand,
			gtin: listing.productGtin,
			images,
		},
	};
};
