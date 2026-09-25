require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const  db  = require("./index");

const {
	profile,
	sellerInfo,
	categories,
	catalogProducts,
	productImages,
	sellerListings,
	listingImages,
	addresses,
	cart,
	cartListing,
	reviews,
	reviewImages,
	reviewLikes,
} = require("./schema/schema");

const { eq } = require("drizzle-orm");

const supabase = createClient(
	process.env.SUPABASE_API_LINK,
	process.env.SUPABASE_SECRET_KEY,
);

async function createAuthUser(email, password) {
	const { data, error } = await supabase.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
	});

	if (error) {
		throw new Error(`Failed to create ${email}: ${error.message}`);
	}

	return data.user;
}

async function seed() {
	console.log("🌱 Starting database seed...");

	/*
	 * --------------------------------------------------
	 * 1. Create Supabase Auth users
	 * --------------------------------------------------
	 */

	console.log("Creating Auth users...");

	const buyer = await createAuthUser("buyer@cartly.test", "Cartly123!");

	const seller1 = await createAuthUser("seller1@cartly.test", "Cartly123!");

	const seller2 = await createAuthUser("seller2@cartly.test", "Cartly123!");

	const admin = await createAuthUser("admin@cartly.test", "Cartly123!");

	console.log("✓ Auth users created");

	/*
	 * --------------------------------------------------
	 * 2. Profiles
	 * --------------------------------------------------
	 */

	console.log("Creating profiles...");

	await db.insert(profile).values([
		{
			profileId: buyer.id,
			firstName: "Ahmed",
			lastName: "Buyer",
			role: "buyer",
		},
		{
			profileId: seller1.id,
			firstName: "Omar",
			lastName: "Hassan",
			role: "seller",
		},
		{
			profileId: seller2.id,
			firstName: "Youssef",
			lastName: "Ali",
			role: "seller",
		},
		{
			profileId: admin.id,
			firstName: "Cartly",
			lastName: "Admin",
			role: "admin",
		},
	]);

	console.log("✓ Profiles created");

	/*
	 * --------------------------------------------------
	 * 3. Seller information
	 * --------------------------------------------------
	 */

	console.log("Creating sellers...");

	await db.insert(sellerInfo).values([
		{
			userId: seller1.id,
			nationalId: "29001011234567",
			storeName: "Tech House",
			tin: "123456789012",
			kycStatus: "approved",
			bankIban: "EG380019000500000000123456789",
			storeLogo: "https://example.com/tech-house-logo.png",
		},
		{
			userId: seller2.id,
			nationalId: "29102021234567",
			storeName: "Mobile Hub",
			tin: "987654321098",
			kycStatus: "approved",
			bankIban: "EG380019000500000000654321987",
			storeLogo: "https://example.com/mobile-hub-logo.png",
		},
	]);

	console.log("✓ Sellers created");

	console.log("Creating categories...");

	// Parent categories
	const parentCategories = await db
		.insert(categories)
		.values([
			{
				name: "Electronics",
				slug: "electronics",
			},
			{
				name: "Fashion",
				slug: "fashion",
			},
			{
				name: "Home",
				slug: "home",
			},
		])
		.returning();

	const electronicsCategory = parentCategories[0];
	const fashionCategory = parentCategories[1];

	const childCategories = await db
		.insert(categories)
		.values([
			{
				name: "Phones",
				slug: "phones",
				parentCategoryId: electronicsCategory.categoryId,
			},
			{
				name: "Laptops",
				slug: "laptops",
				parentCategoryId: electronicsCategory.categoryId,
			},
			{
				name: "Shoes",
				slug: "shoes",
				parentCategoryId: fashionCategory.categoryId,
			},
		])
		.returning();

	console.log("✓ Categories created");

	/*
	 * --------------------------------------------------
	 * 5. Catalog products
	 * --------------------------------------------------
	 */

	console.log("Creating catalog products...");

	const products = await db
		.insert(catalogProducts)
		.values([
			{
				categoryId: childCategories[0].categoryId,
				sku: "IPHONE-15-128-BLK",
				title: "iPhone 15 128GB",
				description: "Apple iPhone 15 with 128GB storage.",
				brand: "Apple",
			},
			{
				categoryId: childCategories[0].categoryId,
				sku: "S24-256-BLK",
				title: "Samsung Galaxy S24 256GB",
				description: "Samsung Galaxy S24 with 256GB storage.",
				brand: "Samsung",
			},
			{
				categoryId: childCategories[0].categoryId,
				sku: "PIXEL-9-128-BLK",
				title: "Google Pixel 9 128GB",
				description: "Google Pixel 9 with 128GB storage.",
				brand: "Google",
			},
			{
				categoryId: childCategories[1].categoryId,
				sku: "MACBOOK-AIR-M3-256",
				title: "MacBook Air M3 256GB",
				description: "MacBook Air powered by Apple's M3 chip.",
				brand: "Apple",
			},
			{
				categoryId: childCategories[1].categoryId,
				sku: "DELL-XPS-13",
				title: "Dell XPS 13",
				description: "Premium compact Windows laptop.",
				brand: "Dell",
			},
			{
				categoryId: childCategories[2].categoryId,
				sku: "NIKE-AIR-MAX-270-BLK",
				title: "Nike Air Max 270",
				description: "Casual Nike sneakers with Air cushioning.",
				brand: "Nike",
			},
			{
				categoryId: childCategories[2].categoryId,
				sku: "ADIDAS-ULTRABOOST-22",
				title: "Adidas Ultraboost 22",
				description: "Performance running shoes.",
				brand: "Adidas",
			},
		])
		.returning();

	console.log("✓ Products created");

	/*
	 * --------------------------------------------------
	 * 6. Product images
	 * --------------------------------------------------
	 */

	console.log("Creating product images...");

	await db.insert(productImages).values(
		products.map((product, index) => ({
			catalogProductId: product.catalogProductId,
			imageUrl: `https://example.com/products/product-${index + 1}.jpg`,
			isPrimary: true,
			displayOrder: 0,
		})),
	);

	console.log("✓ Product images created");

	/*
	 * --------------------------------------------------
	 * 7. Seller listings
	 * --------------------------------------------------
	 */

	console.log("Creating seller listings...");

	const listings = await db
		.insert(sellerListings)
		.values([
			{
				sellerId: seller1.id,
				catalogProductId: products[0].catalogProductId,
				inventory: 10,
				price: 45000,
				customDescription: "Brand new iPhone 15 with official warranty.",
			},
			{
				sellerId: seller2.id,
				catalogProductId: products[0].catalogProductId,
				inventory: 5,
				price: 44500,
				customDescription: "Sealed iPhone 15 with fast local delivery.",
			},
			{
				sellerId: seller1.id,
				catalogProductId: products[1].catalogProductId,
				inventory: 8,
				price: 39000,
				customDescription: "New Samsung Galaxy S24.",
			},
			{
				sellerId: seller2.id,
				catalogProductId: products[2].catalogProductId,
				inventory: 6,
				price: 32000,
				customDescription: "Google Pixel 9, imported version.",
			},
			{
				sellerId: seller1.id,
				catalogProductId: products[3].catalogProductId,
				inventory: 4,
				price: 65000,
				customDescription: "MacBook Air M3 in excellent condition.",
			},
			{
				sellerId: seller2.id,
				catalogProductId: products[5].catalogProductId,
				inventory: 12,
				price: 7500,
				customDescription: "Original Nike Air Max 270.",
			},
		])
		.returning();

	console.log("✓ Seller listings created");

	/*
	 * --------------------------------------------------
	 * 8. Listing images
	 * --------------------------------------------------
	 */

	console.log("Creating listing images...");

	await db.insert(listingImages).values(
		listings.map((listing, index) => ({
			listingId: listing.listingId,
			imageUrl: `https://example.com/listings/listing-${index + 1}.jpg`,
			isPrimary: true,
			displayOrder: 0,
		})),
	);

	console.log("✓ Listing images created");

	/*
	 * --------------------------------------------------
	 * 9. Addresses
	 * --------------------------------------------------
	 */

	console.log("Creating addresses...");

	const userAddresses = await db
		.insert(addresses)
		.values([
			{
				userId: buyer.id,
				label: "Home",
				recipientName: "Ahmed Buyer",
				phoneNumber: "01000000000",
				streetLine1: "12 Tahrir Street",
				city: "Giza",
				state: "Giza",
				postalCode: "12511",
				country: "Egypt",
				isDefault: true,
			},
			{
				userId: buyer.id,
				label: "Work",
				recipientName: "Ahmed Buyer",
				phoneNumber: "01000000000",
				streetLine1: "25 Nile Street",
				city: "Giza",
				state: "Giza",
				postalCode: "12611",
				country: "Egypt",
				isDefault: false,
			},
		])
		.returning();

	console.log("✓ Addresses created");

	/*
	 * --------------------------------------------------
	 * 10. Cart
	 * --------------------------------------------------
	 */

	console.log("Creating cart...");

	const [buyerCart] = await db
		.insert(cart)
		.values({
			userId: buyer.id,
		})
		.returning();

	await db.insert(cartListing).values([
		{
			cartId: buyerCart.cartId,
			listingId: listings[0].listingId,
			quantity: 1,
		},
		{
			cartId: buyerCart.cartId,
			listingId: listings[2].listingId,
			quantity: 2,
		},
	]);

	console.log("✓ Cart created");

	/*
	 * --------------------------------------------------
	 * 11. Reviews
	 * --------------------------------------------------
	 */

	console.log("Creating reviews...");

	const createdReviews = await db
		.insert(reviews)
		.values([
			{
				userId: buyer.id,
				listingId: listings[0].listingId,
				rating: 5,
				comment: "Fast delivery and the product arrived exactly as described.",
			},
			{
				userId: seller2.id,
				listingId: listings[2].listingId,
				rating: 4,
				comment: "Good product quality and packaging.",
			},
		])
		.returning();

	console.log("✓ Reviews created");

	/*
	 * --------------------------------------------------
	 * 12. Review images
	 * --------------------------------------------------
	 */

	await db.insert(reviewImages).values([
		{
			reviewId: createdReviews[0].reviewId,
			imageUrl: "https://example.com/reviews/iphone-review.jpg",
		},
	]);

	/*
	 * --------------------------------------------------
	 * 13. Review likes
	 * --------------------------------------------------
	 */

	await db.insert(reviewLikes).values([
		{
			reviewId: createdReviews[0].reviewId,
			userId: seller1.id,
		},
		{
			reviewId: createdReviews[0].reviewId,
			userId: seller2.id,
		},
	]);

	console.log("✓ Review images and likes created");

	console.log("🎉 Database seed completed successfully!");
}

seed().catch((error) => {
	console.error("❌ Seed failed:");
	console.error(error);
	process.exit(1);
});
