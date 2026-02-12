import { NextResponse } from "next/server";

/**
 * GET endpoint to fetch all bookings from Python Backend
 */
export async function GET() {
    try {
        // Fetch from Python Backend
        // Use 127.0.0.1 for localhost
        const response = await fetch("http://127.0.0.1:8000/api/bookings", {
            cache: 'no-store' // Ensure no caching
        });

        if (!response.ok) {
            console.error("Python Backend Error:", response.status, response.statusText);
            return NextResponse.json({ error: "Failed to fetch bookings from backend" }, { status: response.status });
        }

        const pythonBookings = await response.json();

        // Map Python response to Frontend expected format
        const formattedBookings = pythonBookings.map((booking: any) => ({
            id: booking.booking_id,
            customerName: booking.customer_name,
            contactInfo: booking.whatsapp_number,
            tourId: booking.package_id,
            status: booking.status,
            createdAt: booking.created_at,
            numTravelers: booking.num_travelers,
            tourTitle: booking.package_title,
            tourDestination: booking.package_destination,
            tourPrice: booking.package_price,
        }));

        return NextResponse.json(formattedBookings);
    } catch (error) {
        console.error("[GET /api/bookings] Error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
