"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard, useDailySales } from "@/hooks/useReports";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  ClipboardList,
  CheckSquare,
  Square,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
} from "lucide-react";
import {
  formatCurrency,
  getBogotaDateInputValue,
  shiftDateInputValue,
} from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type ShopTask = {
  id: string;
  label: string;
  completed: boolean;
};

const SHOP_TASKS_STORAGE_KEY = "dashboard_shop_notes_v1";
const DEFAULT_SHOP_TASKS: ShopTask[] = [
  { id: "default-1", label: "Llamar proveedor de cascos", completed: false },
  {
    id: "default-2",
    label: "Verificar stock de lubricantes",
    completed: false,
  },
  { id: "default-3", label: "Confirmar entrega de pedidos", completed: false },
];

function capitalizeLabel(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: categoriesResponse } = useCategories({ page: 1, limit: 1 });
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [shopTasks, setShopTasks] = useState<ShopTask[]>([]);
  const [tasksReady, setTasksReady] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [hoveredRevenueKey, setHoveredRevenueKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SHOP_TASKS_STORAGE_KEY);
      if (!raw) {
        setShopTasks(DEFAULT_SHOP_TASKS);
        setTasksReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as ShopTask[];
      if (!Array.isArray(parsed)) {
        setShopTasks(DEFAULT_SHOP_TASKS);
      } else {
        const sanitized = parsed
          .filter((task) => typeof task?.label === "string")
          .map((task) => ({
            id: String(task.id ?? `${Date.now()}-${Math.random()}`),
            label: task.label.trim(),
            completed: Boolean(task.completed),
          }))
          .filter((task) => task.label.length > 0)
          .slice(0, 8);

        setShopTasks(sanitized.length > 0 ? sanitized : DEFAULT_SHOP_TASKS);
      }
    } catch {
      setShopTasks(DEFAULT_SHOP_TASKS);
    } finally {
      setTasksReady(true);
    }
  }, []);

  useEffect(() => {
    if (!tasksReady) {
      return;
    }

    window.localStorage.setItem(
      SHOP_TASKS_STORAGE_KEY,
      JSON.stringify(shopTasks),
    );
  }, [shopTasks, tasksReady]);

  const statusDate = useMemo(() => {
    const weekday = capitalizeLabel(
      now.toLocaleDateString("es-CO", { weekday: "long" }),
    );
    const monthDay = capitalizeLabel(
      now
        .toLocaleDateString("es-CO", {
          day: "numeric",
          month: "short",
        })
        .replace(".", ""),
    );
    const formattedTime = now.toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const [timeValue, suffix = ""] = formattedTime.split(" ");

    return {
      weekday,
      monthDay,
      timeValue,
      suffix,
    };
  }, [now]);

  const chartEndDate = useMemo(() => getBogotaDateInputValue(now), [now]);
  const chartStartDate = useMemo(
    () => shiftDateInputValue(chartEndDate, -6),
    [chartEndDate],
  );

  const { data: dailySales } = useDailySales(chartStartDate, chartEndDate);

  const stats = {
    totalSales: dashboard?.totalSales ?? 0,
    totalRevenue: dashboard?.totalRevenue ?? 0,
    totalProducts: dashboard?.totalProducts ?? 0,
    lowStockProducts: dashboard?.lowStockProducts ?? 0,
    trends: dashboard?.trends ?? {
      totalSales: null,
      totalRevenue: null,
      totalCustomers: null,
    },
  };

  const revenueBarData = useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "short",
      timeZone: "America/Bogota",
    });

    const dailyMap = new Map(
      (dailySales ?? []).map((item) => [
        item.date,
        { total: item.total, count: item.count },
      ]),
    );

    const dateRange = Array.from({ length: 7 }, (_, index) =>
      shiftDateInputValue(chartStartDate, index),
    );

    const maxValue = Math.max(
      ...dateRange.map((dateKey) => dailyMap.get(dateKey)?.total ?? 0),
      1,
    );

    return dateRange.map((dateKey) => {
      const daily = dailyMap.get(dateKey) ?? { total: 0, count: 0 };
      const [year, month, day] = dateKey.split("-").map(Number);
      const safeDate = new Date(
        Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0),
      );

      return {
        key: dateKey,
        total: daily.total,
        count: daily.count,
        isToday: dateKey === chartEndDate,
        detailDate: capitalizeLabel(
          dateFormatter.format(safeDate).replace(".", ""),
        ),
        height:
          daily.total === 0
            ? 18
            : Math.max(28, Math.round((daily.total / maxValue) * 100)),
      };
    });
  }, [chartEndDate, chartStartDate, dailySales]);

  const completedTasks = useMemo(
    () => shopTasks.filter((task) => task.completed).length,
    [shopTasks],
  );

  const hasCompletedTasks = completedTasks > 0;

  const totalCategories = categoriesResponse?.meta.total ?? 0;
  const avgProductsPerCategory =
    totalCategories > 0 ? stats.totalProducts / totalCategories : 0;
  const lowStockRatio =
    stats.totalProducts > 0
      ? (stats.lowStockProducts / stats.totalProducts) * 100
      : 0;
  const avgSaleTicket =
    stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0;
  const lowStockSeverity =
    lowStockRatio >= 20
      ? "Riesgo alto"
      : lowStockRatio >= 10
        ? "Atencion"
        : lowStockRatio > 0
          ? "Monitoreo"
          : "Sin alertas";

  const hoveredRevenueBar = useMemo(
    () => revenueBarData.find((bar) => bar.key === hoveredRevenueKey) ?? null,
    [hoveredRevenueKey, revenueBarData],
  );

  const formatTrend = (value: number | null) => {
    const safeValue = value ?? 0;
    const rounded = Math.abs(safeValue) < 0.05 ? 0 : safeValue;
    const sign = rounded > 0 ? "+" : "";
    return `${sign}${rounded.toFixed(1)}%`;
  };

  const recentSales = useMemo(
    () =>
      (dashboard?.recentSales ?? []).map((sale) => ({
        ...sale,
        formattedDate: new Date(sale.createdAt).toLocaleDateString("es-CO"),
      })),
    [dashboard?.recentSales],
  );

  const handleToggleTask = (taskId: string) => {
    setShopTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleAddTask = () => {
    const trimmed = taskInput.trim();
    if (!trimmed) {
      return;
    }

    const createdTask: ShopTask = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      label: trimmed,
      completed: false,
    };

    setShopTasks((prev) => [createdTask, ...prev].slice(0, 8));
    setTaskInput("");
  };

  const handleClearCompletedTasks = () => {
    setShopTasks((prev) => prev.filter((task) => !task.completed));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <LayoutDashboard className="w-5 h-5 text-primary/50" />
            </div>
            <p className="text-xs text-muted-foreground">
              Cargando dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-3 overflow-x-hidden lg:space-y-4">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-primary shrink-0" />
            <h1 className="text-2xl lg:text-4xl font-bold text-foreground">
              Bienvenido, {user?.name?.split(" ")[0]}
            </h1>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-6 xl:grid-cols-12 stagger-children">
          <div className="relative min-w-0 overflow-hidden rounded-3xl border border-primary/35 bg-primary px-5 py-5 text-[#2f241d] shadow-[0_12px_30px_-18px_rgba(193,123,90,0.75)] md:col-span-2 xl:col-span-3">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15" />
            <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-black/10 blur-sm" />

            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-[#2f241d]/25 bg-white/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                Estado del dia
              </div>

              <div className="mt-4 rounded-2xl border border-[#2f241d]/20 bg-white/25 p-3 backdrop-blur-[2px]">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4f3a2f]/80">
                      Hoy
                    </p>
                    <p className="truncate text-xl font-extrabold leading-tight sm:text-2xl">
                      {statusDate.weekday}
                    </p>
                  </div>

                  <span className="h-10 w-px bg-[#2f241d]/20" />

                  <div className="min-w-0 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4f3a2f]/80">
                      Fecha
                    </p>
                    <p className="truncate text-base font-bold leading-tight sm:text-lg">
                      {statusDate.monthDay}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#2f241d]/20 bg-[#2f241d]/85 px-3.5 py-3 text-[#f8eee7] shadow-inner shadow-black/20">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f8eee7]/65">
                      Hora actual
                    </p>
                    <p className="stat-number mt-1 text-3xl font-medium leading-none sm:text-4xl">
                      {statusDate.timeValue}
                    </p>
                  </div>
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#f8eee7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {statusDate.suffix}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-4 text-foreground shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-4 xl:col-span-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Ingresos totales
                </p>
                <p className="stat-number mt-3 text-3xl font-bold leading-none text-foreground sm:text-4xl">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  (stats.trends.totalRevenue ?? 0) >= 0
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {(stats.trends.totalRevenue ?? 0) >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {formatTrend(stats.trends.totalRevenue)}
              </span>
            </div>

            <div className="relative rounded-2xl border border-border/60 bg-muted/45 px-2.5 pb-2.5 pt-2">
              {hoveredRevenueBar && (
                <div
                  className="pointer-events-none absolute top-2 z-20 w-[164px] rounded-xl border border-border/80 bg-card/95 px-3 py-2 text-center shadow-lg"
                  style={{
                    left: `${Math.min(
                      88,
                      Math.max(
                        12,
                        ((revenueBarData.findIndex(
                          (bar) => bar.key === hoveredRevenueBar.key,
                        ) +
                          0.5) /
                          revenueBarData.length) *
                          100,
                      ),
                    )}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="block text-[11px] font-semibold leading-tight text-muted-foreground">
                    {hoveredRevenueBar.detailDate}
                  </span>
                  <span className="stat-number mt-1 block text-sm font-bold text-foreground">
                    {formatCurrency(hoveredRevenueBar.total)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {hoveredRevenueBar.count} venta
                    {hoveredRevenueBar.count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <div className="mt-9 grid h-28 grid-cols-7 items-end gap-2">
                {revenueBarData.map((bar) => (
                  <button
                    key={bar.key}
                    type="button"
                    className="group/bar relative flex h-full items-end focus:outline-none"
                    aria-label={`${bar.detailDate}: ${formatCurrency(bar.total)}, ${bar.count} venta${bar.count !== 1 ? "s" : ""}`}
                    title={`${bar.detailDate}: ${formatCurrency(bar.total)} | ${bar.count} venta${bar.count !== 1 ? "s" : ""}`}
                    onMouseEnter={() => setHoveredRevenueKey(bar.key)}
                    onMouseLeave={() => setHoveredRevenueKey(null)}
                    onFocus={() => setHoveredRevenueKey(bar.key)}
                    onBlur={() => setHoveredRevenueKey(null)}
                  >
                    <span
                      className={`relative w-full rounded-t-xl border border-primary/20 transition-all duration-200 ${
                        bar.isToday
                          ? "bg-gradient-to-t from-primary/60 via-primary to-[#efbc9a]"
                          : "bg-gradient-to-t from-primary/20 via-primary/30 to-primary/45 group-hover/bar:from-primary/45 group-hover/bar:to-[#e7ab87]"
                      }`}
                      style={{
                        height: `${bar.height}%`,
                        boxShadow: bar.isToday
                          ? "0 -6px 14px rgba(193,123,90,0.45), 0 0 0 1px rgba(255,255,255,0.08)"
                          : "0 -2px 10px rgba(193,123,90,0.2)",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-4 text-foreground shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-6 xl:col-span-3 xl:row-span-2">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/35 to-primary/10 ring-1 ring-primary/40">
                  <ClipboardList className="h-[18px] w-[18px] text-primary" />
                </div>
                <p className="truncate text-base font-bold text-foreground">
                  Tareas del Local
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-muted text-foreground border-border/60"
              >
                {completedTasks}/{shopTasks.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {shopTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/55 px-3 py-4 text-center text-xs text-muted-foreground">
                  Sin tareas por ahora
                </div>
              )}

              {shopTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="flex w-full items-start gap-2 rounded-xl border border-border/70 bg-muted/55 px-3 py-2 text-left transition hover:border-primary/50"
                >
                  {task.completed ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={`min-w-0 text-sm ${
                      task.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {task.label}
                  </span>
                </button>
              ))}
            </div>

            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleAddTask();
              }}
            >
              <input
                value={taskInput}
                onChange={(event) => setTaskInput(event.target.value)}
                placeholder="Agregar tarea"
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                maxLength={70}
              />
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg border border-primary/60 bg-primary/15 px-3 text-xs font-semibold text-primary transition hover:bg-primary/25"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </form>

            <button
              type="button"
              onClick={handleClearCompletedTasks}
              disabled={!hasCompletedTasks}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/45 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Borrar completadas
            </button>
          </div>

          <div className="min-w-0 rounded-3xl border border-border/70 bg-card px-4 py-4 shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-3 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ventas completadas
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/14 ring-1 ring-emerald-500/25">
                <ShoppingCart className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <p className="stat-number text-4xl font-bold mb- leading-none text-foreground:">
              {stats.totalSales.toLocaleString("es-CO")}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  (stats.trends.totalSales ?? 0) >= 0
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                }`}
              >
                {(stats.trends.totalSales ?? 0) >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {formatTrend(stats.trends.totalSales)}
              </span>
              <span className="truncate text-[11px] text-muted-foreground text-right">
                ticket promedio {formatCurrency(avgSaleTicket)}
              </span>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-4 text-foreground shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-3 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-2 text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Productos totales
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/30">
                <Package className="h-[18px] w-[18px] text-amber-300" />
              </div>
            </div>

            <p className="stat-number text-4xl font-bold leading-none text-foreground">
              {stats.totalProducts.toLocaleString("es-CO")}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                {totalCategories.toLocaleString("es-CO")} categorias
              </span>
              <span className="truncate text-[11px] text-muted-foreground text-right">
                Promedio {avgProductsPerCategory.toFixed(1)} por categoria
              </span>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-4 text-foreground shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-3 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-2 text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Stock critico
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 ring-1 ring-rose-400/30">
                <TrendingUp className="h-[18px] w-[18px] text-rose-300" />
              </div>
            </div>

            <p className="stat-number text-4xl font-bold leading-none text-foreground">
              {stats.lowStockProducts.toLocaleString("es-CO")}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="inline-flex max-w-full items-center justify-center rounded-full border border-rose-300/40 bg-rose-500/15 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                {lowStockSeverity}
              </span>
              <span className="truncate text-[11px] font-semibold text-rose-700 dark:text-rose-300 text-right">
                {Math.abs(lowStockRatio).toFixed(1)}% del catalogo
              </span>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="animate-fade-in rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="card-top-rail card-top-rail--primary" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <h3 className="text-base font-semibold text-foreground">
              Ventas Recientes
            </h3>
            {recentSales.length > 0 && (
              <Badge variant="secondary">{recentSales.length}</Badge>
            )}
          </div>
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <ShoppingCart className="w-5 h-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">
                No hay ventas registradas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      N° Venta
                    </th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Items
                    </th>
                    <th className="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </th>
                    <th className="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-border/40 last:border-b-0 transition-colors hover:bg-primary/0.03"
                    >
                      <td className="py-3 px-5">
                        <span className="text-xs font-bold text-primary font-mono">
                          #{sale.saleNumber}
                        </span>
                      </td>
                      <td className="py-3 px-5 max-w-[150px] truncate">
                        {sale.customer?.name ? (
                          <span className="text-xs font-bold text-foreground">
                            {sale.customer.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">
                            General
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-xs text-muted-foreground">
                          {sale.items.length} item
                          {sale.items.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="stat-number text-sm font-bold text-foreground">
                          {formatCurrency(sale.total)}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-xs text-muted-foreground whitespace-nowrap font-mono">
                        {sale.formattedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
