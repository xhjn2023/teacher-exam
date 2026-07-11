import type { Admin } from "@/types";

// 管理员模拟数据（3个角色各一个：超级管理员、内容管理员、数据分析员）
export const admins: Admin[] = [
  {
    _id: "admin_001",
    username: "superadmin",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3J8KqMRZoMyKqMRZoMyKqMRZoMy",
    name: "超级管理员",
    role: "super",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin",
    email: "superadmin@teacherexam.com",
    phone: "13800138000",
    lastLoginTime: "2026-07-11T09:30:00.000Z",
    status: "active",
    createTime: "2024-01-15T08:00:00.000Z",
  },
  {
    _id: "admin_002",
    username: "contentadmin",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3J8KqMRZoMyKqMRZoMyKqMRZoMy",
    name: "内容管理员",
    role: "content",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=contentadmin",
    email: "content@teacherexam.com",
    phone: "13800138001",
    lastLoginTime: "2026-07-11T08:45:00.000Z",
    status: "active",
    createTime: "2024-01-15T08:00:00.000Z",
  },
  {
    _id: "admin_003",
    username: "analyticsadmin",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3J8KqMRZoMyKqMRZoMyKqMRZoMy",
    name: "数据分析员",
    role: "analytics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=analyticsadmin",
    email: "analytics@teacherexam.com",
    phone: "13800138002",
    lastLoginTime: "2026-07-10T16:20:00.000Z",
    status: "active",
    createTime: "2024-01-15T08:00:00.000Z",
  },
];
