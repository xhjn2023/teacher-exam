// API 请求基础客户端
// 封装 fetch 请求，统一处理 token、错误、响应格式
import type { PaginatedResponse, QueryParams } from "@/types";

// 基础 URL，从环境变量读取，默认指向本地后端
const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:3001/api";

// Token 在 localStorage 中的存储键
const TOKEN_KEY = "admin_token";

// 后端是否可用标志（运行时可变，通过 ES 模块 live binding 共享）
export let isApiAvailable = true;

// 统一响应格式 { code, msg, data }
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// API 错误类型
export class ApiError extends Error {
  status: number;
  code?: number;
  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// 设置后端可用性
export function setApiAvailable(available: boolean): void {
  isApiAvailable = available;
}

// 获取 token
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// 设置 token
export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

// 清除 token
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// 构建查询字符串
function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (filtered.length === 0) return "";
  const qs = new URLSearchParams();
  filtered.forEach(([k, v]) => qs.append(k, String(v)));
  return `?${qs.toString()}`;
}

// 核心请求函数，处理请求拦截、响应拦截、统一错误
async function request<T = unknown>(
  method: string,
  path: string,
  options: { params?: Record<string, unknown>; body?: unknown } = {}
): Promise<T> {
  const { params, body } = options;
  const url = `${BASE_URL}${path}${buildQuery(params)}`;

  // 请求拦截器：添加 Authorization header
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // 网络层错误，认为后端不可用
    setApiAvailable(false);
    throw new ApiError("网络请求失败，后端服务可能不可用", 0);
  }

  // 响应拦截器：处理 401 跳转登录
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      const { pathname } = window.location;
      if (pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new ApiError("未授权或登录已过期", 401);
  }

  // 成功连通后端，标记可用
  setApiAvailable(true);

  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try {
      const errData = await res.json();
      msg = errData.msg || errData.message || msg;
    } catch {
      // ignore
    }
    throw new ApiError(msg, res.status);
  }

  // 解析响应体
  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("响应解析失败", res.status);
  }

  // 统一响应格式处理 { code, msg, data }
  if (json && typeof json.code !== "undefined") {
    if (json.code !== 0 && json.code !== 200) {
      throw new ApiError(json.msg || "业务错误", res.status, json.code);
    }
    return json.data;
  }

  // 非标准格式，直接返回
  return json as unknown as T;
}

// 检测后端是否可用（调用 health 端点）
export async function checkApiAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const available = res.ok;
    setApiAvailable(available);
    return available;
  } catch {
    setApiAvailable(false);
    return false;
  }
}

// 导出的请求方法
export function get<T = unknown>(
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  return request<T>("GET", path, { params });
}

export function post<T = unknown>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, { body });
}

export function put<T = unknown>(path: string, body?: unknown): Promise<T> {
  return request<T>("PUT", path, { body });
}

export function patch<T = unknown>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, { body });
}

export function del<T = unknown>(
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  return request<T>("DELETE", path, { params });
}

// Mock 数据分页 / 过滤辅助函数
// 通用字段过滤 + 排序 + 分页，返回与后端一致的 PaginatedResponse 结构
export function paginateMock<T>(
  list: T[],
  params: QueryParams = {},
  matchFields: string[] = []
): PaginatedResponse<T> {
  // 内部按 record 处理以支持字段过滤
  let result = (list as unknown as Record<string, unknown>[]).slice();
  const {
    keyword,
    status,
    type,
    subjectId,
    chapterId,
    examTypeId,
    page = 1,
    pageSize = 10,
    sortBy,
    sortOrder,
  } = params;

  // 关键词过滤
  if (keyword && matchFields.length > 0) {
    const kw = String(keyword).toLowerCase();
    result = result.filter((item) =>
      matchFields.some((f) =>
        String(item[f] ?? "").toLowerCase().includes(kw)
      )
    );
  }

  // 状态过滤
  if (status) {
    result = result.filter((item) => String(item.status) === String(status));
  }

  // 题型过滤
  if (type) {
    result = result.filter((item) => String(item.type) === String(type));
  }

  // 关联字段过滤
  if (subjectId) {
    result = result.filter((item) => item.subjectId === subjectId);
  }
  if (chapterId) {
    result = result.filter((item) => item.chapterId === chapterId);
  }
  if (examTypeId) {
    result = result.filter((item) => item.examTypeId === examTypeId);
  }

  // 排序
  if (sortBy) {
    result.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });
  }

  const total = result.length;
  const start = (page - 1) * pageSize;
  const paged = result.slice(start, start + pageSize);

  return {
    list: paged as unknown as T[],
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}
