
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
    {
        id: 1,
        author: "Budi & Keluarga",
        location: "Europe Tour 2024",
        quote: "Perjalanan ke Eropa sangat terorganisir. Tour leadernya sangat membantu dan ramah!",
        image: "https://images.squarespace-cdn.com/content/v1/61eee5dbbfeabd6491d05edc/1656590318255-OVC0M84ZEPLNPGFW17AE/Murano+Gelato+Break",
    },
    {
        id: 2,
        author: "Sarah Jenkins",
        location: "Bali Escapade 2023",
        quote: "Golden Rama curated the perfect honeymoon. Every hotel was a dream come true.",
        image: "https://static.saltinourhair.com/wp-content/uploads/2023/02/09142316/sidemen-bali-17.jpg", // Placeholder
    },
    {
        id: 3,
        author: "Michael & Team",
        location: "Japan Corporate Retreat",
        quote: "Seamless logistics for our group of 50. The best corporate trip we've ever had.",
        image: "https://canny.io/blog/wp-content/smush-webp/2023/07/IMG_1561.jpg.webp", // Placeholder
    },
];

export function TravelerStories() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const activeTestimonial = testimonials[currentIndex];

    return (
        <section className="pt-24 pb-48 bg-white overflow-hidden relative">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">

                    {/* Stacked Cards Animation */}
                    <div className="relative w-full max-w-md mx-auto md:mx-0 h-[500px] flex items-center justify-center">
                        <AnimatePresence mode="popLayout">
                            {testimonials.map((item, index) => {
                                // Calculate relative index to create stack effect
                                const offset = (index - currentIndex + testimonials.length) % testimonials.length;
                                // Only show first 3 items in stack logic for performance/visual
                                if (offset > 2) return null;

                                const isFront = offset === 0;

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ scale: 0.9, opacity: 0, x: 50 }}
                                        animate={{
                                            scale: 1 - offset * 0.05,
                                            opacity: 1 - offset * 0.2,
                                            x: offset * 20,
                                            zIndex: 10 - offset,
                                            rotate: isFront ? -3 : (offset % 2 === 0 ? 3 : -1)
                                        }}
                                        exit={{ x: -100, opacity: 0, rotate: -20, transition: { duration: 0.4 } }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute top-0 w-full cursor-pointer"
                                        onClick={handleNext}
                                        style={{
                                            top: offset * 10,
                                            filter: isFront ? "none" : "grayscale(100%) blur(1px)",
                                        }}
                                    >
                                        <div className="relative bg-white p-4 pb-16 shadow-2xl border border-gray-100 transform transition-transform hover:scale-[1.02]">
                                            <div className="aspect-[4/5] bg-gray-200 overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.author}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute bottom-6 left-0 right-0 text-center font-handwriting text-gray-600 text-lg font-medium">
                                                {item.location}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Background Accent strictly behind first card area */}
                        <div className="absolute top-4 left-4 right-4 bottom-4 bg-[#D4AF37] transform rotate-3 scale-[0.9] z-[-1] opacity-10 rounded-3xl" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left z-10">
                        <Quote className="h-12 w-12 text-[#D4AF37]/20 mx-auto md:mx-0 mb-6" />
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                            Memories Made <br /> With Us.
                        </h2>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTestimonial.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <blockquote className="text-xl md:text-2xl text-gray-600 italic font-light mb-8 max-w-2xl min-h-[100px]">
                                    "{activeTestimonial.quote}"
                                </blockquote>
                                <div className="font-bold text-gray-900 text-lg">
                                    — {activeTestimonial.author}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-4 mt-8 justify-center md:justify-start">
                            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full hover:bg-[#D4AF37] hover:text-white transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full hover:bg-[#D4AF37] hover:text-white transition-colors">
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="mt-4 text-xs text-gray-400">Click photo to view next story</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
