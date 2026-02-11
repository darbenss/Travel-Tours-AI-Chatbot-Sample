import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, tours } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET endpoint to fetch all bookings with tour details
 */
export async function GET() {
    try {
        // Fetch bookings with tour information using LEFT JOIN
        const allBookings = await db
            .select({
                id: bookings.id,
                customerName: bookings.customerName,
                contactInfo: bookings.contactInfo,
                tourId: bookings.tourId,
                status: bookings.status,
                createdAt: bookings.createdAt,
                tourTitle: tours.title,
                tourDestination: tours.destination,
                tourPrice: tours.price,
            })
            .from(bookings)
            .leftJoin(tours, eq(bookings.tourId, tours.id))
            .orderBy(desc(bookings.createdAt));

        return NextResponse.json(allBookings);
    } catch (error) {
        console.error("[GET /api/bookings] Error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
