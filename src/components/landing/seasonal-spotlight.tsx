
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const spotlights = [
    {
        id: 1,
        title: "Enchanting Swiss Alps",
        price: "IDR 25.9M",
        rating: 4.9,
        image: "https://media.istockphoto.com/id/1351540765/photo/lake-oeschinensee-in-switzerland.webp?b=1&s=612x612&w=0&k=20&c=I7VV8TW7K26epg10s1KmFE21defe80KWZFf3jEQybJc=", // Placeholder
        duration: "10 Days",
    },
    {
        id: 2,
        title: "Kyoto Cherry Blossom",
        price: "IDR 18.5M",
        rating: 4.8,
        image: "https://img.cooljapan-videos.com/files/articles/g5xby6tl/thumbnail/2438f8238579fc4d09643de6c3f4a5c223df0e01.jpg.webp", // Placeholder
        duration: "7 Days",
    },
    {
        id: 3,
        title: "Maldives Paradise",
        price: "IDR 32.0M",
        rating: 5.0,
        image: "https://untoday.org/wp-content/uploads/2025/03/15_LEISURE-1.webp", // Placeholder
        duration: "5 Days",
    },
    {
        id: 4,
        title: "European Grand Tour",
        price: "IDR 45.0M",
        rating: 4.9,
        image: "https://offloadmedia.feverup.com/secretldn.com/wp-content/uploads/2024/04/12170313/london-best-city-europe-simone-ami-shutterstock.jpg", // Placeholder
        duration: "14 Days",
    },
];

export function SeasonalSpotlight() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 400; // Approx card width
            if (direction === "left") {
                current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 md:text-5xl mb-4">
                            This Season’s Masterpieces.
                        </h2>
                        <p className="text-gray-600 max-w-xl text-lg">
                            Handpicked destinations curated for the discerning traveler.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-6 md:mt-0">
                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => scroll("left")}
                                className="border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-white rounded-full transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => scroll("right")}
                                className="border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-white rounded-full transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <Button variant="outline" className="hidden md:flex border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                            View All Offers <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Carousel Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {spotlights.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -10 }}
                            className="min-w-[85vw] md:min-w-[350px] lg:min-w-[400px] snap-center rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden group cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-sm">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                    <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">{item.duration} • All Inclusive</p>

                                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wide">Starts from</span>
                                        <span className="text-xl font-bold text-[#D4AF37]">{item.price}</span>
                                    </div>
                                    <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#D4AF37] text-white">
                                        Details
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center md:hidden">
                    <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                        View All Offers
                    </Button>
                </div>
            </div>
        </section>
    );
}
