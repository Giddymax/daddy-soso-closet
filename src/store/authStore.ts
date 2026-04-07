"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Staff, Branch, RoleName } from "@/types";

interface AuthState {
  user: { id: string; email: string } | null;
  staff: Staff | null;
  role: RoleName | null;
  branch: Branch | null;
  isLoading: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setStaff: (staff: Staff | null) => void;
  setRole: (role: RoleName | null) => void;
  setBranch: (branch: Branch | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      staff: null,
      role: null,
      branch: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setStaff: (staff) => set({ staff }),
      setRole: (role) => set({ role }),
      setBranch: (branch) => set({ branch }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () =>
        set({ user: null, staff: null, role: null, branch: null }),
    }),
    {
      name: "dsc-auth",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      },
    }
  )
);
