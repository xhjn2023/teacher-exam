// 用户管理 API
// 当 API 不可用时，降级使用 mock/data/users.ts 的数据
import { get, put, patch, del, isApiAvailable, paginateMock } from "./client";
import { users as mockUsers } from "@/mock/data/users";
import type { User, QueryParams, PaginatedResponse } from "@/types";

// 本地可变的 Mock 数据副本（支持增删改）
let localUsers: User[] = mockUsers.map((u) => ({ ...u }));

// Mock 降级：获取用户列表（带分页过滤）
function mockGetUsers(params: QueryParams): PaginatedResponse<User> {
  return paginateMock<User>(localUsers, params, [
    "nickName",
    "userId",
    "_id",
  ]);
}

// 获取用户列表
// 调用 GET /api/users
export async function getUsers(
  params: QueryParams = {}
): Promise<PaginatedResponse<User>> {
  if (!isApiAvailable) {
    return mockGetUsers(params);
  }
  try {
    return await get<PaginatedResponse<User>>("/users", { ...params });
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetUsers(params);
  }
}

// 根据 ID 获取用户
// 调用 GET /api/users/:id
export async function getUserById(id: string): Promise<User> {
  if (!isApiAvailable) {
    const user = localUsers.find((u) => u._id === id || u.userId === id);
    if (!user) throw new Error("用户不存在");
    return { ...user };
  }
  try {
    return await get<User>(`/users/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    const user = localUsers.find((u) => u._id === id || u.userId === id);
    if (!user) throw new Error("用户不存在");
    return { ...user };
  }
}

// 更新用户
// 调用 PUT /api/users/:id
export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<User> {
  if (!isApiAvailable) {
    const idx = localUsers.findIndex((u) => u._id === id);
    if (idx === -1) throw new Error("用户不存在");
    localUsers[idx] = {
      ...localUsers[idx],
      ...data,
      updateTime: new Date().toISOString(),
    };
    return { ...localUsers[idx] };
  }
  try {
    return await put<User>(`/users/${id}`, data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    const idx = localUsers.findIndex((u) => u._id === id);
    if (idx === -1) throw new Error("用户不存在");
    localUsers[idx] = {
      ...localUsers[idx],
      ...data,
      updateTime: new Date().toISOString(),
    };
    return { ...localUsers[idx] };
  }
}

// 更新用户状态
// 调用 PATCH /api/users/:id/status
export async function updateUserStatus(
  id: string,
  status: User["status"]
): Promise<User> {
  if (!isApiAvailable) {
    return updateUser(id, { status });
  }
  try {
    return await patch<User>(`/users/${id}/status`, { status });
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return updateUser(id, { status });
  }
}

// 删除用户
// 调用 DELETE /api/users/:id
export async function deleteUser(id: string): Promise<void> {
  if (!isApiAvailable) {
    localUsers = localUsers.filter((u) => u._id !== id);
    return;
  }
  try {
    await del<void>(`/users/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localUsers = localUsers.filter((u) => u._id !== id);
  }
}
