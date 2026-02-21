"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, memo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

const routeRoleMap: Array<{ prefix: string; roles: Array<"ADMIN" | "CASHIER" | "INVENTORY_USER"> }> = [
  { prefix: "/dashboard", roles: ["ADMIN", "INVENTORY_USER"] },
  { prefix: "/pos", roles: ["ADMIN", "CASHIER"] },
  { prefix: "/inventory", roles: ["ADMIN", "CASHIER", "INVENTORY_USER"] },
  { prefix: "/sales", roles: ["ADMIN"] },
  { prefix: "/customers", roles: ["ADMIN", "CASHIER"] },
  { prefix: "/reports", roles: ["ADMIN"] },
  { prefix: "/categories", roles: ["ADMIN", "INVENTORY_USER"] },
  { prefix: "/settings", roles: ["ADMIN"] },
  { prefix: "/profile", roles: ["ADMIN", "CASHIER", "INVENTORY_USER"] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = memo(function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (loading || !isAuthenticated || !user) {
      return;
    }

    const routeConfig = routeRoleMap.find((route) =>
      pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
    );

    if (!routeConfig) {
      return;
    }

    if (!routeConfig.roles.includes(user.role)) {
      const fallbackRoute = user.role === "CASHIER" ? "/pos" : "/dashboard";
      router.replace(fallbackRoute);
    }
  }, [isAuthenticated, loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="px-4 pb-6 pt-20 lg:ml-64 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto w-full max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
});
