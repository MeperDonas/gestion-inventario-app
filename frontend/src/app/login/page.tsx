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
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ backgroundColor: "#07090e" }}
    >
      {/* Background blobs */}
      <div
        className="pointer-events-none absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(67,83,250,0.25) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)" }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-fade-in-up">
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: "rgba(13, 20, 34, 0.92)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 80px rgba(67, 83, 250, 0.12), 0 32px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <div className="mb-7">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "linear-gradient(135deg, #4353fa 0%, #5b6cf7 100%)",
                boxShadow: "0 4px 20px rgba(67,83,250,0.35)",
              }}
            >
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-syne, sans-serif)", letterSpacing: "-0.03em" }}
            >
              Bienvenido de nuevo
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Sistema de Gestión de Inventario
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e4ecf8",
                  caretColor: "#6470fb",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(100,112,251,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(100,112,251,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200 outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e4ecf8",
                  caretColor: "#6470fb",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(100,112,251,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(100,112,251,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-200 mt-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #4353fa 0%, #5b6cf7 100%)",
                boxShadow: "0 4px 16px rgba(67,83,250,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = "0 6px 20px rgba(67,83,250,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(67,83,250,0.3)";
              }}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-semibold transition-colors"
              style={{ color: "rgba(100,112,251,0.9)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8b97fc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(100,112,251,0.9)")}
            >
              Registrarse
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
