export const chipStyles = {
  success:
    "bg-emerald-200 text-emerald-950 border border-emerald-500/70 dark:bg-emerald-500/25 dark:text-emerald-100 dark:border-emerald-400/40",
  danger:
    "bg-rose-200 text-rose-950 border border-rose-500/70 dark:bg-rose-500/25 dark:text-rose-100 dark:border-rose-400/40",
  warning:
    "bg-amber-200 text-amber-950 border border-amber-500/70 dark:bg-amber-500/25 dark:text-amber-100 dark:border-amber-400/40",
  neutral:
    "bg-slate-200 text-slate-950 border border-slate-500/80 dark:bg-slate-400/25 dark:text-slate-100 dark:border-slate-300/40",
  secondary:
    "bg-stone-200 text-stone-950 border border-stone-500/80 dark:bg-stone-500/25 dark:text-stone-100 dark:border-stone-300/40",
  primary:
    "bg-primary/25 text-foreground border border-primary/70 dark:bg-primary/30 dark:text-foreground dark:border-primary/45",
  accent:
    "bg-accent/25 text-foreground border border-accent/70 dark:bg-accent/30 dark:text-foreground dark:border-accent/45",
} as const;

export function getTrendChipClass(isPositive: boolean) {
  return isPositive ? chipStyles.success : chipStyles.danger;
}
