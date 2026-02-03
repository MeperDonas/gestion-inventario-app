"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile, useChangePassword, useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User as UserIcon, Lock, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const currentUser = profile || user;

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync(formData);
      alert("Perfil actualizado exitosamente");
    } catch {
      alert("Error al actualizar el perfil");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Contraseña cambiada exitosamente");
    } catch {
      alert("Error al cambiar la contraseña. Verifica tu contraseña actual.");
    }
  };

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
      <div className="space-y-4 lg:space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            Mi Perfil
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gestiona tu información personal y seguridad
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              Información Personal
            </h3>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
            <form onSubmit={handleProfileUpdate} className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 lg:mb-2 text-foreground">
                    Nombre
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 lg:mb-2 text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="pl-12"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    El email no puede ser modificado
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 lg:mb-2 text-foreground">
                    Rol
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-background">
                    <Shield className="w-5 h-5 text-terracotta" />
                    <span className="font-medium text-foreground text-sm">{currentUser?.role}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 lg:mb-2 text-foreground">
                    Estado
                  </label>
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                    currentUser?.active ? 'border-green-500' : 'border-red-500'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      currentUser?.active ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium text-foreground text-sm">
                      {currentUser?.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  loading={updateProfile.isPending}
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-terracotta" />
              Cambiar Contraseña
            </h3>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
            <form onSubmit={handlePasswordChange} className="space-y-4 lg:space-y-6">
              <Input
                label="Contraseña Actual"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
              
              <Input
                label="Nueva Contraseña"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Mínimo 6 caracteres
              </p>
              
              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={6}
              />

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  loading={changePassword.isPending}
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
