"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useUsers, useCreateUser } from "@/hooks/useUsers";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Settings as SettingsIcon,
  Building2,
  FileText,
  Users as UsersIcon,
  Plus,
  Trash2,
  Shield,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function SettingsPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const createUser = useCreateUser();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    currency: "COP",
    taxRate: 19,
    receiptPrefix: "REC-",
    printHeader: "",
    printFooter: "",
    logoUrl: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER" as "ADMIN" | "CASHIER" | "INVENTORY_USER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al guardar la configuración"));
    }
  };

  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", logoFile);
    try {
      const response = await api.postWithFormData<{ logoUrl: string }>("/settings/logo", formDataUpload);
      setFormData({ ...formData, logoUrl: response.data.logoUrl });
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Logo subido correctamente");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al subir el logo"));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSettings.mutateAsync({ ...formData, logoUrl: "" });
      setLogoPreview(null);
      toast.success("Logo eliminado correctamente");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al eliminar el logo"));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(userFormData);
      toast.success("Usuario creado correctamente");
      setShowUserModal(false);
      setUserFormData({ name: "", email: "", password: "", role: "CASHIER" });
      refetchUsers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al crear el usuario"));
    }
  };

  const handleDeleteUser = (userId: string) => { setUserToDelete(userId); setShowDeleteModal(true); };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/auth/users/${userToDelete}`);
      toast.success("Usuario eliminado correctamente");
      setShowDeleteModal(false);
      setUserToDelete(null);
      refetchUsers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al eliminar el usuario"));
    }
  };

  const toggleUserActive = async (userId: string) => {
    try {
      await api.put(`/auth/users/${userId}/toggle-active`, {});
      refetchUsers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Error al actualizar el estado del usuario"));
    }
  };

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        companyName: settings.companyName,
        currency: settings.currency,
        taxRate: Number(settings.taxRate),
        receiptPrefix: settings.receiptPrefix,
        printHeader: settings.printHeader || "",
        printFooter: settings.printFooter || "",
        logoUrl: settings.logoUrl || "",
      });
      if (settings.logoUrl) setLogoPreview(settings.logoUrl);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <SettingsIcon className="w-5 h-5 text-primary/50" />
            </div>
            <p className="text-xs text-muted-foreground">Cargando configuración...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    CASHIER: "Cajero",
    INVENTORY_USER: "Inventario",
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 lg:space-y-7 max-w-3xl">

        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-primary shrink-0" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configuración</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-4">Ajusta la configuración del sistema</p>
        </div>

        {/* General Settings */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="card-top-rail card-top-rail--primary" />
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Configuración General</h3>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre de la Empresa" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required className="sm:col-span-2" />
                <Input label="Moneda" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} required />
                <Input label="Tasa de Impuesto (%)" type="number" step="0.01" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })} required />
                <Input label="Prefijo de Comprobante" value={formData.receiptPrefix} onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })} required className="sm:col-span-2" />
              </div>

              {/* Logo Section */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-accent" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">Logo del Negocio</h4>
                </div>
                <div className="space-y-3">
                  {(logoPreview || formData.logoUrl) && (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-muted/50 rounded-xl border border-border/60 flex items-center justify-center overflow-hidden">
                        <Image src={logoPreview || formData.logoUrl} alt="Logo" fill sizes="64px" className="object-contain" />
                      </div>
                      <Button type="button" variant="danger" size="sm" onClick={handleRemoveLogo}>
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar Logo
                      </Button>
                    </div>
                  )}
                  <div>
                    <input type="file" id="logo" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    <Button type="button" variant="secondary" size="sm" onClick={() => (document.getElementById("logo") as HTMLInputElement)?.click()}>
                      <Upload className="w-3.5 h-3.5" />
                      {logoFile ? logoFile.name : "Seleccionar Logo"}
                    </Button>
                  </div>
                  {logoFile && (
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={handleLogoUpload}><Upload className="w-3.5 h-3.5" /> Subir Logo</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => { setLogoFile(null); setLogoPreview(formData.logoUrl); }}>Cancelar</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Print Settings */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-accent" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">Configuración de Impresión</h4>
                </div>
                <div className="space-y-4">
                  <Input label="Encabezado de Impresión" value={formData.printHeader} onChange={(e) => setFormData({ ...formData, printHeader: e.target.value })} textarea rows={3} placeholder="Información que aparecerá en el encabezado de los recibos" />
                  <Input label="Pie de Página de Impresión" value={formData.printFooter} onChange={(e) => setFormData({ ...formData, printFooter: e.target.value })} textarea rows={3} placeholder="Información que aparecerá al pie de los recibos" />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border/60">
                <Button type="submit" loading={updateSettings.isPending}>Guardar Configuración</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Card */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="card-top-rail card-top-rail--accent" />
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Vista Previa del Recibo</h3>
          </div>
          <div className="p-5">
            <div className="bg-muted/30 rounded-xl p-5 border border-border/40 space-y-3 max-w-xs mx-auto font-mono">
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{formData.companyName || "Nombre empresa"}</p>
                {formData.printHeader && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{formData.printHeader}</p>}
              </div>
              <div className="border-t border-dashed border-border/60 pt-3 space-y-1.5">
                {[
                  { k: "Impuesto", v: `${formData.taxRate}%` },
                  { k: "Moneda", v: formData.currency },
                  { k: "Prefijo", v: formData.receiptPrefix },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}:</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              {formData.printFooter && (
                <div className="border-t border-dashed border-border/60 pt-3">
                  <p className="text-xs text-muted-foreground text-center whitespace-pre-line">{formData.printFooter}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users Management */}
        {currentUser?.role === "ADMIN" && (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="card-top-rail card-top-rail--primary" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UsersIcon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Gestión de Usuarios</h3>
              </div>
              <Button size="sm" onClick={() => setShowUserModal(true)}>
                <Plus className="w-3.5 h-3.5" /> Nuevo
              </Button>
            </div>
            <div className="p-5">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
                    <UsersIcon className="w-4 h-4 text-primary/50" />
                  </div>
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-2.5">
                  {users.map((user) => {
                    const initials = user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/40 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Badge variant="default" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {roleLabel[user.role] || user.role}
                          </Badge>
                          <Badge variant={user.active ? "success" : "danger"} className="text-xs">
                            {user.active ? "Activo" : "Inactivo"}
                          </Badge>
                          <Button size="sm" variant="secondary" onClick={() => toggleUserActive(user.id)} disabled={user.id === currentUser?.id} className="text-xs h-7">
                            {user.active ? "Desact." : "Activar"}
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.id)} className="p-1.5 h-7 w-7">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Crear Nuevo Usuario" size="lg">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Nombre Completo" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} required />
          <Input label="Correo Electrónico" type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} required />
          <Input label="Contraseña" type="password" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} required minLength={6} />
          <Select
            label="Rol"
            value={userFormData.role}
            onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as "ADMIN" | "CASHIER" | "INVENTORY_USER" })}
            options={[
              { value: "CASHIER", label: "Cajero" },
              { value: "INVENTORY_USER", label: "Usuario de Inventario" },
              { value: "ADMIN", label: "Administrador" },
            ]}
            required
          />
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/60">
            <Button type="button" variant="secondary" onClick={() => setShowUserModal(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" loading={createUser.isPending} className="w-full sm:w-auto">Crear Usuario</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  );
}
