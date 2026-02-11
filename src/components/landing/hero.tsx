
"use client";

import { motion } from "framer-motion";
import { Search, Users, MapPin, Globe, Plane, Hotel, Ship, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
    { id: "tours", label: "Tours", icon: Globe },
    { id: "flights", label: "Flights", icon: Plane },
    { id: "hotels", label: "Hotels", icon: Hotel },
    { id: "cruises", label: "Cruises", icon: Ship },
    { id: "visa", label: "Visa", icon: FileText },
];

export function Hero() {
    const [activeTab, setActiveTab] = useState("tours");

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/670e2382-8fe0-49b8-a8d5-3105891ce913-Vienna.webp"
                    alt="Golden Rama Travel Hero Background - Vienna"
                    className="h-full w-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pt-20 text-center">

                {/* Animated Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 max-w-4xl"
                >
                    <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-7xl drop-shadow-lg">
                        Curating Your Perfect Journey, Since 1971.
                    </h1>
                    <p className="text-lg text-white/90 md:text-xl font-light drop-shadow-md">
                        Experience the world with Indonesia’s most trusted travel partner.
                    </p>
                </motion.div>

                {/* Search Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-4xl rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-2xl"
                >
                    {/* Tabs */}
                    <div className="flex justify-center overflow-x-auto border-b border-white/10 p-2 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all mr-2 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-white text-[#D4AF37] shadow-md transform scale-105"
                                        : "text-white hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-[#D4AF37]" : "text-white")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Inputs */}
                    <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]">

                        <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70 group-focus-within:text-[#D4AF37] transition-colors" />
                            <Input
                                placeholder="Where to next?"
                                className="pl-10 h-14 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-[#D4AF37] focus-visible:border-transparent text-lg"
                            />
                        </div>

                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70 group-focus-within:text-[#D4AF37] transition-colors pointer-events-none" />
                            <Input
                                type="date"
                                className="pl-10 h-14 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-[#D4AF37] focus-visible:border-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>

                        <div className="relative group">
                            <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70 group-focus-within:text-[#D4AF37] transition-colors" />
                            <select className="h-14 w-full rounded-md border border-white/30 bg-white/20 pl-10 pr-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 appearance-none cursor-pointer">
                                <option className="text-gray-900">2 Travelers</option>
                                <option className="text-gray-900">1 Traveler</option>
                                <option className="text-gray-900">3 Travelers</option>
                                <option className="text-gray-900">4+ Travelers</option>
                            </select>
                        </div>

                        <Button size="lg" className="h-14 w-full md:w-auto bg-[#D4AF37] hover:bg-[#b8962e] text-white font-bold px-8 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            Explore Now
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
