"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { BookingList } from "@/components/bookings/BookingList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || !user.is_admin) {
                router.push("/");
                return;
            }
            fetchBookings();
        }
    }, [user, authLoading, router]);

    const fetchBookings = async () => {
        try {
            const data = await apiRequest("/bookings");
            setBookings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
        )
    }

    if (!user?.is_admin) return null;

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">View all customer bookings</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                </div>

                <BookingList bookings={bookings} isAdmin={true} />
            </div>
        </main>
    );
}
