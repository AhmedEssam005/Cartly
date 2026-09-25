CREATE TABLE "catalog_product_categories" (
	"catalog_product_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	CONSTRAINT "pk_catalog_product_categories" PRIMARY KEY("catalog_product_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "catalog_products" DROP CONSTRAINT "catalog_products_category_id_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog_product_categories" ADD CONSTRAINT "catalog_product_categories_catalog_product_id_catalog_products_catalog_product_id_fk" FOREIGN KEY ("catalog_product_id") REFERENCES "public"."catalog_products"("catalog_product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_product_categories" ADD CONSTRAINT "catalog_product_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_catalog_product_categories_catalogId" ON "catalog_product_categories" USING btree ("catalog_product_id");--> statement-breakpoint
CREATE INDEX "idx_catalog_product_categories_categoryId" ON "catalog_product_categories" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "catalog_products" DROP COLUMN "category_id";