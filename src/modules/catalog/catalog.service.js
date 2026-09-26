const db = require("../../db/index");
const {
	catalogProducts,
	productImages,
	catalogProductCategories,
	categories,
} = require("../../db/schema/schema");
const { eq, asc, and, ilike, exists } = require("drizzle-orm");

exports.getAllBrands = async (search, limit = 20, offset = 0) => {
	const conditions = [];
	if (search) {
		conditions.push(ilike(catalogProducts.brand, `%${search}%`));
	}
	const brandsList = await db
		.selectDistinct({
			brand: catalogProducts.brand,
		})
		.from(catalogProducts)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(asc(catalogProducts.brand))
		.limit(limit)
		.offset(offset);
	return brandsList;
};

exports.getAllCategories = async () => {
	const categoriesList = await db
		.selectDistinct({
			categoryId: categories.categoryId,
			name: categories.name,
		})
		.from(categories)
		.orderBy(asc(categories.name));
	return categoriesList;
};

exports.getCatalogProductById = async (productId) => {
	const [product] = await db
		.select()
		.from(catalogProducts)
		.where(eq(catalogProducts.catalogProductId, productId));
	if (!product) {
		throw new Error("Catalog product not found");
	}
	return product;
};

exports.getCatalogProductByGtin = async (gtin) => {
	const [product] = await db
		.select()
		.from(catalogProducts)
		.where(eq(catalogProducts.gtin, gtin));
	if (!product) {
		throw new Error("Catalog product not found");
	}
	return product;
};

exports.getCatalogProducts = async (
	search,
	brand,
	categoryId,
	limit = 20,
	offset = 0,
) => {
	const conditions = [];
	if (search) {
		conditions.push(ilike(catalogProducts.title, `%${search}%`));
	}
	if (brand) {
		conditions.push(eq(catalogProducts.brand, brand));
	}
	if (categoryId) {
		conditions.push(
			exists(
				db
					.select()
					.from(catalogProductCategories)
					.where(
						and(
							eq(
								catalogProductCategories.catalogProductId,
								catalogProducts.catalogProductId,
							),
							eq(catalogProductCategories.categoryId, categoryId),
						),
					),
			),
		);
	}
	return await db
		.select()
		.from(catalogProducts)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(asc(catalogProducts.brand))
		.limit(limit)
		.offset(offset);
};

exports.createCatalogProduct = async (productData) => {
	const { title, description, brand, gtin, images, productCategories } =
		productData;

	return await db.transaction(async (trx) => {
		const [newProduct] = await trx
			.insert(catalogProducts)
			.values({
				title,
				description,
				brand,
				gtin,
			})
			.returning();
		if (!newProduct) {
			throw new Error("Failed to create catalog product");
		}
		if (images && images.length > 0) {
			const imagesToInsert = images.map((image, index) => ({
				catalogProductId: newProduct.catalogProductId,
				imageUrl: image,
				isPrimary: index === 0,
				displayOrder: index + 1,
			}));
			await trx.insert(productImages).values(imagesToInsert);
		}
		if (productCategories && productCategories.length > 0) {
			const categoriesToInsert = productCategories.map((categoryId) => ({
				catalogProductId: newProduct.catalogProductId,
				categoryId,
			}));
			await trx.insert(catalogProductCategories).values(categoriesToInsert);
		}

		return newProduct;
	});
};

exports.updateCatalogProduct = async (productId, productData) => {
	const { title, description, brand, gtin, images, productCategories } =
		productData;

	return db.transaction(async (trx) => {
		const [updatedProduct] = await trx
			.update(catalogProducts)
			.set({
				title,
				description,
				brand,
				gtin,
			})
			.where(eq(catalogProducts.catalogProductId, productId))
			.returning();

		if (!updatedProduct) {
			throw new Error("Catalog product not found");
		}

		if (images !== undefined) {
			await trx
				.delete(productImages)
				.where(eq(productImages.catalogProductId, productId));

			if (images.length > 0) {
				const imagesToInsert = images.map((image, index) => ({
					catalogProductId: productId,
					imageUrl: image,
					isPrimary: index === 0,
					displayOrder: index + 1,
				}));

				await trx.insert(productImages).values(imagesToInsert);
			}
		}

		if (productCategories !== undefined) {
			await trx
				.delete(catalogProductCategories)
				.where(eq(catalogProductCategories.catalogProductId, productId));

			if (productCategories.length > 0) {
				const categoriesToInsert = productCategories.map((categoryId) => ({
					catalogProductId: productId,
					categoryId,
				}));

				await trx.insert(catalogProductCategories).values(categoriesToInsert);
			}
		}

		return updatedProduct;
	});
};

exports.softDeleteCatalogProduct = async (productId) => {
	const [deletedProduct] = await db
		.update(catalogProducts)
		.set({
			isHidden: true,
		})
		.where(eq(catalogProducts.catalogProductId, productId))
		.returning();

	if (!deletedProduct) {
		throw new Error("Catalog product not found");
	}

	return deletedProduct;
};
