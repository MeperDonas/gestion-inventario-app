"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingBasket,
  Package,
  Users,
  TrendingUp,
  FolderTree,
  Receipt,
  Settings,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Menu,
  X,
  Boxes,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ["ADMIN", "INVENTORY_USER"],
  },
  {
    label: "POS",
    href: "/pos",
    icon: <ShoppingBasket className="w-4 h-4" />,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: <Package className="w-4 h-4" />,
    roles: ["ADMIN", "CASHIER", "INVENTORY_USER"],
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: <Receipt className="w-4 h-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Clientes",
    href: "/customers",
    icon: <Users className="w-4 h-4" />,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: <TrendingUp className="w-4 h-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Categorías",
    href: "/categories",
    icon: <FolderTree className="w-4 h-4" />,
    roles: ["ADMIN", "INVENTORY_USER"],
  },
  {
    label: "Mi Perfil",
    href: "/profile",
    icon: <UserIcon className="w-4 h-4" />,
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: <Settings className="w-4 h-4" />,
    roles: ["ADMIN"],
  },
];

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  CASHIER: "Cajero",
  INVENTORY_USER: "Inventario",
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((p) => !p), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <Boxes className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight"
               style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              Inventario
            </p>
            <p className="text-[10px] text-white/35 uppercase tracking-widest leading-tight">
              Sistema de Gestión
            </p>
          </div>
        </div>
      </div>

      {/* User */}
      {user ? (
        <div className="px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary"
                    style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-white/35 truncate leading-tight">
                {roleLabels[user.role] ?? user.role}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
        <ul className="space-y-0.5">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn("sidebar-item", isActive && "active")}
                >
                  <span className={cn(
                    "shrink-0 transition-colors duration-200",
                    isActive ? "text-primary" : "text-white/40"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={toggleTheme}
          className="sidebar-item w-full"
        >
          <span className="text-white/40 shrink-0">
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </span>
          <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
        </button>
        <button
          onClick={logout}
          className="sidebar-item w-full !text-red-400/70 hover:!text-red-400 hover:!bg-red-500/10"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Boxes className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
            Inventario
          </span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen ? (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen flex flex-col z-50 w-64",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:mt-0 mt-14"
        )}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
