"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import type { CustomerPayload } from "@/hooks/useCustomers";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  Pencil,
} from "lucide-react";
import type { Customer } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";

const segmentConfig: Record<string, { variant: "success" | "warning" | "default" | "danger"; label: string; color: string }> = {
  VIP:       { variant: "success", label: "VIP",       color: "#10b981" },
  FREQUENT:  { variant: "warning", label: "Frecuente", color: "#f59e0b" },
  OCCASIONAL:{ variant: "default", label: "Ocasional", color: "#64748b" },
  INACTIVE:  { variant: "danger",  label: "Inactivo",  color: "#ef4444" },
};

function CustomerAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-primary" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
        {initials}
      </span>
    </div>
  );
}

export default function CustomersPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canCreate = user?.role === "ADMIN" || user?.role === "CASHIER";
  const canEdit = user?.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerPayload>({});

  const { data, isLoading } = useCustomers({ page, limit: 20, search: search || undefined, segment: segment || undefined });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const customers = data?.data ?? [];
  const meta = data?.meta;

  const handleEdit = (customer: Customer) => {
    if (!canEdit) return;
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      segment: customer.segment,
      active: customer.active,
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!canCreate) return;
    setEditingCustomer(null);
    setFormData({ name: "", documentType: "CC", documentNumber: "", email: "", phone: "", address: "", segment: "OCCASIONAL" });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    setCustomerToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer.mutateAsync(customerToDelete);
        toast.success("Cliente eliminado correctamente");
        setShowConfirmModal(false);
        setCustomerToDelete(null);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "No se pudo eliminar el cliente"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, data: formData });
        toast.success("Cliente actualizado correctamente");
      } else {
        await createCustomer.mutateAsync(formData);
        toast.success("Cliente creado correctamente");
      }
      setShowModal(false);
      setFormData({});
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al guardar el cliente"));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 lg:space-y-7">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full bg-accent shrink-0" />
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clientes</h1>
              {meta && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                  {meta.total} registros
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground ml-4">Gestiona tu cartera de clientes</p>
          </div>
          {canCreate && (
            <Button onClick={handleCreate} className="w-full sm:w-auto shrink-0">
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-stretch flex-wrap sm:flex-nowrap">
            {/* Search */}
            <div className="relative w-full sm:flex-1 sm:min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Buscar clientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-b sm:border-b-0 border-border/60"
              />
            </div>
            {/* Divider */}
            <div className="hidden sm:block w-px bg-border/60 self-stretch my-2 shrink-0" />
            {/* Segment tabs */}
            <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
              {[
                { value: "", label: "Todos", active: "bg-primary text-white shadow-sm shadow-primary/20", inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/60" },
                { value: "VIP", label: "VIP", active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30", inactive: "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5" },
                { value: "FREQUENT", label: "Frecuente", active: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30", inactive: "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/5" },
                { value: "OCCASIONAL", label: "Ocasional", active: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30", inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/60" },
                { value: "INACTIVE", label: "Inactivo", active: "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30", inactive: "text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5" },
              ].map(({ value, label, active, inactive }) => (
                <button
                  key={value}
                  onClick={() => setSegment(value)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                    segment === value ? active : inactive
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center animate-pulse">
                <Users className="w-4 h-4 text-accent/50" />
              </div>
              <p className="text-xs text-muted-foreground">Cargando clientes...</p>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-64 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No hay clientes</p>
            <p className="text-xs text-muted-foreground">Agrega tu primer cliente</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 stagger-children">
              {customers.map((customer) => {
                const seg = segmentConfig[customer.segment] || segmentConfig.OCCASIONAL;
                return (
                  <div
                    key={customer.id}
                    className={cn(
                      "group rounded-xl border border-border/60 bg-card p-4 transition-all duration-200",
                      "hover:border-primary/25 hover:shadow-md hover:shadow-primary/5",
                      canEdit && "cursor-pointer"
                    )}
                    onClick={canEdit ? () => handleEdit(customer) : undefined}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CustomerAvatar name={customer.name} />
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{customer.name}</h3>
                          <Badge variant={seg.variant} className="mt-0.5 text-[10px]">{seg.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {canEdit && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono shrink-0">{customer.documentType}</span>
                        <span className="text-foreground font-medium">{customer.documentNumber}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-xs text-muted-foreground px-2">{page} / {meta.totalPages}</span>
                <Button variant="secondary" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={canCreate && showModal} onClose={() => setShowModal(false)} title={editingCustomer ? "Editar Cliente" : "Nuevo Cliente"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="sm:col-span-2" />
            <Select label="Tipo de Documento" value={formData.documentType || "CC"} onChange={(e) => setFormData({ ...formData, documentType: e.target.value })} options={[{ value: "CC", label: "Cédula de Ciudadanía" }, { value: "NIT", label: "NIT" }, { value: "CE", label: "Cédula de Extranjería" }, { value: "TI", label: "Tarjeta de Identidad" }]} required />
            <Input label="Número de Documento" value={formData.documentNumber || ""} onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })} required />
            <Input label="Email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="sm:col-span-2" />
            <Input label="Teléfono" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <Input label="Dirección" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <Select label="Segmento" value={formData.segment || "OCCASIONAL"} onChange={(e) => setFormData({ ...formData, segment: e.target.value as Customer["segment"] })} options={[{ value: "OCCASIONAL", label: "Ocasional" }, { value: "FREQUENT", label: "Frecuente" }, { value: "VIP", label: "VIP" }, { value: "INACTIVE", label: "Inactivo" }]} required />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/60">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" loading={createCustomer.isPending || updateCustomer.isPending} className="w-full sm:w-auto">{editingCustomer ? "Actualizar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={canEdit && showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmDelete} title="Eliminar Cliente" message="¿Estás seguro? Esta acción no se puede deshacer." confirmText="Eliminar" cancelText="Cancelar" />
    </DashboardLayout>
  );
}
