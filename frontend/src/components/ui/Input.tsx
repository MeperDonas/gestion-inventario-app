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
      "w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground",
      "placeholder:text-muted-foreground/60",
      "transition-all duration-200",
      "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error
        ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/15"
        : "border-border",
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
          <span className="mt-1.5 block text-xs font-medium text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
