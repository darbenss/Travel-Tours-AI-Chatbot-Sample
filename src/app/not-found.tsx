
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#002147] text-white">
            <div className="container flex flex-col items-center justify-center px-4 text-center">
                <h1 className="mb-4 text-9xl font-bold text-[#D4AF37] opacity-20">404</h1>
                <div className="absolute z-10 flex flex-col items-center space-y-6">
                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Page Not Found
                    </h2>
                    <p className="max-w-md text-lg text-gray-300">
                        This is just for demo only.
                    </p>
                    <Link href="/">
                        <Button className="mt-8 bg-[#D4AF37] text-white hover:bg-[#b8962e]">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
