"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useDashboard,
  useSalesByPaymentMethod,
  useSalesByCategory,
  useTopSellingProducts,
  useCustomerStatistics,
} from "@/hooks/useReports";
import { api, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Download,
  BarChart3,
  Calendar,
  X,
} from "lucide-react";
import {
  formatCurrency,
  getBogotaDateInputValue,
  shiftDateInputValue,
} from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import { ImportSection } from "@/components/reports/ImportSection";

const LOADING_SPINNER = (
  <div className="flex items-center justify-center py-10">
    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
      <BarChart3 className="w-4 h-4 text-primary/50" />
    </div>
  </div>
);

export default function ReportsPage() {
  const toast = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const setToday = () => {
    const today = getBogotaDateInputValue();
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeek = () => {
    const today = getBogotaDateInputValue();
    setStartDate(shiftDateInputValue(today, -6));
    setEndDate(today);
  };

  const { data: dashboard } = useDashboard(startDate, endDate);
  const { data: paymentMethods, isLoading: paymentLoading } =
    useSalesByPaymentMethod(startDate, endDate);
  const { data: salesByCategory, isLoading: categoryLoading } =
    useSalesByCategory(startDate, endDate);
  const { data: topProducts, isLoading: topProductsLoading } =
    useTopSellingProducts(startDate, endDate, 5);
  const { data: customerStats, isLoading: customerLoading } =
    useCustomerStatistics(startDate, endDate);

  const handleExport = async (
    type: "sales" | "products" | "customers" | "inventory",
    format: "pdf" | "excel" | "csv",
  ) => {
    try {
      await api.exportData(`/exports/${type}`, {
        format,
        type,
        startDate,
        endDate,
      });
      toast.success(
        `Exportación ${format.toUpperCase()} generada correctamente`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al exportar datos"));
    }
  };

  const stats = dashboard || {
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    recentSales: [],
  };

  const statCards = [
    {
      label: "Ventas Totales",
      value: stats.totalSales.toLocaleString("es-CO"),
      icon: ShoppingCart,
      accent: "primary",
    },
    {
      label: "Ingresos",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      accent: "terracotta",
    },
    {
      label: "Productos",
      value: stats.totalProducts.toLocaleString("es-CO"),
      icon: Package,
      accent: "primary",
    },
    {
      label: "Clientes",
      value: stats.totalCustomers.toLocaleString("es-CO"),
      icon: Users,
      accent: "terracotta",
    },
  ] as const;

  // LoadingSpinner hoisted to module level as LOADING_SPINNER

  return (
    <DashboardLayout>
      <div className="space-y-5 lg:space-y-7">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-primary shrink-0" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Reportes
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-4">
            Analiza el rendimiento de tu negocio
          </p>
        </div>

        {/* Date Filter */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {/* Quick selects */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/30">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-0.5">
              Período
            </span>
            <button
              onClick={setToday}
              className="h-7 px-3 rounded-lg text-xs font-semibold bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              Hoy
            </button>
            <button
              onClick={setThisWeek}
              className="h-7 px-3 rounded-lg text-xs font-semibold bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all whitespace-nowrap"
            >
              Esta semana
            </button>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="ml-auto flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 transition-colors"
              >
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>
          {/* Custom date range */}
          <div className="flex items-center gap-2 px-4 py-3 flex-wrap sm:flex-nowrap">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Desde
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 min-w-[130px] h-9 px-3 rounded-lg border border-border/60 bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors cursor-pointer"
            />
            <span className="text-muted-foreground/40 font-mono hidden sm:block">
              →
            </span>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Hasta
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 min-w-[130px] h-9 px-3 rounded-lg border border-border/60 bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors cursor-pointer"
            />
            {startDate && endDate && (
              <div className="shrink-0 h-9 flex items-center px-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xs font-bold text-primary font-mono">
                  {Math.max(
                    1,
                    Math.round(
                      (new Date(endDate).getTime() -
                        new Date(startDate).getTime()) /
                        (1000 * 60 * 60 * 24) +
                        1,
                    ),
                  )}
                  d
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {statCards.map((card) => {
            const Icon = card.icon;
            const isPrimary = card.accent === "primary";
            return (
              <div
                key={card.label}
                className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r ${isPrimary ? "from-primary to-primary/0" : "from-terracotta to-terracotta/0"}`}
                />
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isPrimary ? "bg-primary/10" : "bg-terracotta/10"}`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isPrimary ? "text-primary" : "text-terracotta"}`}
                    />
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="stat-number text-2xl lg:text-3xl font-bold text-foreground leading-none">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* Payment Methods */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
            <div className="px-5 py-4 border-b border-border/60">
              <h3 className="text-sm font-semibold text-foreground">
                Ventas por Método de Pago
              </h3>
            </div>
            <div className="p-5">
              {paymentLoading ? LOADING_SPINNER : paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const totalCount = paymentMethods.reduce(
                      (sum, p) => sum + p.count,
                      0,
                    );
                    return paymentMethods.map((item) => {
                      const pct =
                        totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                      const label =
                        item.paymentMethod === "CASH"
                          ? "Efectivo"
                          : item.paymentMethod === "CARD"
                          ? "Tarjeta"
                          : "Transferencia";
                      return (
                        <div key={item.paymentMethod}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-foreground">
                              {label}
                            </span>
                            <span className="stat-number text-sm font-bold text-primary">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                          <div className="w-full bg-border/60 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/60 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{item.count} ventas</span>
                            <span>{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay datos disponibles
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-terracotta via-terracotta/40 to-transparent" />
            <div className="px-5 py-4 border-b border-border/60">
              <h3 className="text-sm font-semibold text-foreground">
                Ventas por Categoría
              </h3>
            </div>
            <div className="p-5">
              {categoryLoading ? LOADING_SPINNER : salesByCategory && salesByCategory.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const totalAmount = salesByCategory.reduce(
                      (sum, c) => sum + c.total,
                      0,
                    );
                    return salesByCategory.map((item) => {
                      const pct =
                        totalAmount > 0 ? (item.total / totalAmount) * 100 : 0;
                      return (
                        <div key={item.category}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-foreground">
                              {item.category}
                            </span>
                            <span className="stat-number text-sm font-bold text-terracotta">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                          <div className="w-full bg-border/60 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-terracotta to-terracotta/60 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.quantity} productos vendidos
                          </p>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay datos disponibles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rankings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* Top Products */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Productos Más Vendidos
              </h3>
            </div>
            <div className="p-5">
              {topProductsLoading ? LOADING_SPINNER : topProducts && topProducts.length > 0 ? (
                <div className="space-y-2.5">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-primary/[0.03] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {product.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} vendidos · stock: {product.stock}
                        </p>
                      </div>
                      <span className="stat-number text-sm font-bold text-terracotta shrink-0">
                        {formatCurrency(product.total)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay datos disponibles
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-terracotta via-terracotta/40 to-transparent" />
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
              <Users className="w-4 h-4 text-terracotta" />
              <h3 className="text-sm font-semibold text-foreground">
                Top Clientes
              </h3>
            </div>
            <div className="p-5">
              {customerLoading ? LOADING_SPINNER : customerStats?.topCustomers &&
                customerStats.topCustomers.length > 0 ? (
                <div className="space-y-2.5">
                  {customerStats.topCustomers.map((customer, index) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-primary/[0.03] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-terracotta">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {customer.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.totalSales} compras
                        </p>
                      </div>
                      <span className="stat-number text-sm font-bold text-primary shrink-0">
                        {formatCurrency(customer.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay datos disponibles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
          <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Exportar Datos
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "sales", label: "Ventas" },
                { key: "products", label: "Productos" },
                { key: "customers", label: "Clientes" },
                { key: "inventory", label: "Inventario" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="p-4 rounded-xl bg-muted/30 border border-border/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                    {label}
                  </p>
                  <div className="flex gap-1.5">
                    {["pdf", "excel", "csv"].map((format) => (
                      <Button
                        key={format}
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleExport(
                            key as
                              | "sales"
                              | "products"
                              | "customers"
                              | "inventory",
                            format as "pdf" | "excel" | "csv",
                          )
                        }
                        className="flex-1 text-xs font-mono"
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ImportSection />
      </div>
    </DashboardLayout>
  );
}
