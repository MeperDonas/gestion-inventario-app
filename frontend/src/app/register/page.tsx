"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-terracotta mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Registro de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestión de Inventario
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-2">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Acceso restringido
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              El registro de nuevos usuarios está deshabilitado en esta
              plataforma. Solo un <strong>Administrador</strong> puede crear
              cuentas desde el panel de gestión.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-200">
            Si necesitas acceso, contacta al administrador del sistema para que
            te cree una cuenta.
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Ir al Inicio de Sesión
          </Button>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          {theme === "dark" ? "Modo Oscuro" : "Modo Claro"} activo
        </p>
      </div>
    </div>
  );
}
