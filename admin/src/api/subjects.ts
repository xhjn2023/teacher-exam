// 科目管理 API
// 当 API 不可用时，降级使用 mock/data/subjects.ts 的数据
import {
  get,
  post,
  put,
  del,
  isApiAvailable,
  paginateMock,
} from "./client";
import { subjects as mockSubjects } from "@/mock/data/subjects";
import type { Subject, QueryParams, PaginatedResponse } from "@/types";
import { generateId } from "@/lib/utils";

// 本地可变的 Mock 数据副本（支持增删改）
let localSubjects: Subject[] = mockSubjects.map((s) => ({ ...s }));

// Mock 降级：获取科目列表
function mockGetSubjects(
  params?: QueryParams | string
): PaginatedResponse<Subject> | Subject[] {
  // 兼容传入 examTypeId 字符串或查询参数对象
  if (typeof params === "string") {
    const list = localSubjects.filter((s) => s.examTypeId === params);
    return [...list];
  }
  if (!params) {
    return [...localSubjects];
  }
  return paginateMock<Subject>(localSubjects, params, ["name", "_id"]);
}

// 获取科目列表
// 调用 GET /api/subjects
// 可选传入 examTypeId 按考试类型过滤
export async function getSubjects(
  params?: QueryParams | string
): Promise<PaginatedResponse<Subject> | Subject[]> {
  if (!isApiAvailable) {
    return mockGetSubjects(params);
  }
  try {
    const query =
      typeof params === "string"
        ? { examTypeId: params }
        : params
        ? { ...params }
        : undefined;
    return await get<PaginatedResponse<Subject> | Subject[]>("/subjects", query);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetSubjects(params);
  }
}

// 新增科目
// 调用 POST /api/subjects
export async function createSubject(
  data: Partial<Subject>
): Promise<Subject> {
  if (!isApiAvailable) {
    return mockCreateSubject(data);
  }
  try {
    return await post<Subject>("/subjects", data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockCreateSubject(data);
  }
}

// Mock 降级：新增科目
function mockCreateSubject(data: Partial<Subject>): Subject {
  const newSubject: Subject = {
    _id: generateId("sub_"),
    examTypeId: data.examTypeId ?? "",
    name: data.name ?? "",
    icon: data.icon ?? "",
    sort: data.sort ?? 0,
    questionCount: data.questionCount ?? 0,
    createTime: new Date().toISOString(),
  };
  localSubjects.push(newSubject);
  return { ...newSubject };
}

// 更新科目
// 调用 PUT /api/subjects/:id
export async function updateSubject(
  id: string,
  data: Partial<Subject>
): Promise<Subject> {
  if (!isApiAvailable) {
    return mockUpdateSubject(id, data);
  }
  try {
    return await put<Subject>(`/subjects/${id}`, data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockUpdateSubject(id, data);
  }
}

// Mock 降级：更新科目
function mockUpdateSubject(
  id: string,
  data: Partial<Subject>
): Subject {
  const idx = localSubjects.findIndex((s) => s._id === id);
  if (idx === -1) throw new Error("科目不存在");
  localSubjects[idx] = { ...localSubjects[idx], ...data };
  return { ...localSubjects[idx] };
}

// 删除科目
// 调用 DELETE /api/subjects/:id
export async function deleteSubject(id: string): Promise<void> {
  if (!isApiAvailable) {
    localSubjects = localSubjects.filter((s) => s._id !== id);
    return;
  }
  try {
    await del<void>(`/subjects/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localSubjects = localSubjects.filter((s) => s._id !== id);
  }
}
