CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'admin');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('paymob');--> statement-breakpoint
CREATE TABLE "profile" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_info" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"national_id" varchar(14) NOT NULL,
	"store_name" varchar(100) NOT NULL,
	"tin" varchar(12) NOT NULL,
	"kyc_status" "kyc_status" DEFAULT 'pending' NOT NULL,
	"bank_iban" varchar(34) NOT NULL,
	"store_logo" varchar(300),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_info_national_id_unique" UNIQUE("national_id"),
	CONSTRAINT "seller_info_store_name_unique" UNIQUE("store_name"),
	CONSTRAINT "seller_info_tin_unique" UNIQUE("tin")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"parent_category_id" bigint,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog_products" (
	"catalog_product_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "catalog_products_catalog_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"category_id" bigint NOT NULL,
	"sku" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"brand" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "seller_listings" (
	"listing_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seller_listings_listing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"seller_id" uuid NOT NULL,
	"catalog_product_id" bigint NOT NULL,
	"inventory" integer NOT NULL,
	"price" bigint NOT NULL,
	"custom_description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_seller_listings_seller_product" UNIQUE("seller_id","catalog_product_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"image_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_images_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"catalog_product_id" bigint NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"image_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listing_images_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"listing_id" bigint NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"cart_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cart_cart_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid,
	"session_token" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_cart_user" UNIQUE("user_id"),
	CONSTRAINT "uq_cart_session_token" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "cart_listing" (
	"cart_listing_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cart_listing_cart_listing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"cart_id" bigint NOT NULL,
	"listing_id" bigint NOT NULL,
	"quantity" smallint NOT NULL,
	CONSTRAINT "uq_cart_listing_cart_listing" UNIQUE("cart_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"address_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addresses_address_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"label" varchar(255),
	"recipient_name" varchar(255) NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"street_line1" varchar(255) NOT NULL,
	"street_line2" varchar(255),
	"city" varchar(255) NOT NULL,
	"state" varchar(255),
	"postal_code" varchar(255),
	"country" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_order_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"total_price" bigint NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_address" (
	"order_address_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_address_order_address_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"order_id" bigint NOT NULL,
	"recipient_name" varchar(255) NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"street_line1" varchar(255) NOT NULL,
	"street_line2" varchar(255),
	"city" varchar(255) NOT NULL,
	"state" varchar(255),
	"postal_code" varchar(255),
	"country" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_order_address_order_id" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "order_seller" (
	"order_seller_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_seller_order_seller_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"order_id" bigint NOT NULL,
	"seller_id" uuid NOT NULL,
	"sub_total" bigint NOT NULL,
	"platform_fee" bigint NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'pending' NOT NULL,
	"tracking_number" varchar(255),
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	CONSTRAINT "uq_order_seller_order_seller" UNIQUE("order_id","seller_id")
);
--> statement-breakpoint
CREATE TABLE "order_listing" (
	"order_listing_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_listing_order_listing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"order_seller_id" bigint NOT NULL,
	"listing_id" bigint NOT NULL,
	"quantity" smallint NOT NULL,
	"historical_unit_price" bigint NOT NULL,
	CONSTRAINT "uq_order_listing_order_seller_listing" UNIQUE("order_seller_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"payment_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"order_id" bigint NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_reference" varchar(255),
	"amount" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'EGP' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_payments_provider_reference" UNIQUE("provider","provider_reference")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"listing_id" bigint NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_reviews_user_listing" UNIQUE("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "review_images" (
	"review_image_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "review_images_review_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"review_id" bigint NOT NULL,
	"image_url" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_likes" (
	"review_like_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "review_likes_review_like_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"review_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_review_likes_review_user" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_info" ADD CONSTRAINT "seller_info_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_parent" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_listings" ADD CONSTRAINT "seller_listings_seller_id_seller_info_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_info"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_listings" ADD CONSTRAINT "seller_listings_catalog_product_id_catalog_products_catalog_product_id_fk" FOREIGN KEY ("catalog_product_id") REFERENCES "public"."catalog_products"("catalog_product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_catalog_product_id_catalog_products_catalog_product_id_fk" FOREIGN KEY ("catalog_product_id") REFERENCES "public"."catalog_products"("catalog_product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_seller_listings_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."seller_listings"("listing_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_listing" ADD CONSTRAINT "cart_listing_cart_id_cart_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("cart_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_listing" ADD CONSTRAINT "cart_listing_listing_id_seller_listings_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."seller_listings"("listing_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_address" ADD CONSTRAINT "order_address_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_seller" ADD CONSTRAINT "order_seller_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_seller" ADD CONSTRAINT "order_seller_seller_id_seller_info_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_info"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_listing" ADD CONSTRAINT "order_listing_order_seller_id_order_seller_order_seller_id_fk" FOREIGN KEY ("order_seller_id") REFERENCES "public"."order_seller"("order_seller_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_listing" ADD CONSTRAINT "order_listing_listing_id_seller_listings_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."seller_listings"("listing_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_seller_listings_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."seller_listings"("listing_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_review_id_reviews_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("review_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_review_id_reviews_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("review_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_parent_category_id" ON "categories" USING btree ("parent_category_id");--> statement-breakpoint
CREATE INDEX "idx_seller_listings_catalog_product_id" ON "seller_listings" USING btree ("catalog_product_id");--> statement-breakpoint
CREATE INDEX "idx_seller_listings_seller_id" ON "seller_listings" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_product_images_catalog_product_id" ON "product_images" USING btree ("catalog_product_id");--> statement-breakpoint
CREATE INDEX "idx_listing_images_listing_id" ON "listing_images" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_cart_listing_listing_id" ON "cart_listing" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_addresses_user_id" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_created_at" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_order_seller_order_id" ON "order_seller" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_seller_seller_id" ON "order_seller" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_order_listing_listing_id" ON "order_listing" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_listing_id" ON "reviews" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_user_id" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_review_images_review_id" ON "review_images" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "idx_review_likes_user_id" ON "review_likes" USING btree ("user_id");