"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard, useDailySales } from "@/hooks/useReports";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateTask,
  useDeleteTask,
  useTaskTimeline,
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from "@/hooks/useTasks";
import { Badge } from "@/components/ui/Badge";
import { getApiErrorMessage } from "@/lib/api";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  ClipboardList,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Clock3,
  Loader2,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getBogotaDateInputValue,
  shiftDateInputValue,
} from "@/lib/utils";
import { chipStyles, getTrendChipClass } from "@/lib/chipStyles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

function capitalizeLabel(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

type DateRangeMeta = {
  startDate: string | null;
  endDate: string | null;
  timezone: string;
};

function formatRangeDateLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

function formatAppliedRangeLabel(appliedRange?: DateRangeMeta) {
  if (!appliedRange) {
    return "Período completo";
  }

  const startLabel = formatRangeDateLabel(appliedRange.startDate);
  const endLabel = formatRangeDateLabel(appliedRange.endDate);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }
  if (startLabel) {
    return `Desde ${startLabel}`;
  }
  if (endLabel) {
    return `Hasta ${endLabel}`;
  }

  return "Período completo";
}

function getTaskStatusLabel(status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "IN_PROGRESS":
      return "En curso";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
  }
}

function getTaskStatusClass(status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  switch (status) {
    case "PENDING":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "IN_PROGRESS":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "CANCELLED":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }
}

