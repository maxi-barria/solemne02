import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonPrimaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ children, isLoading, variant = "primary", className, disabled, ...props }, ref) => {
    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg font-medium",
          "transition-smooth",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isPrimary
            ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Cargando...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

ButtonPrimary.displayName = "ButtonPrimary";

export default ButtonPrimary;
