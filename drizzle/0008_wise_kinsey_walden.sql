ALTER TABLE "catalog_submissions" DROP CONSTRAINT "catalog_submissions_gtin_unique";--> statement-breakpoint
ALTER TABLE "catalog_submission_images" DROP CONSTRAINT "catalog_submission_images_submission_id_catalog_submissions_request_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog_products" ALTER COLUMN "gtin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seller_listings" ALTER COLUMN "sku" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "catalog_submissions" ALTER COLUMN "gtin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog_submission_images" ADD CONSTRAINT "catalog_submission_images_submission_id_catalog_submissions_request_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."catalog_submissions"("request_id") ON DELETE cascade ON UPDATE no action;