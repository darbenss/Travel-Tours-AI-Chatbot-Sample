
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
    { name: "Destinations", href: "#" },
    { name: "Services", href: "#" },
    { name: "Bookings", href: "/bookings" },
    { name: "Corporate", href: "#" },
    { name: "About", href: "#" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-[#002147]/95 backdrop-blur-md shadow-sm py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/uprev-logo.png"
                        alt="UpRev Tours"
                        className="h-10 md:h-12 w-auto object-contain transition-all duration-300"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-white transition-colors hover:text-[#D4AF37]"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Login / Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Button
                        variant={isScrolled ? "outline" : "ghost"}
                        className="font-medium text-white hover:bg-white/10 hover:text-white"
                    >
                        Log In
                    </Button>
                    <Button variant="default" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                        Plan My Trip
                    </Button>
                </div>
            </div>
        </header>
    );
}