function getTaskEventLabel(type: "CREATED" | "UPDATED" | "STATUS_CHANGED" | "DELETED") {
  switch (type) {
    case "CREATED":
      return "Creada";
    case "UPDATED":
      return "Actualizada";
    case "STATUS_CHANGED":
      return "Cambio de estado";
    case "DELETED":
      return "Eliminada";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [dateValidationError, setDateValidationError] = useState<string | null>(
    null,
  );
  const {
    data: dashboard,
    isLoading,
    error: dashboardError,
  } = useDashboard(appliedStartDate || undefined, appliedEndDate || undefined);
  const { data: categoriesResponse } = useCategories({ page: 1, limit: 1 });
  const { user } = useAuth();
  const [now] = useState(() => new Date());
  const [taskInput, setTaskInput] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [pendingDeletedTaskIds, setPendingDeletedTaskIds] = useState<string[]>([]);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState({ title: "", description: "" });
  const [hoveredRevenueKey, setHoveredRevenueKey] = useState<string | null>(
    null,
  );
  const tasksQuery = useTasks();
  const taskList = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data?.tasks]);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const visibleTaskList = useMemo(
    () => taskList.filter((task) => !pendingDeletedTaskIds.includes(task.id)),
    [pendingDeletedTaskIds, taskList],
  );

  const resolvedSelectedTaskId = useMemo(() => {
    if (visibleTaskList.length === 0) {
      return null;
    }

    if (selectedTaskId && visibleTaskList.some((task) => task.id === selectedTaskId)) {
      return selectedTaskId;
    }

    return visibleTaskList[0].id;
  }, [selectedTaskId, visibleTaskList]);

  const selectedTask = useMemo(
    () => visibleTaskList.find((task) => task.id === resolvedSelectedTaskId) ?? null,
    [resolvedSelectedTaskId, visibleTaskList],
  );
  const {
    data: selectedTaskTimeline = [],
    isLoading: isTimelineLoading,
  } = useTaskTimeline(selectedTask?.id ?? "", {
    enabled: !!selectedTask,
  });

  const isTaskEditing = isEditingTask && !!selectedTask;

  const chartEndDate = useMemo(() => getBogotaDateInputValue(now), [now]);
  const chartStartDate = useMemo(
    () => shiftDateInputValue(chartEndDate, -6),
    [chartEndDate],
  );

  const dailySalesStartDate = appliedStartDate || chartStartDate;
  const dailySalesEndDate = appliedEndDate || chartEndDate;

  const { data: dailySales } = useDailySales(
    dailySalesStartDate,
    dailySalesEndDate,
  );

  const activeRangeLabel = useMemo(
    () => formatAppliedRangeLabel(dashboard?.appliedRange),
    [dashboard?.appliedRange],
  );

  const dashboardErrorMessage = dashboardError
    ? getApiErrorMessage(
        dashboardError,
        "No se pudo cargar el dashboard para ese período.",
      )
    : null;

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
      (dailySales?.data ?? []).map((item) => [
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
  }, [chartEndDate, chartStartDate, dailySales?.data]);

  const completedTasks = useMemo(
    () => visibleTaskList.filter((task) => task.status === "COMPLETED").length,
    [visibleTaskList],
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
        ? "Atención"
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

  const handleApplyRange = () => {
    if (!filterStartDate && !filterEndDate) {
      setAppliedStartDate("");
      setAppliedEndDate("");
      setDateValidationError(null);
      return;
    }

    if (!filterStartDate || !filterEndDate) {
      setDateValidationError(
        "Seleccioná ambas fechas para aplicar el filtro.",
      );
      return;
    }

    if (filterEndDate < filterStartDate) {
      setDateValidationError(
        "La fecha Hasta no puede ser anterior a la fecha Desde.",
      );
      return;
    }

    setDateValidationError(null);
    setAppliedStartDate(filterStartDate);
    setAppliedEndDate(filterEndDate);
  };

  const handleClearRange = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setDateValidationError(null);
  };

  const handleOpenSale = (saleId: string) => {
    router.push(`/sales/${saleId}`);
  };

  const handleSetTaskStatus = async (
    taskId: string,
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    try {
      await updateTaskStatus.mutateAsync({ id: taskId, status });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo actualizar la tarea"));
    }
  };

  const handleToggleTask = async (
    taskId: string,
    currentStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    await handleSetTaskStatus(taskId, nextStatus);
  };

  const handleAddTask = async () => {
    const trimmed = taskInput.trim();
    if (!trimmed) {
      return;
    }

    try {
      const createdTask = await createTask.mutateAsync({ title: trimmed });
      setSelectedTaskId(createdTask.id);
      setTaskInput("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo crear la tarea"));
    }
  };

  const getNextSelectedTaskIdAfterRemoval = (removedTaskIds: string[]) => {
    if (!resolvedSelectedTaskId || removedTaskIds.length === 0) {
      return resolvedSelectedTaskId;
    }

    const removedTaskIdSet = new Set(removedTaskIds);
    if (!removedTaskIdSet.has(resolvedSelectedTaskId)) {
      return resolvedSelectedTaskId;
    }

    return visibleTaskList.find((task) => !removedTaskIdSet.has(task.id))?.id ?? null;
  };

  const handleClearCompletedTasks = async () => {
    const completedIds = visibleTaskList
      .filter((task) => task.status === "COMPLETED")
      .map((task) => task.id);

    if (completedIds.length === 0) {
      return;
    }

    const previousSelectedTaskId = resolvedSelectedTaskId;
    const nextSelectedTaskId = getNextSelectedTaskIdAfterRemoval(completedIds);

    setPendingDeletedTaskIds((current) => [...new Set([...current, ...completedIds])]);

    if (nextSelectedTaskId !== resolvedSelectedTaskId) {
      setSelectedTaskId(nextSelectedTaskId);
      setIsEditingTask(false);
    }

    try {
      await Promise.all(completedIds.map((id) => deleteTask.mutateAsync(id)));
      setPendingDeletedTaskIds((current) =>
        current.filter((id) => !completedIds.includes(id)),
      );
    } catch (error) {
      setPendingDeletedTaskIds((current) => current.filter((id) => !completedIds.includes(id)));
      if (nextSelectedTaskId !== previousSelectedTaskId) {
        setSelectedTaskId(previousSelectedTaskId);
      }
      toast.error(getApiErrorMessage(error, "No se pudieron borrar las tareas"));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const previousSelectedTaskId = resolvedSelectedTaskId;
    const nextSelectedTaskId = getNextSelectedTaskIdAfterRemoval([taskId]);

    setPendingDeletedTaskIds((current) =>
      current.includes(taskId) ? current : [...current, taskId],
    );

    if (nextSelectedTaskId !== resolvedSelectedTaskId) {
      setSelectedTaskId(nextSelectedTaskId);
      setIsEditingTask(false);
    }

    try {
      await deleteTask.mutateAsync(taskId);
      setPendingDeletedTaskIds((current) => current.filter((id) => id !== taskId));
    } catch (error) {
      setPendingDeletedTaskIds((current) => current.filter((id) => id !== taskId));
      if (nextSelectedTaskId !== previousSelectedTaskId) {
        setSelectedTaskId(previousSelectedTaskId);
      }
      toast.error(getApiErrorMessage(error, "No se pudo borrar la tarea"));
    }
  };

  const handleEditSelectedTask = () => {
    if (!selectedTask) {
      return;
    }

    setTaskDraft({
      title: selectedTask.title,
      description: selectedTask.description ?? "",
    });
    setIsEditingTask(true);
  };

  const handleCancelTaskEdit = () => {
    if (!selectedTask) {
      setTaskDraft({ title: "", description: "" });
      setIsEditingTask(false);
      return;
    }

    setTaskDraft({
      title: selectedTask.title,
      description: selectedTask.description ?? "",
    });
    setIsEditingTask(false);
  };

  const handleSaveTaskEdit = async () => {
    if (!selectedTask) {
      return;
    }

    const trimmedTitle = taskDraft.title.trim();
    if (!trimmedTitle) {
      toast.error("La tarea necesita un titulo para guardarse.");
      return;
    }

    try {
      await updateTask.mutateAsync({
        id: selectedTask.id,
        data: {
          title: trimmedTitle,
          description: taskDraft.description.trim() || null,
        },
      });
      setIsEditingTask(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar la tarea"));
    }
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

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-muted/30 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filtro de fechas
            </p>
            <Badge variant="secondary" className="text-[11px]">
              {activeRangeLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:flex-nowrap">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Desde
            </span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(event) => {
                setFilterStartDate(event.target.value);
                setDateValidationError(null);
              }}
              className="h-9 min-w-[130px] flex-1 rounded-lg border border-border/60 bg-muted/40 px-3 text-sm text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Hasta
            </span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(event) => {
                setFilterEndDate(event.target.value);
                setDateValidationError(null);
              }}
              className="h-9 min-w-[130px] flex-1 rounded-lg border border-border/60 bg-muted/40 px-3 text-sm text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={handleApplyRange}
              className="h-9 shrink-0 rounded-lg border border-primary/40 bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Aplicar
            </button>
            {(filterStartDate || filterEndDate) && (
              <button
                type="button"
                onClick={handleClearRange}
                className="h-9 shrink-0 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Limpiar
              </button>
            )}
          </div>

          {(dateValidationError || dashboardErrorMessage) && (
            <div className="px-4 pb-3">
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                {dateValidationError ?? dashboardErrorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-6 xl:grid-cols-12 stagger-children">
          <div className="relative min-w-0 overflow-hidden rounded-3xl border border-primary/35 bg-primary px-5 py-5 text-[#2f241d] shadow-[0_12px_30px_-18px_rgba(193,123,90,0.75)] md:col-span-2 xl:col-span-3">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15" />
            <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-black/10 blur-sm" />

            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-[#2f241d]/25 bg-white/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                Resumen del día
              </div>

              <div className="mt-4">
                <p className="text-2xl font-extrabold leading-tight sm:text-3xl">
                  ¡Hola, {user?.name?.split(" ")[0]}!
                </p>
                <p className="mt-2 text-sm font-medium text-[#4f3a2f]/80">
                  {formatDate(now)}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#2f241d]/20 bg-white/25 p-3 backdrop-blur-[2px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f3a2f]/80">
                      Ventas hoy
                    </p>
                    <p className="mt-1 text-xl font-extrabold leading-tight">
                      {stats.totalSales.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f3a2f]/80">
                      Stock bajo
                    </p>
                    <p className="mt-1 text-xl font-extrabold leading-tight">
                      {stats.lowStockProducts.toLocaleString("es-CO")}
                    </p>
                  </div>
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
                  getTrendChipClass((stats.trends.totalRevenue ?? 0) >= 0)
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
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-foreground">
                    Tareas del local
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Gestión operativa conectada al backend con timeline append-only
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="border-border/60 bg-muted text-foreground"
                >
                  {completedTasks}/{visibleTaskList.length}
                </Badge>
                <Badge
                  variant="secondary"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  API real
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {visibleTaskList.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/55 px-3 py-4 text-center text-xs text-muted-foreground">
                  Sin tareas por ahora
                </div>
              )}

              {visibleTaskList.map((task) => {
                const isSelected = task.id === selectedTask?.id;

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border px-3 py-2 transition ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/70 bg-muted/55 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="mt-0.5 shrink-0 rounded-md text-left"
                        aria-label={`Cambiar estado rápido de ${task.title}`}
                      >
                        {task.status === "COMPLETED" ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setIsEditingTask(false);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`block text-sm ${
                              task.status === "COMPLETED"
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getTaskStatusClass(task.status)}`}
                          >
                            {getTaskStatusLabel(task.status)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          <span>{formatDateTime(task.updatedAt)}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
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
                placeholder="Agregar tarea operativa"
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                maxLength={120}
              />
              <button
                type="submit"
                disabled={createTask.isPending}
                className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg border border-primary/60 bg-primary/15 px-3 text-xs font-semibold text-primary transition hover:bg-primary/25"
              >
                <Plus className="h-3.5 w-3.5" />
                {createTask.isPending ? "Guardando" : "Agregar"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleClearCompletedTasks}
              disabled={!hasCompletedTasks || deleteTask.isPending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/45 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Borrar completadas
            </button>

            {selectedTask && (
              <div className="mt-4 rounded-2xl border border-border/70 bg-muted/35 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {selectedTask.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedTask.createdBy?.name
                        ? `Creada por ${selectedTask.createdBy.name}`
                        : "Creada desde el dashboard"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    disabled={deleteTask.isPending}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleSetTaskStatus(selectedTask.id, status)}
                        disabled={updateTaskStatus.isPending || selectedTask.status === status}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${getTaskStatusClass(status)}`}
                      >
                        {getTaskStatusLabel(status)}
                      </button>
                    ),
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Detalle editable
                    </p>
                    {isTaskEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelTaskEdit}
                          disabled={updateTask.isPending}
                          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTaskEdit}
                          disabled={updateTask.isPending}
                          className="rounded-lg border border-primary/40 bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updateTask.isPending ? "Guardando" : "Guardar cambios"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditSelectedTask}
                        className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {isTaskEditing ? (
                    <div className="mt-3 space-y-3">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Titulo
                        </span>
                        <input
                          value={taskDraft.title}
                          onChange={(event) =>
                            setTaskDraft((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          maxLength={120}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Descripcion
                        </span>
                        <textarea
                          value={taskDraft.description}
                          onChange={(event) =>
                            setTaskDraft((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          rows={3}
                          maxLength={280}
                          placeholder="Detalle opcional para el equipo"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {selectedTask.title}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {selectedTask.description?.trim() ||
                          "Sin descripcion adicional por ahora."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Historial
                    </p>
                    {isTimelineLoading && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {selectedTaskTimeline.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-background/70 px-3 py-3 text-xs text-muted-foreground">
                      Todavía no hay eventos registrados para esta tarea.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTaskTimeline.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-xl border border-border/70 bg-background/85 px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {getTaskEventLabel(event.type)}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {event.fromStatus && event.fromStatus !== event.toStatus
                                  ? `${getTaskStatusLabel(event.fromStatus)} -> ${getTaskStatusLabel(event.toStatus)}`
                                  : getTaskStatusLabel(event.toStatus)}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatDateTime(event.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {event.createdBy?.name ?? "Sistema"}
                            {event.note ? ` - ${event.note}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  getTrendChipClass((stats.trends.totalSales ?? 0) >= 0)
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
                Ticket promedio {formatCurrency(avgSaleTicket)}
              </span>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-4 text-foreground shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-3 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-2 text-muted-foreground">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Productos en catálogo
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  Total de productos activos
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/30">
                <Package className="h-[18px] w-[18px] text-amber-300" />
              </div>
            </div>

            <p className="stat-number text-4xl font-bold leading-none text-foreground">
              {stats.totalProducts.toLocaleString("es-CO")}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold ${chipStyles.warning}`}
              >
                {totalCategories.toLocaleString("es-CO")} categorías
              </span>
              <span className="truncate text-[11px] text-muted-foreground text-right">
                Promedio {avgProductsPerCategory.toFixed(1)} por categoría
              </span>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card px-4 py-4 text-foreground shadow-[0_16px_30px_-22px_rgba(0,0,0,0.24)] md:col-span-3 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-2 text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Stock crítico
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 ring-1 ring-rose-400/30">
                <TrendingUp className="h-[18px] w-[18px] text-rose-300" />
              </div>
            </div>

            <p className="stat-number text-4xl font-bold leading-none text-foreground">
              {stats.lowStockProducts.toLocaleString("es-CO")}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span
                className={`inline-flex max-w-full items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold ${chipStyles.danger}`}
              >
                {lowStockSeverity}
              </span>
              <span className="truncate text-[11px] font-semibold text-rose-800 dark:text-rose-300 text-right">
                {Math.abs(lowStockRatio).toFixed(1)}% del catálogo
              </span>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="animate-fade-in rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="card-top-rail card-top-rail--primary" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <h3 className="text-base font-semibold text-foreground">
              Ventas recientes
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
                      Ítems
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
                      onClick={() => handleOpenSale(sale.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleOpenSale(sale.id);
                        }
                      }}
                      tabIndex={0}
                      className="cursor-pointer border-b border-border/40 last:border-b-0 transition-colors hover:bg-primary/0.03 focus:outline-none focus-visible:bg-primary/10"
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
