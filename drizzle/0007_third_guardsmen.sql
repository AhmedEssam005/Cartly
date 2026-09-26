CREATE TABLE "catalog_submissions" (
	"request_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "catalog_submissions_request_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"seller_id" uuid NOT NULL,
	"brand" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"gtin" varchar(14) NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"reviewer_id" uuid,
	"review_comment" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_submissions_gtin_unique" UNIQUE("gtin")
);
--> statement-breakpoint
CREATE TABLE "catalog_submission_images" (
	"image_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "catalog_submission_images_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"image_url" varchar(255) NOT NULL,
	"submission_id" bigint NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog_submissions" ADD CONSTRAINT "catalog_submissions_seller_id_seller_info_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_info"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_submissions" ADD CONSTRAINT "catalog_submissions_reviewer_id_profile_profile_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_submission_images" ADD CONSTRAINT "catalog_submission_images_submission_id_catalog_submissions_request_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."catalog_submissions"("request_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_catalog_submission_images_submission_id" ON "catalog_submission_images" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_catalog_submission_images_submission_primary" ON "catalog_submission_images" USING btree ("submission_id") WHERE "catalog_submission_images"."is_primary" = true;