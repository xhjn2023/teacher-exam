// 真题套卷管理 API
// 当 API 不可用时，降级使用 mock/data/papers.ts 的数据
import {
  get,
  post,
  put,
  del,
  isApiAvailable,
  paginateMock,
} from "./client";
import { papers as mockPapers } from "@/mock/data/papers";
import type { RealPaper, QueryParams, PaginatedResponse } from "@/types";
import { generateId } from "@/lib/utils";

// 本地可变的 Mock 数据副本（支持增删改）
let localPapers: RealPaper[] = mockPapers.map((p) => ({ ...p }));

// Mock 降级：获取套卷列表
function mockGetPapers(
  params?: QueryParams
): PaginatedResponse<RealPaper> | RealPaper[] {
  if (!params) {
    return [...localPapers];
  }
  return paginateMock<RealPaper>(localPapers, params, ["name", "_id"]);
}

// 获取套卷列表
// 调用 GET /api/papers
export async function getPapers(
  params?: QueryParams
): Promise<PaginatedResponse<RealPaper> | RealPaper[]> {
  if (!isApiAvailable) {
    return mockGetPapers(params);
  }
  try {
    const query = params ? { ...params } : undefined;
    return await get<PaginatedResponse<RealPaper> | RealPaper[]>(
      "/papers",
      query
    );
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetPapers(params);
  }
}

// 新增套卷
// 调用 POST /api/papers
export async function createPaper(
  data: Partial<RealPaper>
): Promise<RealPaper> {
  if (!isApiAvailable) {
    return mockCreatePaper(data);
  }
  try {
    return await post<RealPaper>("/papers", data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockCreatePaper(data);
  }
}

// Mock 降级：新增套卷
function mockCreatePaper(data: Partial<RealPaper>): RealPaper {
  const newPaper: RealPaper = {
    _id: generateId("paper_"),
    examTypeId: data.examTypeId ?? "",
    subjectId: data.subjectId ?? "",
    name: data.name ?? "",
    year: data.year ?? new Date().getFullYear(),
    duration: data.duration ?? 120,
    totalScore: data.totalScore ?? 100,
    questionIds: data.questionIds ?? [],
    status: data.status ?? "draft",
    createTime: new Date().toISOString(),
  };
  localPapers.push(newPaper);
  return { ...newPaper };
}

// 更新套卷
// 调用 PUT /api/papers/:id
export async function updatePaper(
  id: string,
  data: Partial<RealPaper>
): Promise<RealPaper> {
  if (!isApiAvailable) {
    return mockUpdatePaper(id, data);
  }
  try {
    return await put<RealPaper>(`/papers/${id}`, data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockUpdatePaper(id, data);
  }
}

// Mock 降级：更新套卷
function mockUpdatePaper(
  id: string,
  data: Partial<RealPaper>
): RealPaper {
  const idx = localPapers.findIndex((p) => p._id === id);
  if (idx === -1) throw new Error("套卷不存在");
  localPapers[idx] = { ...localPapers[idx], ...data };
  return { ...localPapers[idx] };
}

// 删除套卷
// 调用 DELETE /api/papers/:id
export async function deletePaper(id: string): Promise<void> {
  if (!isApiAvailable) {
    localPapers = localPapers.filter((p) => p._id !== id);
    return;
  }
  try {
    await del<void>(`/papers/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localPapers = localPapers.filter((p) => p._id !== id);
  }
}
