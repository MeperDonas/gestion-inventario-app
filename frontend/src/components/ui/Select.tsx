import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-xl border bg-card px-4 py-2.5 text-foreground",
            "transition-all duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25",
            "disabled:cursor-not-allowed disabled:opacity-55",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-border",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
