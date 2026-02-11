
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
    {
        id: 1,
        title: "The Ultimate Guide to Cherry Blossom Season in Japan",
        category: "Travel Guide",
        date: "Feb 10, 2024",
        image: "https://explore-live.s3.eu-west-1.amazonaws.com/medialibraries/explore/blog-images/2019%2008%20august/japan%20country%20spotlight/shutterstock_776445706.jpg?ext=.jpg&width=620&format=webp&quality=80&v=201907171032", // Placeholder
    },
    {
        id: 2,
        title: "Hidden Gems of Swiss Alps: Beyond the Ski Resorts",
        category: "Inspiration",
        date: "Jan 28, 2024",
    },
    {
        id: 3,
        title: "Luxury Travel Trends for 2025",
        category: "Lifestyle",
        date: "Jan 15, 2024",
    },
    {
        id: 4,
        title: "Requirements for Schengen Visa: A Complete Checklist",
        category: "Tips",
        date: "Jan 05, 2024",
    },
];

export function GoldenJournal() {
    const mainArticle = articles[0];
    const sideArticles = articles.slice(1);

    return (
        <section className="py-24 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 md:text-5xl mb-4">
                            Inspiration & Insights.
                        </h2>
                        <p className="text-gray-600 max-w-xl">
                            Stories from around the globe to fuel your wanderlust.
                        </p>
                    </div>
                    <Button variant="link" className="hidden md:flex text-[#D4AF37] hover:text-[#b8962e] font-bold">
                        Read the Journal <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Main Article */}
                    <Link href={`/journal/${mainArticle.id}`} className="group block relative overflow-hidden rounded-2xl shadow-lg">
                        <div className="aspect-[4/3] w-full overflow-hidden">
                            <img
                                src={mainArticle.image}
                                alt={mainArticle.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent">
                            <span className="inline-block px-3 py-1 bg-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider mb-2 rounded-sm">
                                {mainArticle.category}
                            </span>
                            <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2 leading-tight group-hover:underline decoration-[#D4AF37] underline-offset-4">
                                {mainArticle.title}
                            </h3>
                            <p className="text-white/70 text-sm">{mainArticle.date}</p>
                        </div>
                    </Link>

                    {/* Side Articles List */}
                    <div className="flex flex-col justify-center space-y-8">
                        {sideArticles.map((article) => (
                            <Link key={article.id} href={`/journal/${article.id}`} className="group flex flex-col border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                                <span className="text-xs text-[#D4AF37] font-bold uppercase mb-2 group-hover:text-gray-900 transition-colors">
                                    {article.category}
                                </span>
                                <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#D4AF37] transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-gray-500">{article.date}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
