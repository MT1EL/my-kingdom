CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"accent" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benefits" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blackout_dates" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"reason" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"program_id" text,
	"extra_ids" text DEFAULT '[]' NOT NULL,
	"child_name" text NOT NULL,
	"child_age" integer NOT NULL,
	"children_count" integer NOT NULL,
	"parent_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"notes" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"staff_note" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extras" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" text PRIMARY KEY NOT NULL,
	"src" text NOT NULL,
	"alt" text NOT NULL,
	"category" text NOT NULL,
	"span" text DEFAULT 'normal' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_files" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"content_type" text DEFAULT 'image/webp' NOT NULL,
	"width" integer NOT NULL,
	"bytes" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer,
	"unit" text,
	"tags" text DEFAULT '[]' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opening_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"hours" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"age_min" integer NOT NULL,
	"age_max" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"image" text NOT NULL,
	"highlights" text DEFAULT '[]' NOT NULL,
	"accent" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"weekday" integer NOT NULL,
	"time" text NOT NULL,
	"duration_minutes" integer DEFAULT 120 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_latin" text NOT NULL,
	"tagline" text NOT NULL,
	"city" text NOT NULL,
	"phone" text,
	"phone_display" text,
	"email" text,
	"address" text,
	"address_hint" text NOT NULL,
	"facebook" text,
	"instagram" text,
	"map_query" text NOT NULL,
	"map_is_exact" boolean DEFAULT false NOT NULL,
	"map_zoom" integer DEFAULT 12 NOT NULL,
	"price_note" text NOT NULL,
	"menu_notes" text DEFAULT '[]' NOT NULL,
	"min_lead_days" integer DEFAULT 1 NOT NULL,
	"max_ahead_days" integer DEFAULT 90 NOT NULL,
	"max_children" integer DEFAULT 40 NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"renditions" text DEFAULT '{}' NOT NULL,
	"storage_key" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"uploaded_by" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'moderator' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_sort_idx" ON "activities" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "benefits_sort_idx" ON "benefits" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "blackout_dates_date_idx" ON "blackout_dates" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_reference_idx" ON "bookings" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("date","time");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "extras_sort_idx" ON "extras" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "gallery_categories_sort_idx" ON "gallery_categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "gallery_images_sort_idx" ON "gallery_images" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "image_files_key_idx" ON "image_files" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "menu_categories_sort_idx" ON "menu_categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "menu_items_category_idx" ON "menu_items" USING btree ("category_id","sort_order");--> statement-breakpoint
CREATE INDEX "opening_hours_sort_idx" ON "opening_hours" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "programs_sort_idx" ON "programs" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_slots_weekday_time_idx" ON "schedule_slots" USING btree ("weekday","time");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");