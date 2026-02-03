"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import {
  Search,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const { data, isLoading } = useCustomers({
    page,
    limit: 20,
    search: search || undefined,
    segment: segment || undefined,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.data ?? [];
  const meta = data?.meta;

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      documentType: "CC",
      documentNumber: "",
      email: "",
      phone: "",
      address: "",
      segment: "OCCASIONAL",
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer.mutateAsync(customerToDelete);
      setShowConfirmModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          id: editingCustomer.id,
          data: formData,
        });
      } else {
        await createCustomer.mutateAsync(formData as Customer);
      }
      setShowModal(false);
      setFormData({});
    } catch {
      alert("Error al guardar el cliente");
    }
  };

  const getSegmentBadge = (segment: string) => {
    const variants: Record<string, "success" | "warning" | "default" | "danger"> = {
      VIP: "success",
      FREQUENT: "warning",
      OCCASIONAL: "default",
      INACTIVE: "danger",
    };
    return <Badge variant={variants[segment] || "default"}>{segment}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
              Clientes
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Gestiona tu cartera de clientes
            </p>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full sm:w-44"
                  options={[
                    { value: "", label: "Todos los segmentos" },
                    { value: "VIP", label: "VIP" },
                    { value: "FREQUENT", label: "Frecuentes" },
                    { value: "OCCASIONAL", label: "Ocasionales" },
                    { value: "INACTIVE", label: "Inactivos" },
                  ]}
                />
                {segment && (
                  <Button
                    variant="ghost"
                    onClick={() => setSegment("")}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {customers.map((customer) => (
                <Card
                  key={customer.id}
                  className="hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleEdit(customer)}
                >
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary to-terracotta flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                            {customer.name}
                          </h3>
                          {getSegmentBadge(customer.segment)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(customer.id);
                        }}
                        className="p-2 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground truncate">
                          {customer.documentType}: {customer.documentNumber}
                        </span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground truncate">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground truncate">{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <Input
              label="Nombre"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="sm:col-span-2"
            />
            <Select
              label="Tipo de Documento"
              value={formData.documentType || "CC"}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              options={[
                { value: "CC", label: "Cédula de Ciudadanía" },
                { value: "NIT", label: "NIT" },
                { value: "CE", label: "Cédula de Extranjería" },
                { value: "TI", label: "Tarjeta de Identidad" },
              ]}
              required
            />
            <Input
              label="Número de Documento"
              value={formData.documentNumber || ""}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              label="Teléfono"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Dirección"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Select
              label="Segmento"
              value={formData.segment || "OCCASIONAL"}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value as "OCCASIONAL" | "FREQUENT" | "VIP" | "INACTIVE" })}
              options={[
                { value: "OCCASIONAL", label: "Ocasional" },
                { value: "FREQUENT", label: "Frecuente" },
                { value: "VIP", label: "VIP" },
                { value: "INACTIVE", label: "Inactivo" },
              ]}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createCustomer.isPending || updateCustomer.isPending}
              className="w-full sm:w-auto"
            >
              {editingCustomer ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  );
}
