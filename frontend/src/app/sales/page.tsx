"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSales } from "@/hooks/useSales";
import { printInvoice } from "@/hooks/useInvoice";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Eye,
  FileText,
  DollarSign,
  X,
  Download,
  CreditCard,
  Smartphone,
  Receipt,
} from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  cn,
  getBogotaDateInputValue,
  shiftDateInputValue,
} from "@/lib/utils";
import type { Sale } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";

export default function SalesPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const setToday = () => {
    const today = getBogotaDateInputValue();
    setPage(1);
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeek = () => {
    const today = getBogotaDateInputValue();
    setPage(1);
    setStartDate(shiftDateInputValue(today, -6));
    setEndDate(today);
  };

  const { data, isLoading } = useSales({
    page,
    limit: 10,
    status: status || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search.trim() || undefined,
  });
  const sales = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1);
    }
  }, [meta, page]);

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handlePrintInvoice = async (saleId: string) => {
    try {
      await printInvoice(saleId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al generar la factura"));
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "COMPLETED":
        return <Badge variant="success">Completada</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelada</Badge>;
      case "RETURNED_PARTIAL":
        return <Badge variant="warning">Parcial</Badge>;
      default:
        return <Badge variant="default">{s}</Badge>;
    }
  };

  const getPaymentBadge = (
    payments?: Array<{ method: string; amount: number }>,
  ) => {
    if (!payments || payments.length === 0)
      return <Badge variant="secondary">Sin pago</Badge>;
    if (payments.length > 1)
      return (
        <Badge variant="default">
          <FileText className="w-3 h-3 mr-1" />
          Mixto
        </Badge>
      );
    const m = payments[0].method;
    const icon =
      {
        CASH: <DollarSign className="w-3 h-3 mr-1" />,
        CARD: <CreditCard className="w-3 h-3 mr-1" />,
        TRANSFER: <Smartphone className="w-3 h-3 mr-1" />,
      }[m] || null;
    const label =
      { CASH: "Efectivo", CARD: "Tarjeta", TRANSFER: "Transferencia" }[m] || m;
    return (
      <Badge variant="default">
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">
          {m === "CASH" ? "Efec" : m === "CARD" ? "Tarj" : "Trans"}
        </span>
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 lg:space-y-7">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-primary shrink-0" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Ventas
            </h1>
            {meta && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {meta.total} registros
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground ml-4">
            Historial de transacciones
          </p>
        </div>

        {/* Filter Bar */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-stretch flex-wrap sm:flex-nowrap">
            {/* Search */}
            <div className="relative w-full sm:flex-1 sm:min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Buscar por N° o cliente..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full h-11 pl-10 pr-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-b sm:border-b-0 border-border/60"
              />
            </div>
            {/* Divider */}
            <div className="hidden sm:block w-px bg-border/60 self-stretch my-2 shrink-0" />
            {/* Status tabs */}
            <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
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
                    setPage(1);
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="ml-auto flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 transition-colors"
                >
                  <X className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
                <Receipt className="w-4 h-4 text-primary/50" />
              </div>
              <p className="text-xs text-muted-foreground">
                Cargando ventas...
              </p>
            </div>
          </div>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="card-top-rail card-top-rail--primary" />
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px]">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40">
                        <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          N° Venta
                        </th>
                        <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Cliente
                        </th>
                        <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Método
                        </th>
                        <th className="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Estado
                        </th>
                        <th className="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Total
                        </th>
                        <th className="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-14">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-muted-foreground/30" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                No hay ventas registradas
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sales.map((sale) => (
                          <tr
                            key={sale.id}
                            className="border-b border-border/40 transition-colors hover:bg-primary/[0.03] last:border-b-0"
                          >
                            <td className="py-3 px-5">
                              <span className="text-xs font-bold text-primary font-mono">
                                #{sale.saleNumber}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-xs text-muted-foreground whitespace-nowrap font-mono">
                              {formatDateTime(sale.createdAt)}
                            </td>
                            <td className="py-3 px-5 max-w-[130px] truncate">
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
                              {getPaymentBadge(sale.payments)}
                            </td>
                            <td className="py-3 px-5">
                              {getStatusBadge(sale.status)}
                            </td>
                            <td className="py-3 px-5 text-right">
                              <span className="stat-number text-sm font-bold text-foreground">
                                {formatCurrency(sale.total)}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewDetails(sale)}
                                  className="p-1.5 h-7 w-7"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePrintInvoice(sale.id)}
                                  className="p-1.5 h-7 w-7"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
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
                <span className="text-xs text-muted-foreground px-2">
                  {page} / {meta.totalPages}
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Detalles — Venta #${selectedSale?.saleNumber}`}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Cliente",
                  value: selectedSale.customer?.name || "Cliente General",
                },
                {
                  label: "Fecha",
                  value: formatDateTime(selectedSale.createdAt),
                },
                {
                  label: "Estado",
                  value: getStatusBadge(selectedSale.status),
                  isNode: true,
                },
              ].map(({ label, value, isNode }) => (
                <div
                  key={label}
                  className="p-3 rounded-lg bg-muted/40 border border-border/50"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {label}
                  </p>
                  {isNode ? (
                    value
                  ) : (
                    <p className="text-sm font-semibold text-foreground">
                      {value as string}
                    </p>
                  )}
                </div>
              ))}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Método de Pago
                </p>
                <div className="text-sm font-semibold text-foreground">
                  {selectedSale.payments?.length
                    ? selectedSale.payments.map((p, i) => (
                        <div key={i} className="text-xs">
                          {{
                            CASH: "Efectivo",
                            CARD: "Tarjeta",
                            TRANSFER: "Transferencia",
                          }[p.method] || p.method}
                          : {formatCurrency(p.amount)}
                        </div>
                      ))
                    : "Sin pago"}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Items
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
                {selectedSale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.product?.name || "Producto eliminado"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <span className="stat-number text-sm font-bold text-foreground ml-4">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 space-y-2">
              {[
                {
                  label: "Subtotal",
                  value: formatCurrency(selectedSale.subtotal),
                },
                {
                  label: "Impuestos",
                  value: formatCurrency(selectedSale.taxAmount),
                },
                ...(selectedSale.discountAmount > 0
                  ? [
                      {
                        label: "Descuento",
                        value: `-${formatCurrency(selectedSale.discountAmount)}`,
                        accent: true,
                      },
                    ]
                  : []),
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span
                    className={`font-medium ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <span className="font-bold text-foreground">Total</span>
                <span className="stat-number text-xl font-bold text-primary">
                  {formatCurrency(selectedSale.total)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handlePrintInvoice(selectedSale.id)}>
                <Download className="w-4 h-4" /> Descargar Factura
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
