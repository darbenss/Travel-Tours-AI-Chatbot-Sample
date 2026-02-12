
"use client";

import { motion } from "framer-motion";
import { Globe, ShieldCheck, Map, Phone } from "lucide-react";

const features = [
    {
        icon: Globe,
        title: "Expert Guidance",
        description: "Over 50 years of experience crafting perfect itineraries.",
    },
    {
        icon: ShieldCheck,
        title: "Comprehensive Insurance",
        description: "Travel with peace of mind with our trusted protection partners.",
    },
    {
        icon: Phone,
        title: "24/7 Assistance",
        description: "Always there for you, wherever you are in the world.",
    },
];

export function UprevDifference() {
    return (
        <section className="py-24 bg-[#F8F9FA]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 md:text-5xl mb-6">
                        Why Travel with UpRev Tours?
                    </h2>
                    <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="mb-6 p-6 rounded-full bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-[#D4AF37]/30">
                                <feature.icon className="h-10 w-10 text-gray-400 group-hover:text-[#D4AF37] transition-colors duration-500" />
                            </div>
                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 max-w-xs mx-auto leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
