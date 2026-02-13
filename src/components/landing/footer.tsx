
"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="bg-[#002147] text-white pt-24 pb-12 overflow-hidden border-t-8 border-[#D4AF37]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="flex flex-col space-y-6">
                        <Link href="/" className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <span className="text-white">UPREV</span>
                            <span className="text-[#D4AF37]">DEMO</span>
                        </Link>
                        <p className="text-gray-300 leading-relaxed max-w-xs">
                            Your trusted partner in exploring the world with elegance and ease since 1971.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-[#D4AF37] transition-colors">
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Explore</h3>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Destinations</Link>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Cruises</Link>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Group Tours</Link>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Private Jets</Link>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Support</h3>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Contact Us</Link>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Visa Services</Link>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Travel Insurance</Link>
                        <Link href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Terms & Conditions</Link>
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Stay Updated</h3>
                        <p className="text-gray-400 mb-4 text-sm">
                            Subscribe for exclusive offers and travel inspiration.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Your email address"
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-[#D4AF37]"
                            />
                            <Button size="icon" className="bg-[#D4AF37] hover:bg-[#b8962e] shrink-0">
                                <Mail className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} UpRev Tours. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
