// 认证相关 API
// 当后端不可用或请求失败时，降级使用 authStore 的本地登录
import {
  get,
  post,
  isApiAvailable,
  setToken,
  clearToken,
} from "./client";
import { useAuthStore } from "@/store/authStore";
import type { Admin } from "@/types";

// 登录响应
interface LoginResult {
  token: string;
  admin: Admin;
}

// 登录
// 调用 POST /api/auth/login，失败时降级使用本地登录
export async function login(
  username: string,
  password: string
): Promise<Admin> {
  // 本地降级
  if (!isApiAvailable) {
    return localLogin(username, password);
  }
  try {
    const res = await post<LoginResult>("/auth/login", { username, password });
    if (res.token) setToken(res.token);
    // 同步本地 authStore
    useAuthStore.setState({
      currentAdmin: res.admin,
      isAuthenticated: true,
    });
    return res.admin;
  } catch (e) {
    console.warn("API 登录失败，降级使用本地登录", e);
    return localLogin(username, password);
  }
}

// 本地登录降级逻辑
function localLogin(username: string, password: string): Admin {
  const success = useAuthStore.getState().login(username, password);
  if (!success) {
    throw new Error("用户名或密码错误");
  }
  const admin = useAuthStore.getState().currentAdmin;
  if (!admin) {
    throw new Error("登录失败");
  }
  return admin;
}

// 获取当前登录用户信息
// 调用 GET /api/auth/profile，失败时降级使用 authStore
export async function getProfile(): Promise<Admin | null> {
  if (!isApiAvailable) {
    return useAuthStore.getState().currentAdmin;
  }
  try {
    const res = await get<Admin>("/auth/profile");
    // 同步本地
    useAuthStore.setState({ currentAdmin: res });
    return res;
  } catch (e) {
    console.warn("API 获取用户信息失败，降级使用本地数据", e);
    return useAuthStore.getState().currentAdmin;
  }
}

// 登出
// 调用 POST /api/auth/logout，失败时也清理本地状态
export async function logout(): Promise<void> {
  if (!isApiAvailable) {
    useAuthStore.getState().logout();
    clearToken();
    return;
  }
  try {
    await post("/auth/logout");
  } catch (e) {
    console.warn("API 登出失败，仍然清理本地状态", e);
  } finally {
    useAuthStore.getState().logout();
    clearToken();
  }
}
