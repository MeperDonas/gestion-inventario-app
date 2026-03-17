import { cn } from "@/lib/utils";
import { chipStyles } from "@/lib/chipStyles";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "primary" | "secondary";
  className?: string;
}

const variants = {
  default:
    chipStyles.neutral,
  success:
    chipStyles.success,
  warning:
    chipStyles.warning,
  danger:
    chipStyles.danger,
  primary:
    chipStyles.primary,
  secondary:
    chipStyles.secondary,
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
