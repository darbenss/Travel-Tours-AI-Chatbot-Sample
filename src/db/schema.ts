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

export const messageRoleEnum = pgEnum("message_role", [
    "user",
    "assistant",
    "system",
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

// Conversations Table
export const conversations = pgTable("conversations", {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull().unique(), // From cookie
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Messages Table
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    toolInvocations: text("tool_invocations"), // JSON string of tool calls
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type exports
export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
