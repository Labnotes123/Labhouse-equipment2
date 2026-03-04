"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole =
  | "Admin"
  | "Giám đốc"
  | "Trưởng phòng xét nghiệm"
  | "Trưởng nhóm"
  | "Kỹ thuật viên"
  | "Quản lý chất lượng"
  | "Quản lý trang thiết bị";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  department?: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  labName: string;
  setLabName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [labName, setLabName] = useState("TRUNG TÂM XÉT NGHIỆM Y KHOA LABHOUSE");
  const [logoUrl, setLogoUrl] = useState("");

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) return false;

      const data = await res.json() as { user?: User };
      if (data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await fetch("/api/auth/logout", { method: "POST" });
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  // Password changes require a dedicated /api/auth/change-password route.
  // Return false until that route is implemented so callers know nothing changed.
  const updatePassword = async (_oldPass: string, _newPass: string): Promise<boolean> => {
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        updatePassword,
        labName,
        setLabName,
        logoUrl,
        setLogoUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
