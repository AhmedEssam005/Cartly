ALTER TYPE "public"."payment_provider" ADD VALUE 'manual';--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "chk_orders_total_price_nonnegative";--> statement-breakpoint
ALTER TABLE "cart_listing" DROP CONSTRAINT "cart_listing_cart_id_cart_cart_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "comment" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_listing" ADD CONSTRAINT "cart_listing_cart_id_cart_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("cart_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "total_price";