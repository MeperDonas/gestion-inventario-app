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
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "POS",
    href: "/pos",
    icon: <ShoppingBasket className="w-5 h-5" />,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: <Receipt className="w-5 h-5" />,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    label: "Clientes",
    href: "/customers",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    label: "Categorías",
    href: "/categories",
    icon: <FolderTree className="w-5 h-5" />,
  },
  {
    label: "Mi Perfil",
    href: "/profile",
    icon: <UserIcon className="w-5 h-5" />,
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = navItems.filter(
    (item) =>
      !item.roles ||
      (user && item.roles.includes(user.role))
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-foreground truncate">
          Gestión de Inventario
        </h1>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-terracotta/10 transition-colors"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </header>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Slide-over */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out",
          "w-64",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-border lg:mt-0 mt-16 lg:pt-6 pt-4">
          <h1 className="text-xl font-bold text-foreground hidden lg:block">
            Gestión de Inventario
          </h1>
          {user && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {user.name} - {user.role}
            </p>
          )}
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-foreground hover:bg-terracotta/10"
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-terracotta/10 transition-all duration-200"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="font-medium">
              {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-600/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
