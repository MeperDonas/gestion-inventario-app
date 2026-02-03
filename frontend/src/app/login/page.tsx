"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { ShoppingCart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch {
      setError("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-terracotta mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bienvenido
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestión de Inventario
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" loading={loading}>
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">¿No tienes cuenta?</p>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-primary font-semibold hover:underline"
            >
              Registrarse
            </button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="mb-2">Credenciales de prueba:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Admin:</strong> admin@inventory.com / admin123</p>
                <p><strong>Cajero:</strong> cajero@inventory.com / cashier123</p>
                <p><strong>Inventario:</strong> inventory@inventory.com / cashier123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          {theme === "dark" ? "Modo Oscuro" : "Modo Claro"} activo
        </p>
      </div>
    </div>
  );
}
