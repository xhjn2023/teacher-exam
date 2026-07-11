import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 格式化日期时间
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${dateStr} ${hours}:${minutes}`;
}

// 相对时间
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(d);
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  }
  return num.toLocaleString();
}

// 格式化百分比
export function formatPercent(num: number, decimals = 1): string {
  return num.toFixed(decimals) + "%";
}

// 生成随机ID
export function generateId(prefix = ""): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 题型映射
export const questionTypeMap: Record<string, string> = {
  single: "单选题",
  multi: "多选题",
  judge: "判断题",
  essay: "简答题",
};

// 难度映射
export const difficultyMap: Record<number, { label: string; color: string }> = {
  1: { label: "简单", color: "text-accent-600 bg-accent-50" },
  2: { label: "较易", color: "text-blue-600 bg-blue-50" },
  3: { label: "中等", color: "text-amber-600 bg-amber-50" },
  4: { label: "较难", color: "text-orange-600 bg-orange-50" },
  5: { label: "困难", color: "text-red-600 bg-red-50" },
};

// 状态映射
export const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "正常", color: "text-accent-600 bg-accent-50" },
  disabled: { label: "已禁用", color: "text-zinc-600 bg-zinc-100" },
  banned: { label: "已封禁", color: "text-red-600 bg-red-50" },
  draft: { label: "草稿", color: "text-zinc-600 bg-zinc-100" },
  pending: { label: "待审核", color: "text-amber-600 bg-amber-50" },
  published: { label: "已发布", color: "text-accent-600 bg-accent-50" },
  offline: { label: "已下架", color: "text-red-600 bg-red-50" },
};

// 角色映射
export const roleMap: Record<string, { label: string; color: string }> = {
  super: { label: "超级管理员", color: "text-primary-600 bg-primary-50" },
  content: { label: "内容运营", color: "text-accent-600 bg-accent-50" },
  analytics: { label: "数据分析", color: "text-purple-600 bg-purple-50" },
};
