"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useToggleUserActive,
  useUsers,
} from "@/hooks/useUsers";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { KeyRound, Plus, Shield, Trash2, Users as UsersIcon } from "lucide-react";
import type { User } from "@/types";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  CASHIER: "Cajero",
  INVENTORY_USER: "Inventario",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const toggleUserActive = useToggleUserActive();
  const resetPassword = useResetUserPassword();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER" as "ADMIN" | "CASHIER" | "INVENTORY_USER",
  });

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createUser.mutateAsync(formData);
      toast.success("Usuario creado correctamente");
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", role: "CASHIER" });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo crear el usuario"));
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await deleteUser.mutateAsync(userToDelete);
      toast.success("Usuario eliminado correctamente");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo eliminar el usuario"));
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleUserActive.mutateAsync(id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo actualizar el estado"));
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userToReset || newPassword.length < 8) {
      return;
    }

    try {
      await resetPassword.mutateAsync({ userId: userToReset.id, newPassword });
      toast.success("Contraseña restablecida exitosamente");
      setShowResetModal(false);
      setUserToReset(null);
      setNewPassword("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo restablecer la contraseña"));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 lg:space-y-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <div className="h-7 w-1 shrink-0 rounded-full bg-primary" />
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Usuarios</h1>
            </div>
            <p className="ml-4 text-sm text-muted-foreground">
              Administración centralizada de usuarios y accesos.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> Nuevo usuario
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="card-top-rail card-top-rail--primary" />
          <div className="border-b border-border/60 px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">Listado de usuarios</h3>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <UsersIcon className="h-5 w-5 animate-pulse text-primary/50" />
              </div>
            ) : users.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No hay usuarios registrados.</p>
            ) : (
              <div className="space-y-2.5">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        {roleLabel[user.role] || user.role}
                      </Badge>
                      <Badge variant={user.active ? "success" : "danger"} className="text-xs">
                        {user.active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleActive(user.id)}
                        disabled={user.id === currentUser?.id || toggleUserActive.isPending}
                      >
                        {user.active ? "Desactivar" : "Activar"}
                      </Button>
                      {user.id !== currentUser?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUserToReset(user);
                              setShowResetModal(true);
                              setNewPassword("");
                            }}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setUserToDelete(user.id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Crear usuario" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Correo" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Contraseña" type="password" minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <Select
            label="Rol"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "CASHIER" | "INVENTORY_USER" })}
            options={[
              { value: "CASHIER", label: "Cajero" },
              { value: "INVENTORY_USER", label: "Inventario" },
              { value: "ADMIN", label: "Administrador" },
            ]}
            required
          />
          <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button type="submit" loading={createUser.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Restablecer contraseña" size="sm">
        {userToReset && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Usuario: <span className="font-semibold text-foreground">{userToReset.name}</span>
            </p>
            <Input
              label="Nueva contraseña"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowResetModal(false)}>Cancelar</Button>
              <Button type="submit" loading={resetPassword.isPending}>Guardar</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  );
}
