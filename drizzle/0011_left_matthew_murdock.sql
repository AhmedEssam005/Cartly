CREATE TABLE "catalog_submission_categories" (
	"submission_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	CONSTRAINT "pk_catalog_submission_categories" PRIMARY KEY("submission_id","category_id")
);
--> statement-breakpoint
DROP TABLE "listing_images" CASCADE;--> statement-breakpoint
ALTER TABLE "catalog_submission_categories" ADD CONSTRAINT "catalog_submission_categories_submission_id_catalog_submissions_request_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."catalog_submissions"("request_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_submission_categories" ADD CONSTRAINT "catalog_submission_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_catalog_submission_categories_submission_id" ON "catalog_submission_categories" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_catalog_submission_categories_category_id" ON "catalog_submission_categories" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "seller_listings" DROP COLUMN "custom_description";