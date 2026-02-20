import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, textarea = false, rows = 3, className = "", ...props }, ref) => {
    const commonClasses = cn(
      "w-full rounded-xl border bg-card px-4 py-2.5 text-foreground",
      "placeholder:text-muted-foreground/80",
      "transition-all duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25",
      "disabled:cursor-not-allowed disabled:opacity-55",
      error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-border",
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-foreground">
            {label}
          </label>
        )}
        {textarea ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            className={cn(commonClasses, "resize-none")}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            className={commonClasses}
            {...props}
          />
        )}
        {error && (
          <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
