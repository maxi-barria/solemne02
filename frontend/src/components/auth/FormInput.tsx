import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "../icons";
import { cn } from "../../lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, showPasswordToggle, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;
    const hasError = !!error;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            id={props.name}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${props.name}-error` : undefined}
            className={cn(
              "w-full px-3 py-2 rounded-lg border bg-background text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
              "transition-smooth",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              hasError &&
                "border-destructive focus:ring-destructive animate-shake",
              showPasswordToggle && "pr-10",
              className
            )}
            {...props}
          />

          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-smooth rounded"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {hasError && (
          <div
            id={`${props.name}-error`}
            className="flex items-center gap-1.5 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
