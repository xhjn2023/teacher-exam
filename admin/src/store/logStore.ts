import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OperationLog } from "../types";
import { generateId } from "../lib/utils";

interface LogFilter {
  module?: string;
  adminId?: string;
  action?: string;
}

interface LogState {
  logs: OperationLog[];
  addLog: (log: Omit<OperationLog, "_id" | "createTime">) => void;
  getLogs: (filter?: LogFilter) => OperationLog[];
}

// 持久化存储的日志上限，避免 localStorage 溢出
const MAX_LOGS = 500;

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log: Omit<OperationLog, "_id" | "createTime">) => {
        const newLog: OperationLog = {
          ...log,
          _id: generateId("log_"),
          createTime: new Date().toISOString(),
        };
        set((state) => ({
          // 新日志置顶，并限制最大数量
          logs: [newLog, ...state.logs].slice(0, MAX_LOGS),
        }));
      },

      getLogs: (filter?: LogFilter) => {
        const logs = get().logs;
        if (!filter) return logs;
        return logs.filter((log) => {
          if (filter.module && log.module !== filter.module) return false;
          if (filter.adminId && log.adminId !== filter.adminId) return false;
          if (filter.action && log.action !== filter.action) return false;
          return true;
        });
      },
    }),
    {
      name: "admin-log-storage",
    }
  )
);
