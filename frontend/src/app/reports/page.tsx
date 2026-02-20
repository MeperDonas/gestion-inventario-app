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
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";

export default function ReportsPage() {
  const toast = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const setToday = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);
  };

  const setThisWeek = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    setStartDate(weekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const { data: dashboard } = useDashboard(
    startDate,
    endDate
  );
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
    format: "pdf" | "excel" | "csv"
  ) => {
    try {
      await api.exportData(`/exports/${type}`, {
        format,
        type,
        startDate,
        endDate,
      });
      toast.success(`Exportacion ${format.toUpperCase()} generada correctamente`);
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

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            Reportes
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Analiza el rendimiento de tu negocio
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtros de Fecha
            </h3>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-end">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={setToday}
                  className="whitespace-nowrap"
                >
                  Hoy
                </Button>
                <Button
                  variant="secondary"
                  onClick={setThisWeek}
                  className="whitespace-nowrap"
                >
                  Esta Semana
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full sm:w-auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full sm:w-auto"
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="whitespace-nowrap w-full sm:w-auto"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Total Ventas
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stats.totalSales}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Ingresos Totales
                  </p>
                  <p className="text-xl lg:text-3xl font-bold text-foreground truncate">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-terracotta" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Productos
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">
                    Clientes
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-terracotta" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-foreground">
                Ventas por Método de Pago
              </h3>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
              {paymentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((item) => (
                    <div key={item.paymentMethod}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.paymentMethod === "CASH"
                            ? "Efectivo"
                            : item.paymentMethod === "CARD"
                            ? "Tarjeta"
                            : "Transferencia"}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-terracotta h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / paymentMethods.reduce((sum, p) => sum + p.count, 0)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{item.count} ventas</span>
                        <span>{formatCurrency(item.subtotal)} subtotal</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos disponibles
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-foreground">
                Ventas por Categoría
              </h3>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
              {categoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : salesByCategory && salesByCategory.length > 0 ? (
                <div className="space-y-4">
                  {salesByCategory.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-terracotta">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-terracotta to-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.total / salesByCategory.reduce((sum, c) => sum + c.total, 0)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.quantity} productos vendidos
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-foreground">
                Productos Más Vendidos
              </h3>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
              {topProductsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : topProducts && topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs lg:text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} vendidos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-terracotta text-sm">
                          {formatCurrency(product.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos disponibles
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-foreground">
                Top Clientes
              </h3>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
              {customerLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : customerStats?.topCustomers &&
              customerStats.topCustomers.length > 0 ? (
                <div className="space-y-3">
                  {customerStats.topCustomers.map((customer, index) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-xs lg:text-sm font-bold text-terracotta">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {customer.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {customer.totalSales} compras
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-sm">
                          {formatCurrency(customer.totalRevenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">en compras</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground">
              Exportar Datos
            </h3>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "sales", label: "Ventas" },
                { key: "products", label: "Productos" },
                { key: "customers", label: "Clientes" },
                { key: "inventory", label: "Inventario" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <p className="text-sm font-medium mb-2 text-foreground">{label}</p>
                  <div className="flex gap-2">
                    {["pdf", "excel", "csv"].map((format) => (
                      <Button
                        key={format}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExport(key as "sales" | "products" | "customers" | "inventory", format as "pdf" | "excel" | "csv")}
                        className="flex-1 text-xs"
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
