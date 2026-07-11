import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "../types";

interface AuthState {
  currentAdmin: Admin | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<Admin>) => void;
}

// 默认超级管理员账号
const DEFAULT_ADMIN: Admin = {
  _id: "admin-001",
  username: "admin",
  password: "admin123",
  name: "超级管理员",
  role: "super",
  avatar: "",
  email: "admin@workbuddy.com",
  phone: "13800000000",
  lastLoginTime: "",
  status: "active",
  createTime: "2024-01-01 00:00:00",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentAdmin: null,
      isAuthenticated: false,

      login: (username: string, password: string) => {
        // 验证默认管理员账号
        if (
          username === DEFAULT_ADMIN.username &&
          password === DEFAULT_ADMIN.password
        ) {
          const now = new Date().toISOString();
          const admin: Admin = {
            ...DEFAULT_ADMIN,
            lastLoginTime: now,
          };
          set({ currentAdmin: admin, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentAdmin: null, isAuthenticated: false });
      },

      updateProfile: (data: Partial<Admin>) => {
        set((state) => ({
          currentAdmin: state.currentAdmin
            ? { ...state.currentAdmin, ...data }
            : null,
        }));
      },
    }),
    {
      name: "admin-auth-storage",
      // 不持久化密码字段，避免敏感信息泄露
      partialize: (state) => ({
        currentAdmin: state.currentAdmin
          ? { ...state.currentAdmin, password: "" }
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
