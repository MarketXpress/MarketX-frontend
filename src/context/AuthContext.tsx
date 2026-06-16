"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { decodeJwtPayload } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userFromToken(token: string): AuthUser | null {
  try {
    const payload = decodeJwtPayload(token);
    const id = String(payload.sub ?? "");
    const email = String(payload.email ?? "");
    const role = (payload.role as AuthUser["role"]) ?? "BUYER";
    if (!id || !email) return null;
    return { id, email, role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("mx_token");
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("mx_token");
    if (!saved) return null;
    return userFromToken(saved);
  });

  const login = useCallback((accessToken: string, refreshToken: string) => {
    const decoded = userFromToken(accessToken);
    setToken(accessToken);
    setUser(decoded);
    localStorage.setItem("mx_token", accessToken);
    localStorage.setItem("mx_refresh_token", refreshToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("mx_token");
    localStorage.removeItem("mx_refresh_token");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading: false }}
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
