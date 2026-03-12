"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Boxes, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Credenciales incorrectas. Verifica tu correo y contrasena.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-fade-in-up">
        <div className="rounded-2xl p-8 bg-card border border-border/70 shadow-xl shadow-black/5">
          {/* Logo */}
          <div className="mb-7">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-md shadow-primary/20">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-foreground mb-1"
              style={{ fontFamily: "var(--font-manrope, sans-serif)", letterSpacing: "-0.03em" }}
            >
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestion de Inventario
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200/60 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Correo Electronico
              </label>
              <input
                type="email"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 outline-none bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Contrasena
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 outline-none bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-200 mt-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span>Iniciar Sesion</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-5 text-xs text-muted-foreground">
            No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Registrarse
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
