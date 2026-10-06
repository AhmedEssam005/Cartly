ALTER TABLE "seller_listings" ADD CONSTRAINT "chk_seller_listings_inventory_nonnegative" CHECK ("seller_listings"."inventory" >= 0);--> statement-breakpoint
ALTER TABLE "seller_listings" ADD CONSTRAINT "chk_seller_listings_price_nonnegative" CHECK ("seller_listings"."price" >= 0);--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "chk_cart_owner" CHECK ((
    ("cart"."user_id" IS NOT NULL AND "cart"."session_token" IS NULL)
    OR
    ("cart"."user_id" IS NULL AND "cart"."session_token" IS NOT NULL)
  ));--> statement-breakpoint
ALTER TABLE "cart_listing" ADD CONSTRAINT "chk_cart_listing_quantity_positive" CHECK ("cart_listing"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "chk_orders_total_price_nonnegative" CHECK ("orders"."total_price" >= 0);--> statement-breakpoint
ALTER TABLE "order_seller" ADD CONSTRAINT "chk_order_seller_subtotal_nonnegative" CHECK ("order_seller"."sub_total" >= 0);--> statement-breakpoint
ALTER TABLE "order_seller" ADD CONSTRAINT "chk_order_seller_platform_fee_nonnegative" CHECK ("order_seller"."platform_fee" >= 0);--> statement-breakpoint
ALTER TABLE "order_listing" ADD CONSTRAINT "chk_order_listing_quantity_positive" CHECK ("order_listing"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "order_listing" ADD CONSTRAINT "chk_order_listing_price_nonnegative" CHECK ("order_listing"."historical_unit_price" >= 0);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "chk_payments_amount_nonnegative" CHECK ("payments"."amount" >= 0);--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "chk_reviews_rating" CHECK ("reviews"."rating" BETWEEN 1 AND 5);