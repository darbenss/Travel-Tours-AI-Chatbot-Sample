
"use client";

import { motion } from "framer-motion";

const partners = [
    { name: "Garuda Indonesia", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fe/Garuda_Indonesia_Logo.svg/1280px-Garuda_Indonesia_Logo.svg.png" },
    { name: "Singapore Airlines", logo: "https://brandlogos.net/wp-content/uploads/2021/11/singapore_airlines-brandlogo.net_-512x512.png" },
    { name: "Allianz Travel", logo: "https://www.allianz-travel.com.hk/content/dam/onemarketing/awp/allianz-travel-com-hk/Allianz_Travel_HK_NewHeader.png" },
    { name: "Qatar Airways", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Qatar_Airways_Logo.png" },
    { name: "Emirates", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1280px-Emirates_logo.svg.png" },
    { name: "Four Seasons", logo: "https://1000logos.net/wp-content/uploads/2020/10/Four-Seasons-Logo.png" },
    { name: "Hilton Honors", logo: "https://iconape.com/wp-content/png_logo_vector/hilton-honors-logo.png" },
];

export function TrustPartners() {
    return (
        <section className="bg-white py-12 border-b border-gray-100 overflow-hidden">
            <div className="container mx-auto px-6 mb-8 text-center">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                    Trusted by leading global partners
                </p>
            </div>

            <div className="relative flex w-full overflow-hidden">
                {/* Gradients for smooth fade at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

                {/* Marquee Content - Duplicate for infinite loop */}
                <motion.div
                    className="flex whitespace-nowrap items-center"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30, // Adjust speed
                    }}
                >
                    {[...partners, ...partners].map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}`}
                            className="mx-12 flex items-center justify-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-12 w-auto object-contain max-w-[150px]"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
