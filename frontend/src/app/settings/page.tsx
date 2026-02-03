"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useUsers, useCreateUser } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Settings as SettingsIcon, Building2, FileText, Users as UsersIcon, Plus, Trash2, Shield, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function SettingsPage() {
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
    invoicePrefix: "INV-",
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
      alert("Configuración guardada exitosamente");
    } catch {
      alert("Error al guardar la configuración");
    }
  };

  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', logoFile);

    try {
      const response = await api.postWithFormData<{ logoUrl: string }>('/settings/logo', formDataUpload);

      setFormData({ ...formData, logoUrl: response.data.logoUrl });
      setLogoFile(null);
      setLogoPreview(null);
      alert("Logo subido exitosamente");
    } catch {
      alert("Error al subir el logo");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSettings.mutateAsync({ ...formData, logoUrl: "" });
      setLogoPreview(null);
      alert("Logo eliminado exitosamente");
    } catch {
      alert("Error al eliminar el logo");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser.mutateAsync(userFormData);
      alert("Usuario creado exitosamente");
      setShowUserModal(false);
      setUserFormData({
        name: "",
        email: "",
        password: "",
        role: "CASHIER",
      });
      refetchUsers();
    } catch {
      alert("Error al crear el usuario");
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/auth/users/${userToDelete}`);
      alert("Usuario eliminado exitosamente");
      setShowDeleteModal(false);
      setUserToDelete(null);
      refetchUsers();
    } catch {
      alert("Error al eliminar el usuario");
    }
  };

  const toggleUserActive = async (userId: string) => {
    try {
      await api.put(`/auth/users/${userId}/toggle-active`, {});
      refetchUsers();
    } catch {
      alert("Error al actualizar el estado del usuario");
    }
  };

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName,
        currency: settings.currency,
        taxRate: Number(settings.taxRate),
        invoicePrefix: settings.invoicePrefix,
        printHeader: settings.printHeader || "",
        printFooter: settings.printFooter || "",
        logoUrl: settings.logoUrl || "",
      });
      if (settings.logoUrl) {
        setLogoPreview(settings.logoUrl);
      }
    }
  }, [settings]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            Configuración
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Ajusta la configuración del sistema
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              Configuración General
            </h3>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <Input
                  label="Nombre de la Empresa"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                  className="sm:col-span-2"
                />
                <Input
                  label="Moneda"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  required
                />
                <Input
                  label="Tasa de Impuesto (%)"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxRate: Number(e.target.value),
                    })
                  }
                  required
                />
                <Input
                  label="Prefijo de Factura"
                  value={formData.invoicePrefix}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoicePrefix: e.target.value,
                    })
                  }
                  required
                  className="sm:col-span-2"
                />
              </div>

              <div className="pt-4 lg:pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-terracotta" />
                  Logo del Negocio
                </h4>
                <div className="space-y-4">
                  {(logoPreview || formData.logoUrl) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-background rounded-lg border border-border flex items-center justify-center overflow-hidden">
                        <img 
                          src={logoPreview || formData.logoUrl} 
                          alt="Logo del negocio" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="sm"
                        onClick={handleRemoveLogo}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Logo
                      </Button>
                    </div>
                  )}
                  
                  <div>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label htmlFor="logo" className="block cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={(e) => {
                          const input = document.getElementById('logo') as HTMLInputElement;
                          if (input) input.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {logoFile ? logoFile.name : "Seleccionar Logo"}
                      </Button>
                    </label>
                  </div>

                  {logoFile && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        type="button" 
                        onClick={handleLogoUpload}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Subir Logo
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(formData.logoUrl);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 lg:pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-terracotta" />
                  Configuración de Impresión
                </h4>
                <div className="space-y-4">
                  <Input
                    label="Encabezado de Impresión"
                    value={formData.printHeader}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        printHeader: e.target.value,
                      })
                    }
                    textarea
                    rows={3}
                    placeholder="Información que aparecerá en el encabezado de los recibos"
                  />
                  <Input
                    label="Pie de Página de Impresión"
                    value={formData.printFooter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        printFooter: e.target.value,
                      })
                    }
                    textarea
                    rows={3}
                    placeholder="Información que aparecerá al pie de los recibos"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  loading={updateSettings.isPending}
                >
                  Guardar Configuración
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-terracotta" />
              Vista Previa
            </h3>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
            <div className="bg-background rounded-lg p-4 lg:p-6 border border-border space-y-2">
              <div className="text-center mb-4">
                <h4 className="text-lg lg:text-xl font-bold text-foreground">
                  {formData.companyName}
                </h4>
                {formData.printHeader && (
                  <p className="text-xs lg:text-sm text-muted-foreground mt-2">
                    {formData.printHeader}
                  </p>
                )}
              </div>
              <div className="border-t border-border pt-4 space-y-1">
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-muted-foreground">Impuesto:</span>
                  <span className="font-medium text-foreground">
                    {formData.taxRate}%
                  </span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-muted-foreground">Moneda:</span>
                  <span className="font-medium text-foreground">
                    {formData.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-muted-foreground">
                    Prefijo Factura:
                  </span>
                  <span className="font-medium text-foreground">
                    {formData.invoicePrefix}
                  </span>
                </div>
              </div>
              {formData.printFooter && (
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs lg:text-sm text-muted-foreground text-center">
                    {formData.printFooter}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {currentUser?.role === "ADMIN" && (
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-terracotta" />
                  Gestión de Usuarios
                </div>
                <Button size="sm" onClick={() => setShowUserModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo
                </Button>
              </h3>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 lg:p-4 bg-background rounded-lg border border-border gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UsersIcon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Badge variant="default" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">
                            {user.role === "ADMIN"
                              ? "Administrador"
                              : user.role === "CASHIER"
                              ? "Cajero"
                              : "Inventario"}
                          </span>
                          <span className="sm:hidden">
                            {user.role === "ADMIN" ? "Admin" : user.role === "CASHIER" ? "Cajero" : "Inv"}
                          </span>
                        </Badge>
                        <Badge variant={user.active ? "success" : "danger"} className="text-xs">
                          {user.active ? "Activo" : "Inactivo"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleUserActive(user.id)}
                          disabled={user.id === currentUser?.id}
                          className="text-xs"
                        >
                          {user.active ? "Desact." : "Activar"}
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay usuarios registrados
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Crear Nuevo Usuario"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 lg:space-y-6">
          <Input
            label="Nombre Completo"
            value={userFormData.name}
            onChange={(e) =>
              setUserFormData({ ...userFormData, name: e.target.value })
            }
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            value={userFormData.email}
            onChange={(e) =>
              setUserFormData({ ...userFormData, email: e.target.value })
            }
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={userFormData.password}
            onChange={(e) =>
              setUserFormData({ ...userFormData, password: e.target.value })
            }
            required
            minLength={6}
          />
          <Select
            label="Rol"
            value={userFormData.role}
            onChange={(e) =>
              setUserFormData({
                ...userFormData,
                role: e.target.value as "ADMIN" | "CASHIER" | "INVENTORY_USER",
              })
            }
            options={[
              { value: "CASHIER", label: "Cajero" },
              { value: "INVENTORY_USER", label: "Usuario de Inventario" },
              { value: "ADMIN", label: "Administrador" },
            ]}
            required
          />

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUserModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createUser.isPending} className="w-full sm:w-auto">
              Crear Usuario
            </Button>
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
