import { NextResponse } from "next/server";

/**
 * GET endpoint to fetch all bookings from Python Backend
 */
export async function GET() {
    try {
        // Fetch from Python Backend
        // Use BACKEND_URL env var or default to localhost
        const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${backendUrl}/api/bookings`, {
            cache: 'no-store' // Ensure no caching
        });

        console.log("response");

        if (!response.ok) {
            console.error("Python Backend Error:", response.status, response.statusText);
            return NextResponse.json({ error: "Failed to fetch bookings from backend" }, { status: response.status });
        }

        console.log("response");
        const pythonBookings = await response.json();
        console.log("RAW PYTHON BOOKINGS:", JSON.stringify(pythonBookings, null, 2));

        // Map Python response to Frontend expected format
        const formattedBookings = pythonBookings.map((booking: any) => ({
            id: booking.booking_id,
            customerName: booking.customer_name || "Unknown",
            contactInfo: booking.whatsapp_number,
            tourId: booking.package_id,
            status: booking.status,
            createdAt: booking.created_at,
            numTravelers: booking.num_travelers,
            tourTitle: booking.package_title,
            tourDestination: booking.package_destination,
            tourPrice: booking.package_price,
            totalPrice: booking.total_price,
        }));

        // Return raw data for debugging
        return NextResponse.json({
            debug_python_response: pythonBookings,
            formatted: formattedBookings
        });
    } catch (error) {
        console.error("[GET /api/bookings] Error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
