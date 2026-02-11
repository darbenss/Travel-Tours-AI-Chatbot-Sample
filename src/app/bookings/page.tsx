"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Phone, MapPin, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Booking {
    id: number;
    customerName: string;
    contactInfo: string;
    tourId: number | null;
    status: "pending" | "confirmed" | "cancelled";
    createdAt: string;
    tourTitle: string | null;
    tourDestination: string | null;
    tourPrice: number | null;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        // Fetch bookings from API
        fetch("/api/bookings")
            .then((res) => res.json())
            .then((data) => {
                setBookings(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load bookings:", err);
                setLoading(false);
            });
    }, []);

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch = booking.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case "confirmed":
                return "✅";
            case "cancelled":
                return "❌";
            default:
                return "⏳";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        📋 Bookings Management
                    </h1>
                    <p className="text-gray-600">
                        Manage and view all customer bookings
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow-sm p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search by customer name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {["all", "pending", "confirmed", "cancelled"].map((status) => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(status)}
                                    className={
                                        statusFilter === status
                                            ? "bg-[#D4AF37] hover:bg-[#b8962e]"
                                            : ""
                                    }
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                            ))}
                        </div>

                        {/* Total Count */}
                        <div className="text-sm text-gray-600 font-medium">
                            Total: {filteredBookings.length} bookings
                        </div>
                    </div>
                </motion.div>

                {/* Bookings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                        <p className="mt-4 text-gray-600">Loading bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600">No bookings found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredBookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                                    {/* Booking ID & Status */}
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Booking ID
                                        </div>
                                        <div className="font-bold text-gray-900 mb-2">
                                            #{booking.id}
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                booking.status
                                            )}`}
                                        >
                                            {getStatusEmoji(booking.status)} {booking.status}
                                        </span>
                                    </div>

                                    {/* Customer Info */}
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Customer
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            {booking.customerName}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <Phone className="h-3 w-3" />
                                            {booking.contactInfo}
                                        </div>
                                    </div>

                                    {/* Tour Info */}
                                    <div className="md:col-span-2">
                                        <div className="text-xs text-gray-500 mb-1">Tour</div>
                                        {booking.tourTitle ? (
                                            <>
                                                <div className="font-semibold text-gray-900">
                                                    {booking.tourTitle}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {booking.tourDestination}
                                                </div>
                                                <div className="text-sm text-[#D4AF37] font-bold mt-1">
                                                    IDR{" "}
                                                    {(booking.tourPrice! / 1000000).toFixed(1)}M
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic">
                                                No tour selected
                                            </div>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Created
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-900">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(booking.createdAt).toLocaleDateString(
                                                "id-ID",
                                                {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                }
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(booking.createdAt).toLocaleTimeString(
                                                "id-ID",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
