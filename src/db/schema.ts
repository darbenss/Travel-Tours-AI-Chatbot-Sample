import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const seasonEnum = pgEnum("season", [
    "Winter",
    "Spring",
    "Summer",
    "Autumn",
    "AllYear",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
    "pending",
    "confirmed",
    "cancelled",
]);

// Tours Table
export const tours = pgTable("tours", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    destination: text("destination").notNull(),
    price: integer("price").notNull(), // Price in IDR (millions)
    description: text("description").notNull(),
    season: seasonEnum("season").notNull().default("AllYear"),
    tags: text("tags").notNull().default(""), // Comma-separated tags
    highlights: text("highlights").notNull().default(""), // New: Comma or newline separated highlights
    imageUrl: text("image_url"),
    duration: text("duration").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bookings Table
export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    customerName: text("customer_name").notNull(),
    contactInfo: text("contact_info").notNull(), // WhatsApp number
    tourId: integer("tour_id").references(() => tours.id),
    status: bookingStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type exports
export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
