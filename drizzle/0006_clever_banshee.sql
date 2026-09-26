CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "catalog_products" RENAME COLUMN "sku" TO "gtin";--> statement-breakpoint
ALTER TABLE "catalog_products" DROP CONSTRAINT "catalog_products_sku_unique";--> statement-breakpoint
ALTER TABLE "seller_listings" ADD COLUMN "sku" varchar(12) NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_catalog_products_gtin" ON "catalog_products" USING btree ("gtin");--> statement-breakpoint
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_gtin_unique" UNIQUE("gtin");--> statement-breakpoint
ALTER TABLE "seller_listings" ADD CONSTRAINT "seller_listings_sku_unique" UNIQUE("sku");