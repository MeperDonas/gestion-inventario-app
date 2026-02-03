"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard } from "@/hooks/useReports";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { TrendingUp, Package, Users, ShoppingCart, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  return (
    <DashboardLayout>
      <div className="space-y-6 lg:space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Resumen general de tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Total Ventas
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stats.totalSales}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1 truncate">
                    Ingresos Totales
                  </p>
                  <p className="text-xl lg:text-3xl font-bold text-foreground truncate">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-terracotta" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Productos
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Clientes
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-terracotta" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {stats.lowStockProducts > 0 && (
          <Card className="border-yellow-500">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <h3 className="text-base lg:text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  Alerta de Stock Bajo
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm lg:text-base">
                Tienes <strong>{stats.lowStockProducts}</strong> productos con
                stock por debajo del nivel mínimo. Ve a{" "}
                <a
                  href="/inventory"
                  className="text-primary hover:underline font-medium"
                >
                  Inventario
                </a>{" "}
                para revisarlos.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground">
              Ventas Recientes
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground p-4 lg:p-6">
                No hay ventas registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs lg:text-sm font-medium text-muted-foreground">
                        N° Venta
                      </th>
                      <th className="text-left py-3 px-4 text-xs lg:text-sm font-medium text-muted-foreground">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-4 text-xs lg:text-sm font-medium text-muted-foreground">
                        Items
                      </th>
                      <th className="text-right py-3 px-4 text-xs lg:text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="text-right py-3 px-4 text-xs lg:text-sm font-medium text-muted-foreground">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border hover:bg-terracotta/5">
                        <td className="py-3 px-4 text-xs lg:text-sm font-medium text-foreground">
                          #{sale.saleNumber}
                        </td>
                        <td className="py-3 px-4 text-xs lg:text-sm text-foreground truncate max-w-[150px]">
                          {sale.customer?.name || "Cliente General"}
                        </td>
                        <td className="py-3 px-4 text-xs lg:text-sm text-foreground">
                          {sale.items.length} item(s)
                        </td>
                        <td className="py-3 px-4 text-xs lg:text-sm text-right font-semibold text-foreground">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="py-3 px-4 text-xs lg:text-sm text-right text-muted-foreground whitespace-nowrap">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
