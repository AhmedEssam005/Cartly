DROP INDEX "idx_addresses_user_id";--> statement-breakpoint
CREATE INDEX "one_default_address_per_user" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_idx_addresses_user_default" ON "addresses" USING btree ("user_id") WHERE "addresses"."is_default" = true;