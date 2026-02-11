
import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Note: I'm not using cva actual dependency here unless installed, 
// wait, I didn't install class-variance-authority. 
// I'll implement simple variant handling without cva for now to save install time, 
// or I can install it. It's cleaner with it but extra dep.
// I'll stick to manual clsx for speed unless complexity grows.
// Actually, CVA is standard in Shadcn-like setups but can be overkill for one button.
// I'll use manual strings for now.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {

        // I need to install @radix-ui/react-slot for `asChild` if I use it.
        // I haven't installed it. I will remove `asChild` and `Slot` support to keep it simple and dependency-light 
        // since user didn't request full component library. I'll just use "button".

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            default: "bg-[#D4AF37] text-white hover:bg-[#b8962e] shadow-md",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10",
            ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-white/10 text-white",
            link: "text-primary underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
