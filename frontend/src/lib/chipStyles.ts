export const chipStyles = {
  success:
    "bg-emerald-100 text-emerald-800 border border-emerald-300/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  danger:
    "bg-rose-100 text-rose-800 border border-rose-300/70 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  warning:
    "bg-amber-100 text-amber-800 border border-amber-300/70 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  neutral:
    "bg-slate-100 text-slate-800 border border-slate-300/70 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/30",
  primary:
    "bg-primary/15 text-[#5f3926] border border-primary/45 dark:bg-primary/20 dark:text-primary dark:border-primary/35",
  accent:
    "bg-accent/15 text-[#355247] border border-accent/45 dark:bg-accent/20 dark:text-accent dark:border-accent/35",
} as const;

export function getTrendChipClass(isPositive: boolean) {
  return isPositive ? chipStyles.success : chipStyles.danger;
}
