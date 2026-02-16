
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
    { name: "Destinations", href: "#" },
    { name: "Services", href: "#" },
    { name: "Bookings", href: "/bookings" },
    { name: "Corporate", href: "#" },
    { name: "About", href: "#" },
];

interface NavbarProps {
    variant?: "transparent" | "solid";
}

export function Navbar({ variant = "transparent" }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isSolid = variant === "solid" || isScrolled;

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isSolid
                    ? "bg-[#002147]/95 backdrop-blur-md shadow-sm py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <span className="text-white">UPREV</span>
                    <span className="text-[#D4AF37]">DEMO</span>
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
                    <AuthButtons isScrolled={isScrolled} />
                </div>
            </div>
        </header>
    );
}

function AuthButtons({ isScrolled }: { isScrolled: boolean }) {
    const { user, logout, loading } = useAuth();

    if (loading) return null;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-[#D4AF37]",
                        isScrolled ? "text-slate-800" : "text-white"
                    )}
                >
                    My Bookings
                </Link>
                {user.is_admin && (
                    <Link
                        href="/admin"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-[#D4AF37]",
                            isScrolled ? "text-slate-800" : "text-white"
                        )}
                    >
                        Admin
                    </Link>
                )}
                <Button
                    variant="ghost"
                    onClick={logout}
                    className={cn(
                        "font-medium hover:bg-white/10",
                        isScrolled ? "text-slate-800 hover:text-slate-900" : "text-white hover:text-white"
                    )}
                >
                    Log Out
                </Button>
            </div>
        )
    }

    return (
        <>
            <Link href="/login">
                <Button
                    variant={isScrolled ? "outline" : "ghost"}
                    className={cn(
                        "font-medium hover:bg-white/10",
                        isScrolled ? "text-slate-800 hover:text-slate-900 border-slate-200" : "text-white hover:text-white"
                    )}
                >
                    Log In
                </Button>
            </Link>
            <Button variant="default" className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                Plan My Trip
            </Button>
        </>
    )
}
