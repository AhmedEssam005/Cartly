const db = require("../../db/index");
const {
	categories,
	catalogProductCategories,
} = require("../../db/schema/schema");

const { eq, isNull, sql, count } = require("drizzle-orm");

exports.getCategories = async (parentCategoryId) => {
	const category = await db
		.select({
			categoryId: categories.categoryId,
			parentCategoryId: categories.parentCategoryId,
			name: categories.name,
			slug: categories.slug,
		})
		.from(categories)
		.where(
			parentCategoryId === null
				? isNull(categories.parentCategoryId)
				: eq(categories.parentCategoryId, parentCategoryId),
		)
		.execute();
	return category;
};

exports.getCategoryById = async (categoryId) => {
	const result = await db.execute(sql`
        WITH RECURSIVE category_path AS (
            SELECT
                category_id,
                parent_category_id,
                name,
                slug,
                0 AS depth
            FROM categories
            WHERE category_id = ${categoryId}

            UNION ALL

            SELECT
                c.category_id,
                c.parent_category_id,
                c.name,
                c.slug,
                cp.depth + 1
            FROM categories c
            INNER JOIN category_path cp
                ON c.category_id = cp.parent_category_id
        )
        SELECT
            category_id,
            parent_category_id,
            name,
            slug
        FROM category_path
        ORDER BY depth DESC
    `);
	if (result.rows.length === 0) {
		const error = new Error("Category not found");
		error.statusCode = 404;
		throw error;
	}
	return result.rows;
};
exports.addCategory = async (categoryData, parentCategoryId) => {
	const { name, slug } = categoryData;
	const [newCategory] = await db
		.insert(categories)
		.values({
			parentCategoryId: parentCategoryId ?? null,
			name,
			slug,
		})
		.returning();
	return newCategory;
};

exports.deleteCategory = async (categoryId) => {
	const deletedCategory = await db.transaction(async (trx) => {
		const [{ count: categoryCount }] = await trx
			.select({
				count: count(catalogProductCategories.catalogProductId),
			})
			.from(catalogProductCategories)
			.where(eq(catalogProductCategories.categoryId, categoryId))
			.execute();
		if (Number(categoryCount) > 0) {
			const error = new Error(
				"Cannot delete category with associated products.",
			);
			error.statusCode = 400;
			throw error;
		}
		const [deletedCategory] = await trx
			.delete(categories)
			.where(eq(categories.categoryId, categoryId))
			.returning();
		return deletedCategory;
	});
	if (!deletedCategory) {
		const error = new Error("Category not found");
		error.statusCode = 404;
		throw error;
	}
	return deletedCategory;
};

exports.updateCategory = async (categoryData, parentCategoryId) => {
	const { categoryId, name, slug } = categoryData;

	if (parentCategoryId === categoryId) {
		const error = new Error(
			"Parent category cannot be the same as the category being updated.",
		);
		error.statusCode = 400;
		throw error;
	}
	if (parentCategoryId !== null && parentCategoryId !== undefined) {
		const isParent = await db.execute(sql`
        WITH RECURSIVE category_path AS (
            SELECT
                category_id,
                parent_category_id
            FROM categories
            WHERE category_id = ${parentCategoryId}
            UNION ALL
            SELECT
                c.category_id,
                c.parent_category_id
            FROM categories c
            INNER JOIN category_path cp
                ON c.category_id = cp.parent_category_id
            )
            SELECT category_id
            FROM category_path
            WHERE category_id = ${categoryId}
    `);

		if (isParent.rows?.length > 0) {
			const error = new Error(
				"Cannot set a category as a child of its own descendant.",
			);
			error.statusCode = 400;
			throw error;
		}
	}

	const [updatedCategory] = await db
		.update(categories)
		.set({
			parentCategoryId: parentCategoryId ?? null,
			name,
			slug,
		})
		.where(eq(categories.categoryId, categoryId))
		.returning();
	if (!updatedCategory) {
		const error = new Error("Category not found");
		error.statusCode = 404;
		throw error;
	}
	return updatedCategory;
};
