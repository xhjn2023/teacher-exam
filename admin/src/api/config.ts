// 系统配置、操作日志、管理员管理 API
// 当 API 不可用时，分别降级使用对应 mock 数据
import {
  get,
  put,
  post,
  del,
  isApiAvailable,
  paginateMock,
} from "./client";
import { systemConfig as mockSystemConfig } from "@/mock/data/config";
import { logs as mockLogs } from "@/mock/data/logs";
import { admins as mockAdmins } from "@/mock/data/admins";
import type {
  SystemConfig,
  OperationLog,
  Admin,
  QueryParams,
  PaginatedResponse,
} from "@/types";
import { generateId } from "@/lib/utils";

// ============ 本地可变 Mock 数据 ============
let localConfig: SystemConfig = { ...mockSystemConfig };
let localLogs: OperationLog[] = mockLogs.map((l) => ({ ...l }));
let localAdmins: Admin[] = mockAdmins.map((a) => ({ ...a }));

// ============ 系统配置 ============

// 获取系统配置
// 调用 GET /api/config
export async function getSystemConfig(): Promise<SystemConfig> {
  if (!isApiAvailable) {
    return { ...localConfig };
  }
  try {
    return await get<SystemConfig>("/config");
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return { ...localConfig };
  }
}

// 更新系统配置
// 调用 PUT /api/config
export async function updateSystemConfig(
  data: Partial<SystemConfig>
): Promise<SystemConfig> {
  if (!isApiAvailable) {
    localConfig = { ...localConfig, ...data };
    return { ...localConfig };
  }
  try {
    return await put<SystemConfig>("/config", data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localConfig = { ...localConfig, ...data };
    return { ...localConfig };
  }
}

// ============ 操作日志 ============

// Mock 降级：获取日志列表
function mockGetLogs(
  params: QueryParams
): PaginatedResponse<OperationLog> {
  return paginateMock<OperationLog>(localLogs, params, [
    "module",
    "action",
    "adminName",
    "target",
    "detail",
  ]);
}

// 获取操作日志
// 调用 GET /api/logs
export async function getLogs(
  params: QueryParams = {}
): Promise<PaginatedResponse<OperationLog>> {
  if (!isApiAvailable) {
    return mockGetLogs(params);
  }
  try {
    return await get<PaginatedResponse<OperationLog>>("/logs", { ...params });
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetLogs(params);
  }
}

// ============ 管理员管理 ============

// Mock 降级：获取管理员列表
function mockGetAdmins(
  params: QueryParams
): PaginatedResponse<Admin> {
  return paginateMock<Admin>(localAdmins, params, [
    "username",
    "name",
    "email",
    "phone",
  ]);
}

// 获取管理员列表
// 调用 GET /api/admins
export async function getAdmins(
  params: QueryParams = {}
): Promise<PaginatedResponse<Admin>> {
  if (!isApiAvailable) {
    return mockGetAdmins(params);
  }
  try {
    return await get<PaginatedResponse<Admin>>("/admins", { ...params });
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetAdmins(params);
  }
}

// 新增管理员
// 调用 POST /api/admins
export async function createAdmin(
  data: Partial<Admin>
): Promise<Admin> {
  if (!isApiAvailable) {
    const now = new Date().toISOString();
    const newAdmin: Admin = {
      _id: generateId("admin_"),
      username: data.username ?? "",
      password: data.password ?? "",
      name: data.name ?? "",
      role: data.role ?? "content",
      avatar: data.avatar ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      lastLoginTime: "",
      status: data.status ?? "active",
      createTime: now,
    };
    localAdmins.push(newAdmin);
    return { ...newAdmin };
  }
  try {
    return await post<Admin>("/admins", data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    const now = new Date().toISOString();
    const newAdmin: Admin = {
      _id: generateId("admin_"),
      username: data.username ?? "",
      password: data.password ?? "",
      name: data.name ?? "",
      role: data.role ?? "content",
      avatar: data.avatar ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      lastLoginTime: "",
      status: data.status ?? "active",
      createTime: now,
    };
    localAdmins.push(newAdmin);
    return { ...newAdmin };
  }
}

// 更新管理员
// 调用 PUT /api/admins/:id
export async function updateAdmin(
  id: string,
  data: Partial<Admin>
): Promise<Admin> {
  if (!isApiAvailable) {
    return mockUpdateAdmin(id, data);
  }
  try {
    return await put<Admin>(`/admins/${id}`, data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockUpdateAdmin(id, data);
  }
}

// Mock 降级：更新管理员
function mockUpdateAdmin(
  id: string,
  data: Partial<Admin>
): Admin {
  const idx = localAdmins.findIndex((a) => a._id === id);
  if (idx === -1) throw new Error("管理员不存在");
  localAdmins[idx] = { ...localAdmins[idx], ...data };
  return { ...localAdmins[idx] };
}

// 删除管理员
// 调用 DELETE /api/admins/:id
export async function deleteAdmin(id: string): Promise<void> {
  if (!isApiAvailable) {
    localAdmins = localAdmins.filter((a) => a._id !== id);
    return;
  }
  try {
    await del<void>(`/admins/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localAdmins = localAdmins.filter((a) => a._id !== id);
  }
}
