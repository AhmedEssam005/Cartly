ALTER TABLE "seller_listings" DROP CONSTRAINT "seller_listings_sku_unique";--> statement-breakpoint
ALTER TABLE "seller_listings" ADD CONSTRAINT "uq_seller_listings_sku" UNIQUE("sku","seller_id");