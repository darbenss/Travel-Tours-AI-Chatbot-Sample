"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { BookingList } from "@/components/bookings/BookingList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            fetchBookings();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchBookings = async () => {
        try {
            const data = await apiRequest("/bookings/me");
            setBookings(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
        )
    }

    if (!user) {
        return (
            <main className="min-h-screen pt-32 pb-12 bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="text-center max-w-md mx-auto">
                    <h2 className="text-3xl font-bold mb-4 font-serif text-gray-900">No Booking Found</h2>
                    <p className="text-gray-600 mb-8 text-lg">It seems you haven't logged in.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button className="w-full sm:w-auto min-w-[120px] bg-[#D4AF37] hover:bg-[#b8962e]">Log In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button variant="outline" className="w-full sm:w-auto min-w-[120px]">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">My Bookings</h1>
                        <p className="text-gray-600 mt-1">Manage your upcoming and past trips</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-md text-red-600">{error}</div>
                ) : (
                    <BookingList bookings={bookings} />
                )}
            </div>
        </main>
    );
}
