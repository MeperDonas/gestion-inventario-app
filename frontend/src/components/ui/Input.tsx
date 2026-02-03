import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, textarea = false, rows = 3, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        {textarea ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            className={`w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 resize-none
              ${error ? "border-red-500" : ""}
              ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            className={`w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${error ? "border-red-500" : ""}
              ${className}`}
            {...props}
          />
        )}
        {error && (
          <span className="text-sm text-red-500 mt-1 block">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
