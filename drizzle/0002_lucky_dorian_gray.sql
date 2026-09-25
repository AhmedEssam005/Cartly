ALTER TABLE "seller_info" DROP CONSTRAINT "seller_info_user_id_profile_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "seller_info" ADD CONSTRAINT "seller_info_user_id_profile_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("profile_id") ON DELETE no action ON UPDATE no action;