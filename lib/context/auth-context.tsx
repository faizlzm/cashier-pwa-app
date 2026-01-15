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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
    []
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
