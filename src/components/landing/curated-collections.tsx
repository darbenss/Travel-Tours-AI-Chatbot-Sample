
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const collections = [
  {
    id: "group-tours",
    title: "Group Tours",
    description: "Guided adventures with like-minded travelers.",
    image: "https://static.justwravel.com/images/cgnfe1hd/production/087a8e93306854df0388bf2f03109248f791bd7d-938x850.webp?fm=webp", // Placeholder
    link: "/tours",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: "cruises",
    title: "Luxury Cruises",
    description: "Sail the world in unparalleled comfort.",
    image: "https://www.cruisecotterill.com/uploads/2/7/4/0/2740802/iconic-chills_orig.jpg", // Placeholder
    link: "/cruises",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: "attractions",
    title: "Attractions",
    description: "Tickets to world-class entertainment.",
    image: "https://theparkprodigy.com/wp-content/uploads/2021/05/dreamstime_s_148733790-1.jpg", // Placeholder
    link: "/attractions",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: "visa",
    title: "Visa Services",
    description: "Hassle-free document processing.",
    image: "https://www.aviationbusinessme.com/cloud/2023/05/04/ezgif.com-webp-to-jpg-14.jpg", // Placeholder
    link: "/visa",
    className: "md:col-span-2 md:row-span-1",
  },
];

export function CuratedCollections() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-serif font-bold text-gray-900 md:text-4xl mb-4">
            Crafted for Every Type of Traveler
          </h2>
          <p className="text-gray-600 max-w-2xl">
            From guided group expeditions to leisurely cruises, find the travel style that suits you best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          {collections.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className={cn(
                "group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white",
                item.className
              )}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <h3 className="text-2xl font-bold font-serif mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-white/80 mb-4 line-clamp-2 md:line-clamp-none opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                  {item.description}
                </p>
                <div className="flex items-center text-sm font-medium text-[#D4AF37] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-200">
                  View Collection <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
