"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSales, useUpdateSaleStatus } from "@/hooks/useSales";
import { printInvoice } from "@/hooks/useInvoice";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Eye,
  XCircle,
  FileText,
  DollarSign,
  X,
  Download,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Sale } from "@/types";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data, isLoading } = useSales({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
  });

  const updateSaleStatus = useUpdateSaleStatus();

  const sales = data?.data ?? [];
  const meta = data?.meta;

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleCancelSale = async (saleId: string) => {
    if (confirm("¿Estás seguro de cancelar esta venta?")) {
      try {
        await updateSaleStatus.mutateAsync({
          id: saleId,
          status: "CANCELLED",
        });
        alert("Venta cancelada exitosamente");
      } catch {
        alert("Error al cancelar la venta");
      }
    }
  };

  const handlePrintInvoice = async (saleId: string) => {
    try {
      await printInvoice(saleId);
    } catch {
      alert("Error al generar la factura");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completada</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelada</Badge>;
      case "RETURNED_PARTIAL":
        return <Badge variant="warning">Parcialmente Devuelta</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (payments?: Array<{ method: string; amount: number }>) => {
    if (!payments || payments.length === 0) {
      return (
        <Badge variant="secondary">
          Sin pago
        </Badge>
      );
    }

    if (payments.length === 1) {
      const method = payments[0].method;
      const icons = {
        CASH: <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />,
        CARD: <CreditCard className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />,
        TRANSFER: <Smartphone className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />,
      };
      const labels = {
        CASH: "Efectivo",
        CARD: "Tarjeta",
        TRANSFER: "Transferencia",
      };
      return (
        <Badge variant="default" className="text-xs">
          {icons[method as keyof typeof icons] || null}
          <span className="hidden sm:inline">{labels[method as keyof typeof labels] || method}</span>
          <span className="sm:hidden">{method === "CASH" ? "Efec" : method === "CARD" ? "Tarj" : "Trans"}</span>
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="text-xs">
        <FileText className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
        <span className="hidden sm:inline">Mixto ({payments.length})</span>
        <span className="sm:hidden">Mix</span>
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            Ventas
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Historial de transacciones
          </p>
        </div>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar ventas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full sm:w-44"
                  options={[
                    { value: "", label: "Todos los estados" },
                    { value: "COMPLETED", label: "Completadas" },
                    { value: "CANCELLED", label: "Canceladas" },
                    { value: "RETURNED_PARTIAL", label: "Parcialmente Devueltas" },
                  ]}
                />
                {status && (
                  <Button
                    variant="ghost"
                    onClick={() => setStatus("")}
                    className="w-full sm:w-24"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          N° Venta
                        </th>
                        <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          Cliente
                        </th>
                        <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          Método
                        </th>
                        <th className="text-left py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          Estado
                        </th>
                        <th className="text-right py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          Total
                        </th>
                        <th className="text-right py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm font-semibold text-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-muted-foreground">
                            No hay ventas registradas
                          </td>
                        </tr>
                      ) : (
                        sales.map((sale) => (
                          <tr
                            key={sale.id}
                            className="border-b border-border hover:bg-terracotta/5 transition-colors"
                          >
                            <td className="py-3 px-4 lg:py-4 lg:px-6">
                              <span className="font-semibold text-foreground text-sm">
                                #{sale.saleNumber}
                              </span>
                            </td>
                            <td className="py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm text-foreground whitespace-nowrap">
                              {formatDateTime(sale.createdAt)}
                            </td>
                            <td className="py-3 px-4 lg:py-4 lg:px-6 text-xs lg:text-sm text-foreground max-w-[120px] lg:max-w-[150px] truncate">
                              {sale.customer ? sale.customer.name : "Cliente General"}
                            </td>
                            <td className="py-3 px-4 lg:py-4 lg:px-6">
                              {getPaymentMethodBadge(sale.payments)}
                            </td>
                            <td className="py-3 px-4 lg:py-4 lg:px-6">
                              {getStatusBadge(sale.status)}
                            </td>
                            <td className="py-3 px-4 lg:py-4 lg:px-6 text-right font-bold text-foreground text-sm">
                              {formatCurrency(sale.total)}
                            </td>
                            <td className="py-3 px-4 lg:py-4 lg:px-6 text-right">
                              <div className="flex items-center justify-end gap-1 lg:gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleViewDetails(sale)}
                                  className="p-2 lg:px-3"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePrintInvoice(sale.id)}
                                  title="Descargar factura"
                                  className="p-2 lg:px-3"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {sale.status === "COMPLETED" && (
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleCancelSale(sale.id)}
                                    disabled={updateSaleStatus.isPending}
                                    className="p-2 lg:px-3"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {meta.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Detalles de Venta #${selectedSale?.saleNumber}`}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                <p className="font-semibold text-foreground">
                  {selectedSale.customer ? selectedSale.customer.name : "Cliente General"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                <p className="font-semibold text-foreground">
                  {formatDateTime(selectedSale.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Método de Pago</p>
                <div className="font-semibold text-foreground">
                  {selectedSale.payments && selectedSale.payments.length > 0 ? (
                    <div className="space-y-1">
                      {selectedSale.payments.map((payment, index) => {
                        const labels = {
                          CASH: "Efectivo",
                          CARD: "Tarjeta",
                          TRANSFER: "Transferencia",
                        };
                        return (
                          <div key={index} className="text-sm">
                            {labels[payment.method as keyof typeof labels] || payment.method}: {formatCurrency(payment.amount)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    "Sin pago"
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estado</p>
                {getStatusBadge(selectedSale.status)}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Items</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedSale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.product?.name || "Producto eliminado"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground ml-4">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(selectedSale.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(selectedSale.taxAmount)}
                </span>
              </div>
              {selectedSale.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span className="font-medium">
                    -{formatCurrency(selectedSale.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCurrency(selectedSale.total)}</span>
              </div>
              {selectedSale.amountPaid && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagado</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(selectedSale.amountPaid)}
                    </span>
                  </div>
                  {selectedSale.change !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cambio</span>
                      <span className="font-bold text-terracotta">
                        {formatCurrency(selectedSale.change)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handlePrintInvoice(selectedSale.id)}
                variant="primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Factura
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
