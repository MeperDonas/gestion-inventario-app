"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CASHIER" | "INVENTORY_USER";
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        JSON.parse(savedUser);
        const profileResponse = await api.get<User>("/auth/profile");
        setUser(profileResponse.data);
        localStorage.setItem("user", JSON.stringify(profileResponse.data));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void validateSession();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post<{ access_token: string }>("/auth/login", {
          email,
          password,
        });

        const token = response.data.access_token;
        localStorage.setItem("token", token);

        const profileResponse = await api.get<User>("/auth/profile");
        setUser(profileResponse.data);
        localStorage.setItem("user", JSON.stringify(profileResponse.data));

        router.push("/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        await api.post<{ id: string; email: string; name: string; role: string }>(
          "/auth/register",
          data
        );
      } catch (error) {
        console.error("Register error:", error);
        throw error;
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: !!user,
    }),
    [user, loading, login, logout, register]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
