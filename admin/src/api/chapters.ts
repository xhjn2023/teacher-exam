// 章节管理 API
// 当 API 不可用时，降级使用 mock/data/chapters.ts 的数据
import {
  get,
  post,
  put,
  del,
  isApiAvailable,
  paginateMock,
} from "./client";
import { chapters as mockChapters } from "@/mock/data/chapters";
import type { Chapter, QueryParams, PaginatedResponse } from "@/types";
import { generateId } from "@/lib/utils";

// 本地可变的 Mock 数据副本（支持增删改）
let localChapters: Chapter[] = mockChapters.map((c) => ({ ...c }));

// Mock 降级：获取章节列表
function mockGetChapters(
  params?: QueryParams | string
): PaginatedResponse<Chapter> | Chapter[] {
  // 兼容传入 subjectId 字符串或查询参数对象
  if (typeof params === "string") {
    const list = localChapters.filter((c) => c.subjectId === params);
    return [...list];
  }
  if (!params) {
    return [...localChapters];
  }
  return paginateMock<Chapter>(localChapters, params, ["name", "_id"]);
}

// 获取章节列表
// 调用 GET /api/chapters
// 可选传入 subjectId 按科目过滤
export async function getChapters(
  params?: QueryParams | string
): Promise<PaginatedResponse<Chapter> | Chapter[]> {
  if (!isApiAvailable) {
    return mockGetChapters(params);
  }
  try {
    const query =
      typeof params === "string"
        ? { subjectId: params }
        : params
        ? { ...params }
        : undefined;
    return await get<PaginatedResponse<Chapter> | Chapter[]>(
      "/chapters",
      query
    );
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetChapters(params);
  }
}

// 新增章节
// 调用 POST /api/chapters
export async function createChapter(
  data: Partial<Chapter>
): Promise<Chapter> {
  if (!isApiAvailable) {
    return mockCreateChapter(data);
  }
  try {
    return await post<Chapter>("/chapters", data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockCreateChapter(data);
  }
}

// Mock 降级：新增章节
function mockCreateChapter(data: Partial<Chapter>): Chapter {
  const newChapter: Chapter = {
    _id: generateId("ch_"),
    subjectId: data.subjectId ?? "",
    name: data.name ?? "",
    sort: data.sort ?? 0,
    questionCount: data.questionCount ?? 0,
    createTime: new Date().toISOString(),
  };
  localChapters.push(newChapter);
  return { ...newChapter };
}

// 更新章节
// 调用 PUT /api/chapters/:id
export async function updateChapter(
  id: string,
  data: Partial<Chapter>
): Promise<Chapter> {
  if (!isApiAvailable) {
    return mockUpdateChapter(id, data);
  }
  try {
    return await put<Chapter>(`/chapters/${id}`, data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockUpdateChapter(id, data);
  }
}

// Mock 降级：更新章节
function mockUpdateChapter(
  id: string,
  data: Partial<Chapter>
): Chapter {
  const idx = localChapters.findIndex((c) => c._id === id);
  if (idx === -1) throw new Error("章节不存在");
  localChapters[idx] = { ...localChapters[idx], ...data };
  return { ...localChapters[idx] };
}

// 删除章节
// 调用 DELETE /api/chapters/:id
export async function deleteChapter(id: string): Promise<void> {
  if (!isApiAvailable) {
    localChapters = localChapters.filter((c) => c._id !== id);
    return;
  }
  try {
    await del<void>(`/chapters/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localChapters = localChapters.filter((c) => c._id !== id);
  }
}
