"use client";

import { format } from "date-fns";
import { Calendar, MapPin, Users, DollarSign, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Booking = {
    booking_id: string;
    package_title: string;
    package_destination: string;
    status: string;
    created_at: string;
    num_travelers: number;
    total_price: number;
    whatsapp_link: string;
    customer_name: string; // Useful for admin
};

interface BookingListProps {
    bookings: Booking[];
    isAdmin?: boolean;
}

export function BookingList({ bookings, isAdmin = false }: BookingListProps) {
    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No bookings found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <div
                    key={booking.booking_id}
                    className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : booking.status === "CONFIRMED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {booking.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                    ID: {booking.booking_id.slice(0, 8)}...
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {booking.package_title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.package_destination}</span>
                            </div>

                            {isAdmin && (
                                <div className="text-sm text-blue-600 font-medium mt-1">
                                    Customer: {booking.customer_name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 min-w-[200px]">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Booked on {format(new Date(booking.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{booking.num_travelers} Travelers</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <DollarSign className="h-4 w-4" />
                                <span>IDR {booking.total_price?.toLocaleString()}</span>
                            </div>

                            {booking.whatsapp_link && (
                                <a href={booking.whatsapp_link} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Open in WhatsApp
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
