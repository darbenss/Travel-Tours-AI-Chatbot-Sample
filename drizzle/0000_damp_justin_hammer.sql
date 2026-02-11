CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."season" AS ENUM('Winter', 'Spring', 'Summer', 'Autumn', 'AllYear');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"contact_info" text NOT NULL,
	"tour_id" integer,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"destination" text NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"season" "season" DEFAULT 'AllYear' NOT NULL,
	"tags" text DEFAULT '' NOT NULL,
	"highlights" text DEFAULT '' NOT NULL,
	"image_url" text,
	"duration" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;