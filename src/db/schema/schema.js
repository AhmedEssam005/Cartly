const {
	pgTable,
	pgEnum,
	bigint,
	uuid,
	varchar,
	text,
	integer,
	smallint,
	boolean,
	timestamp,
	index,
	unique,
	foreignKey,
	check,
	uniqueIndex,
	primaryKey,
} = require("drizzle-orm/pg-core");
const { sql } = require("drizzle-orm");

const {
	userRole,
	kycStatus,
	orderStatus,
	fulfillmentStatus,
	paymentStatus,
	paymentProvider,
	requestStatus,
} = require("./enums");

const { authUsers } = require("drizzle-orm/supabase");

const profile = pgTable("profile", {
	profileId: uuid("profile_id")
		.primaryKey()
		.references(() => authUsers.id, {
			onDelete: "cascade",
		}),

	firstName: varchar("first_name", {
		length: 50,
	}).notNull(),

	lastName: varchar("last_name", {
		length: 50,
	}).notNull(),

	role: userRole("role").notNull().default("buyer"),

	isDeleted: boolean("is_deleted").notNull().default(false),

	createdAt: timestamp("created_at", {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),

	updatedAt: timestamp("updated_at", {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

const sellerInfo = pgTable("seller_info", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => profile.profileId, {
			onDelete: "no action",
		}),

	nationalId: varchar("national_id", {
		length: 14,
	})
		.notNull()
		.unique(),

	storeName: varchar("store_name", {
		length: 100,
	})
		.notNull()
		.unique(),

	tin: varchar("tin", {
		length: 12,
	})
		.notNull()
		.unique(),

	kycStatus: kycStatus("kyc_status").notNull().default("pending"),

	bankIban: varchar("bank_iban", {
		length: 34,
	}).notNull(),

	storeLogo: varchar("store_logo", {
		length: 300,
	}),

	createdAt: timestamp("created_at", {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),

	updatedAt: timestamp("updated_at", {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

const categories = pgTable(
	"categories",
	{
		categoryId: bigint("category_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		parentCategoryId: bigint("parent_category_id", {
			mode: "number",
		}),

		name: varchar("name", {
			length: 255,
		}).notNull(),

		slug: varchar("slug", {
			length: 255,
		})
			.notNull()
			.unique(),
	},
	(table) => [
		foreignKey({
			columns: [table.parentCategoryId],
			foreignColumns: [table.categoryId],
			onDelete: "set null",
			name: "fk_categories_parent",
		}),

		index("idx_categories_parent_category_id").on(table.parentCategoryId),
	],
);

const catalogProducts = pgTable(
	"catalog_products",
	{
		catalogProductId: bigint("catalog_product_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		gtin: varchar("gtin", {
			length: 14,
		}).unique(),

		title: varchar("title", {
			length: 255,
		}).notNull(),

		description: text("description").notNull(),

		isHidden: boolean("is_hidden").notNull().default(false),

		brand: varchar("brand", {
			length: 255,
		}).notNull(),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [index("idx_catalog_products_gtin").on(table.gtin)],
);

const catalogSubmissions = pgTable("catalog_submissions", {
	submissionId: bigint("request_id", {
		mode: "number",
	})
		.generatedAlwaysAsIdentity()
		.primaryKey(),

	sellerId: uuid("seller_id")
		.notNull()
		.references(() => sellerInfo.userId),

	brand: varchar("brand", {
		length: 255,
	}).notNull(),

	title: varchar("title", {
		length: 255,
	}).notNull(),

	description: text("description").notNull(),

	gtin: varchar("gtin", {
		length: 14,
	}),
	status: requestStatus("status").notNull().default("pending"),

	reviewerBy: uuid("reviewer_id").references(() => profile.profileId),
	reviewComment: text("review_comment"),
	reviewedAt: timestamp("reviewed_at", {
		withTimezone: true,
	}),
	createdAt: timestamp("created_at", {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
});

const catalogSubmissionsImages = pgTable(
	"catalog_submission_images",
	{
		imageId: bigint("image_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),
		imageUrl: varchar("image_url", {
			length: 255,
		}).notNull(),
		submissionId: bigint("submission_id", {
			mode: "number",
		})
			.notNull()
			.references(() => catalogSubmissions.submissionId, {
				onDelete: "cascade",
			}),
		displayOrder: smallint("display_order").notNull().default(0),
		isPrimary: boolean("is_primary").notNull().default(false),
	},
	(table) => [
		index("idx_catalog_submission_images_submission_id").on(table.submissionId),
		uniqueIndex("uq_catalog_submission_images_submission_primary")
			.on(table.submissionId)
			.where(sql`${table.isPrimary} = true`),
	],
);

const catalogProductCategories = pgTable(
	"catalog_product_categories",
	{
		catalogProductId: bigint("catalog_product_id", {
			mode: "number",
		})
			.notNull()
			.references(() => catalogProducts.catalogProductId, {
				onDelete: "cascade",
			}),
		categoryId: bigint("category_id", {
			mode: "number",
		})
			.notNull()
			.references(() => categories.categoryId),
	},
	(table) => [
		primaryKey({
			name: "pk_catalog_product_categories",
			columns: [table.catalogProductId, table.categoryId],
		}),
		index("idx_catalog_product_categories_catalogId").on(
			table.catalogProductId,
		),
		index("idx_catalog_product_categories_categoryId").on(table.categoryId),
	],
);

const sellerListings = pgTable(
	"seller_listings",
	{
		listingId: bigint("listing_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		sku: varchar("sku", {
			length: 64,
		}).notNull(),
		sellerId: uuid("seller_id")
			.notNull()
			.references(() => sellerInfo.userId),

		catalogProductId: bigint("catalog_product_id", {
			mode: "number",
		})
			.notNull()
			.references(() => catalogProducts.catalogProductId),

		inventory: integer("inventory").notNull(),

		price: bigint("price", {
			mode: "number",
		}).notNull(),

		customDescription: text("custom_description").notNull(),

		isActive: boolean("is_active").notNull().default(true),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),

		updatedAt: timestamp("updated_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("uq_seller_listings_seller_product").on(
			table.sellerId,
			table.catalogProductId,
		),
		unique("uq_seller_listings_sku").on(table.sku, table.sellerId),
		index("idx_seller_listings_catalog_product_id").on(table.catalogProductId),

		index("idx_seller_listings_seller_id").on(table.sellerId),
		check(
			"chk_seller_listings_inventory_nonnegative",
			sql`${table.inventory} >= 0`,
		),
		check("chk_seller_listings_price_nonnegative", sql`${table.price} >= 0`),
	],
);

const productImages = pgTable(
	"product_images",
	{
		imageId: bigint("image_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		catalogProductId: bigint("catalog_product_id", {
			mode: "number",
		})
			.notNull()
			.references(() => catalogProducts.catalogProductId),

		imageUrl: varchar("image_url", {
			length: 255,
		}).notNull(),

		isPrimary: boolean("is_primary").notNull().default(false),

		displayOrder: smallint("display_order").notNull().default(0),
	},
	(table) => [
		index("idx_product_images_catalog_product_id").on(table.catalogProductId),
	],
);

const listingImages = pgTable(
	"listing_images",
	{
		imageId: bigint("image_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		listingId: bigint("listing_id", {
			mode: "number",
		})
			.notNull()
			.references(() => sellerListings.listingId),

		imageUrl: varchar("image_url", {
			length: 255,
		}).notNull(),

		isPrimary: boolean("is_primary").notNull().default(false),

		displayOrder: smallint("display_order").notNull().default(0),
	},
	(table) => [index("idx_listing_images_listing_id").on(table.listingId)],
);

const cart = pgTable(
	"cart",
	{
		cartId: bigint("cart_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		userId: uuid("user_id").references(() => profile.profileId),

		sessionToken: varchar("session_token", {
			length: 255,
		}),

		updatedAt: timestamp("updated_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("uq_cart_user").on(table.userId),
		unique("uq_cart_session_token").on(table.sessionToken),
		check(
			"chk_cart_owner",
			sql`(
    (${table.userId} IS NOT NULL AND ${table.sessionToken} IS NULL)
    OR
    (${table.userId} IS NULL AND ${table.sessionToken} IS NOT NULL)
  )`,
		),
	],
);

const cartListing = pgTable(
	"cart_listing",
	{
		cartListingId: bigint("cart_listing_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		cartId: bigint("cart_id", {
			mode: "number",
		})
			.notNull()
			.references(() => cart.cartId),

		listingId: bigint("listing_id", {
			mode: "number",
		})
			.notNull()
			.references(() => sellerListings.listingId),

		quantity: smallint("quantity").notNull(),
	},
	(table) => [
		unique("uq_cart_listing_cart_listing").on(table.cartId, table.listingId),

		index("idx_cart_listing_listing_id").on(table.listingId),
		check("chk_cart_listing_quantity_positive", sql`${table.quantity} > 0`),
	],
);

const addresses = pgTable(
	"addresses",
	{
		addressId: bigint("address_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		userId: uuid("user_id")
			.notNull()
			.references(() => profile.profileId),

		label: varchar("label", {
			length: 255,
		}),

		recipientName: varchar("recipient_name", {
			length: 255,
		}).notNull(),

		phoneNumber: varchar("phone_number", {
			length: 255,
		}).notNull(),

		streetLine1: varchar("street_line1", {
			length: 255,
		}).notNull(),

		streetLine2: varchar("street_line2", {
			length: 255,
		}),

		city: varchar("city", {
			length: 255,
		}).notNull(),

		state: varchar("state", {
			length: 255,
		}),

		postalCode: varchar("postal_code", {
			length: 255,
		}),

		country: varchar("country", {
			length: 255,
		}).notNull(),

		isDefault: boolean("is_default").notNull().default(false),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("idx_addresses_user_id").on(table.userId),
		uniqueIndex("uq_idx_addresses_user_default")
			.on(table.userId)
			.where(sql`${table.isDefault} = true`),
	],
);

const orders = pgTable(
	"orders",
	{
		orderId: bigint("order_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		userId: uuid("user_id")
			.notNull()
			.references(() => profile.profileId),

		totalPrice: bigint("total_price", {
			mode: "number",
		}).notNull(),

		status: orderStatus("status").notNull().default("pending"),

		orderedAt: timestamp("ordered_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),

		updatedAt: timestamp("updated_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("idx_orders_user_created_at").on(table.userId, table.createdAt),
		check("chk_orders_total_price_nonnegative", sql`${table.totalPrice} >= 0`),
	],
);

const orderAddress = pgTable(
	"order_address",
	{
		orderAddressId: bigint("order_address_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		orderId: bigint("order_id", {
			mode: "number",
		})
			.notNull()
			.references(() => orders.orderId),

		recipientName: varchar("recipient_name", {
			length: 255,
		}).notNull(),

		phoneNumber: varchar("phone_number", {
			length: 255,
		}).notNull(),

		streetLine1: varchar("street_line1", {
			length: 255,
		}).notNull(),

		streetLine2: varchar("street_line2", {
			length: 255,
		}),

		city: varchar("city", {
			length: 255,
		}).notNull(),

		state: varchar("state", {
			length: 255,
		}),

		postalCode: varchar("postal_code", {
			length: 255,
		}),

		country: varchar("country", {
			length: 255,
		}).notNull(),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [unique("uq_order_address_order_id").on(table.orderId)],
);

const orderSeller = pgTable(
	"order_seller",
	{
		orderSellerId: bigint("order_seller_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		orderId: bigint("order_id", {
			mode: "number",
		})
			.notNull()
			.references(() => orders.orderId),

		sellerId: uuid("seller_id")
			.notNull()
			.references(() => sellerInfo.userId),

		subTotal: bigint("sub_total", {
			mode: "number",
		}).notNull(),

		platformFee: bigint("platform_fee", {
			mode: "number",
		}).notNull(),

		fulfillmentStatus: fulfillmentStatus("fulfillment_status")
			.notNull()
			.default("pending"),

		trackingNumber: varchar("tracking_number", {
			length: 255,
		}),

		shippedAt: timestamp("shipped_at", {
			withTimezone: true,
		}),

		deliveredAt: timestamp("delivered_at", {
			withTimezone: true,
		}),
	},
	(table) => [
		unique("uq_order_seller_order_seller").on(table.orderId, table.sellerId),

		index("idx_order_seller_order_id").on(table.orderId),

		index("idx_order_seller_seller_id").on(table.sellerId),
		check("chk_order_seller_subtotal_nonnegative", sql`${table.subTotal} >= 0`),

		check(
			"chk_order_seller_platform_fee_nonnegative",
			sql`${table.platformFee} >= 0`,
		),
	],
);

const orderListing = pgTable(
	"order_listing",
	{
		orderListingId: bigint("order_listing_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		orderSellerId: bigint("order_seller_id", {
			mode: "number",
		})
			.notNull()
			.references(() => orderSeller.orderSellerId),

		listingId: bigint("listing_id", {
			mode: "number",
		})
			.notNull()
			.references(() => sellerListings.listingId),

		quantity: smallint("quantity").notNull(),

		historicalUnitPrice: bigint("historical_unit_price", {
			mode: "number",
		}).notNull(),
	},
	(table) => [
		unique("uq_order_listing_order_seller_listing").on(
			table.orderSellerId,
			table.listingId,
		),

		index("idx_order_listing_listing_id").on(table.listingId),
		check("chk_order_listing_quantity_positive", sql`${table.quantity} > 0`),

		check(
			"chk_order_listing_price_nonnegative",
			sql`${table.historicalUnitPrice} >= 0`,
		),
	],
);

const payments = pgTable(
	"payments",
	{
		paymentId: bigint("payment_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		orderId: bigint("order_id", {
			mode: "number",
		})
			.notNull()
			.references(() => orders.orderId),

		provider: paymentProvider("provider").notNull(),

		providerReference: varchar("provider_reference", {
			length: 255,
		}),

		amount: bigint("amount", {
			mode: "number",
		}).notNull(),

		currency: varchar("currency", {
			length: 10,
		})
			.notNull()
			.default("EGP"),

		status: paymentStatus("status").notNull().default("pending"),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("uq_payments_provider_reference").on(
			table.provider,
			table.providerReference,
		),

		index("idx_payments_order_id").on(table.orderId),
		check("chk_payments_amount_nonnegative", sql`${table.amount} >= 0`),
	],
);

const reviews = pgTable(
	"reviews",
	{
		reviewId: bigint("review_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		userId: uuid("user_id")
			.notNull()
			.references(() => profile.profileId),

		listingId: bigint("listing_id", {
			mode: "number",
		})
			.notNull()
			.references(() => sellerListings.listingId),

		rating: smallint("rating").notNull(),

		comment: text("comment").notNull(),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),

		updatedAt: timestamp("updated_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("uq_reviews_user_listing").on(table.userId, table.listingId),

		index("idx_reviews_listing_id").on(table.listingId),

		index("idx_reviews_user_id").on(table.userId),
		check("chk_reviews_rating", sql`${table.rating} BETWEEN 1 AND 5`),
	],
);

const reviewImages = pgTable(
	"review_images",
	{
		reviewImageId: bigint("review_image_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		reviewId: bigint("review_id", {
			mode: "number",
		})
			.notNull()
			.references(() => reviews.reviewId),

		imageUrl: varchar("image_url", {
			length: 255,
		}).notNull(),
	},
	(table) => [index("idx_review_images_review_id").on(table.reviewId)],
);

const reviewLikes = pgTable(
	"review_likes",
	{
		reviewLikeId: bigint("review_like_id", {
			mode: "number",
		})
			.generatedAlwaysAsIdentity()
			.primaryKey(),

		reviewId: bigint("review_id", {
			mode: "number",
		})
			.notNull()
			.references(() => reviews.reviewId),

		userId: uuid("user_id")
			.notNull()
			.references(() => profile.profileId),

		createdAt: timestamp("created_at", {
			withTimezone: true,
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique("uq_review_likes_review_user").on(table.reviewId, table.userId),

		index("idx_review_likes_user_id").on(table.userId),
	],
);

module.exports = {
	profile,
	sellerInfo,
	categories,
	catalogProducts,
	sellerListings,
	productImages,
	listingImages,
	cart,
	cartListing,
	addresses,
	orders,
	orderAddress,
	orderSeller,
	orderListing,
	payments,
	reviews,
	reviewImages,
	reviewLikes,
	catalogProductCategories,
	catalogSubmissions,
	catalogSubmissionsImages,
};
