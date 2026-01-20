/**
 * @fileoverview Context untuk manajemen autentikasi pengguna
 * @module lib/context/auth-context
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types/api";
import { getAccessToken, clearTokens } from "@/lib/api";
import * as authApi from "@/lib/api/auth";

/**
 * Interface untuk AuthContext value
 * Menyediakan state dan methods untuk autentikasi
 */
interface AuthContextType {
  /** User yang sedang login, null jika belum login */
  user: User | null;
  /** Status loading saat mengecek autentikasi */
  isLoading: boolean;
  /** Apakah user sudah terautentikasi */
  isAuthenticated: boolean;
  /** Fungsi untuk login dengan email dan password */
  login: (email: string, password: string) => Promise<void>;
  /** Fungsi untuk registrasi user baru */
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Fungsi untuk logout */
  logout: () => void;
  /** Fungsi untuk refresh data user dari server */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage =
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/register") ||
      pathname?.startsWith("/forgot-password");

    // Public pages that don't require authentication
    const isPublicPage =
      pathname?.startsWith("/diagnostic") || pathname?.startsWith("/reset");

    if (!isAuthenticated && !isAuthPage && !isPublicPage && pathname !== "/") {
      router.push("/login");
    }

    if (isAuthenticated && isAuthPage) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: userData } = await authApi.login({ email, password });
    setUser(userData);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user: userData } = await authApi.register({
        name,
        email,
        password,
      });
      setUser(userData);
    },
    [],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook untuk mengakses AuthContext
 * Harus digunakan di dalam AuthProvider
 * @returns AuthContextType dengan user state dan auth methods
 * @throws Error jika digunakan di luar AuthProvider
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
