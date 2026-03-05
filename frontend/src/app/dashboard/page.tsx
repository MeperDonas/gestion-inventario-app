"use client";

import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard } from "@/hooks/useReports";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const { user } = useAuth();

  const todayFormatted = useMemo(
    () => new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }),
    []
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <LayoutDashboard className="w-5 h-5 text-primary/50" />
            </div>
            <p className="text-xs text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboard || {
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    recentSales: [],
  };

  const recentSales = useMemo(
    () =>
      stats.recentSales.map((sale) => ({
        ...sale,
        formattedDate: new Date(sale.createdAt).toLocaleDateString("es-CO"),
      })),
    [stats.recentSales],
  );

  const cards = [
    { label: "Ventas Totales",    value: stats.totalSales.toLocaleString("es-CO"),   icon: ShoppingCart, accent: "primary",    trend: "+12%" },
    { label: "Ingresos Totales",  value: formatCurrency(stats.totalRevenue),          icon: TrendingUp,   accent: "terracotta", trend: "+8%"  },
    { label: "Productos",         value: stats.totalProducts.toLocaleString("es-CO"), icon: Package,      accent: "primary",    trend: null   },
    { label: "Clientes",          value: stats.totalCustomers.toLocaleString("es-CO"),icon: Users,        accent: "terracotta", trend: "+5%"  },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6 lg:space-y-8">

        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-primary shrink-0" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Bienvenido, {user?.name?.split(" ")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <p className="text-sm text-muted-foreground">Resumen general del negocio</p>
            <span className="hidden sm:inline text-xs text-muted-foreground/50 font-mono">
              {todayFormatted}
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {cards.map((card) => {
            const Icon = card.icon;
            const isPrimary = card.accent === "primary";
            return (
              <div
                key={card.label}
                className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
              >
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r ${isPrimary ? "from-primary to-primary/0" : "from-terracotta to-terracotta/0"}`} />

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isPrimary ? "bg-primary/10" : "bg-terracotta/10"}`}>
                    <Icon className={`w-4 h-4 ${isPrimary ? "text-primary" : "text-terracotta"}`} />
                  </div>
                  {card.trend && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="w-3 h-3" />
                      {card.trend}
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{card.label}</p>
                <p className="stat-number text-2xl lg:text-3xl font-bold text-foreground leading-none">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockProducts > 0 && (
          <div
            className="flex items-center gap-4 px-5 py-4 rounded-xl border animate-fade-in"
            style={{ backgroundColor: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.22)" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,158,11,0.12)" }}>
              <AlertTriangle className="w-4 h-4 text-terracotta" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {stats.lowStockProducts} producto{stats.lowStockProducts !== 1 ? "s" : ""} con stock bajo
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Revisa el inventario para reponer existencias</p>
            </div>
            <a href="/inventory" className="shrink-0 text-xs font-semibold text-terracotta hover:underline whitespace-nowrap">
              Ver inventario →
            </a>
          </div>
        )}

        {/* Recent Sales */}
        <div className="animate-fade-in rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <h3 className="text-base font-semibold text-foreground">Ventas Recientes</h3>
            {recentSales.length > 0 && (
              <Badge variant="secondary">{recentSales.length}</Badge>
            )}
          </div>
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <ShoppingCart className="w-5 h-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">N° Venta</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                    <th className="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border/40 last:border-b-0 transition-colors hover:bg-primary/[0.03]">
                      <td className="py-3 px-5">
                        <span className="text-xs font-bold text-primary font-mono">#{sale.saleNumber}</span>
                      </td>
                      <td className="py-3 px-5 text-sm text-foreground max-w-[150px] truncate">
                        {sale.customer?.name || <span className="text-muted-foreground text-xs">General</span>}
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-xs text-muted-foreground">{sale.items.length} item{sale.items.length !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="stat-number text-sm font-bold text-foreground">{formatCurrency(sale.total)}</span>
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
