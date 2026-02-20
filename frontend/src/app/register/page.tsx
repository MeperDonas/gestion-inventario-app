"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post<{ id: string; email: string; name: string; role: string }>(
        "/auth/register",
        {
          email,
          password,
          name,
        }
      );
      toast.success("Registro exitoso. Ahora puedes iniciar sesion.");
      router.push("/login");
    } catch (err) {
      setError(getApiErrorMessage(err, "Error al registrar usuario."));
    } finally {
      setLoading(false);
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
            Registrarse
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
              label="Nombre Completo"
              type="text"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

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
              autoComplete="new-password"
              minLength={6}
            />

            <Button type="submit" className="w-full" loading={loading}>
              Registrarse
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">
              El registro crea un usuario con rol de <strong>Cajero</strong>.
            </p>
            <p>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-primary font-semibold hover:underline"
              >
                Iniciar Sesión
              </button>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          {theme === "dark" ? "Modo Oscuro" : "Modo Claro"} activo
        </p>
      </div>
    </div>
  );
}
