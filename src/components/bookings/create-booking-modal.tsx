"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Package {
    id: string;
    title: string;
    price: number;
}

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateBookingModal({ isOpen, onClose, onSuccess }: CreateBookingModalProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        package_id: "",
        customer_name: "",
        whatsapp_number: "",
        num_travelers: 1,
    });

    // Fetch packages when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPackages();
        }
    }, [isOpen]);

    const fetchPackages = async () => {
        setLoadingPackages(true);
        try {
            const res = await fetch("/api/packages");
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
                // Set default package if available and none selected
                if (data.length > 0 && !formData.package_id) {
                    setFormData(prev => ({ ...prev, package_id: data[0].id }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch packages:", error);
        } finally {
            setLoadingPackages(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    package_id: packages[0]?.id || "",
                    customer_name: "",
                    whatsapp_number: "",
                    num_travelers: 1,
                });
            } else {
                const error = await res.json();
                alert(`Error: ${error.detail || "Failed to create booking"}`);
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Failed to create booking. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Create New Booking</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Package Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tour Package</label>
                                {loadingPackages ? (
                                    <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
                                ) : (
                                    <select
                                        value={formData.package_id}
                                        onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="" disabled>Select a package</option>
                                        {packages.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.title} - IDR {pkg.price.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Customer Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Customer Name</label>
                                <Input
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>

                            {/* WhatsApp Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                                <Input
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    placeholder="e.g. +628123456789"
                                    type="tel"
                                    required
                                />
                                <p className="text-xs text-gray-500">Include country code (e.g. +62)</p>
                            </div>

                            {/* Number of Travelers */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Number of Travelers</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={formData.num_travelers}
                                    onChange={(e) => setFormData({ ...formData, num_travelers: parseInt(e.target.value) || 1 })}
                                    required
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Booking"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
