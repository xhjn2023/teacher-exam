// 题目管理 API
// 当 API 不可用时，降级使用 mock/data/questions.ts 的数据
import {
  get,
  post,
  put,
  patch,
  del,
  isApiAvailable,
  paginateMock,
} from "./client";
import { questions as mockQuestions } from "@/mock/data/questions";
import type { Question, QueryParams, PaginatedResponse } from "@/types";
import { generateId } from "@/lib/utils";

// 本地可变的 Mock 数据副本（支持增删改）
let localQuestions: Question[] = mockQuestions.map((q) => ({ ...q }));

// Mock 降级：获取题目列表（带分页过滤）
function mockGetQuestions(
  params: QueryParams
): PaginatedResponse<Question> {
  return paginateMock<Question>(localQuestions, params, [
    "question",
    "_id",
    "source",
  ]);
}

// 获取题目列表
// 调用 GET /api/questions
export async function getQuestions(
  params: QueryParams = {}
): Promise<PaginatedResponse<Question>> {
  if (!isApiAvailable) {
    return mockGetQuestions(params);
  }
  try {
    return await get<PaginatedResponse<Question>>("/questions", { ...params });
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetQuestions(params);
  }
}

// 根据 ID 获取题目
// 调用 GET /api/questions/:id
export async function getQuestionById(id: string): Promise<Question> {
  if (!isApiAvailable) {
    const q = localQuestions.find((item) => item._id === id);
    if (!q) throw new Error("题目不存在");
    return { ...q };
  }
  try {
    return await get<Question>(`/questions/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    const q = localQuestions.find((item) => item._id === id);
    if (!q) throw new Error("题目不存在");
    return { ...q };
  }
}

// 新增题目
// 调用 POST /api/questions
export async function createQuestion(
  data: Partial<Question>
): Promise<Question> {
  if (!isApiAvailable) {
    return mockCreateQuestion(data);
  }
  try {
    return await post<Question>("/questions", data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockCreateQuestion(data);
  }
}

// Mock 降级：新增题目
function mockCreateQuestion(data: Partial<Question>): Question {
  const now = new Date().toISOString();
  const newQuestion: Question = {
    _id: generateId("q_"),
    examTypeId: data.examTypeId ?? "",
    subjectId: data.subjectId ?? "",
    chapterId: data.chapterId ?? "",
    type: data.type ?? "single",
    difficulty: data.difficulty ?? 3,
    source: data.source ?? "",
    question: data.question ?? "",
    options: data.options ?? [],
    answer: data.answer ?? "",
    analysis: data.analysis ?? "",
    knowledgeTags: data.knowledgeTags ?? [],
    status: data.status ?? "draft",
    createTime: now,
    updateTime: now,
  };
  localQuestions.unshift(newQuestion);
  return { ...newQuestion };
}

// 更新题目
// 调用 PUT /api/questions/:id
export async function updateQuestion(
  id: string,
  data: Partial<Question>
): Promise<Question> {
  if (!isApiAvailable) {
    return mockUpdateQuestion(id, data);
  }
  try {
    return await put<Question>(`/questions/${id}`, data);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockUpdateQuestion(id, data);
  }
}

// Mock 降级：更新题目
function mockUpdateQuestion(
  id: string,
  data: Partial<Question>
): Question {
  const idx = localQuestions.findIndex((item) => item._id === id);
  if (idx === -1) throw new Error("题目不存在");
  localQuestions[idx] = {
    ...localQuestions[idx],
    ...data,
    updateTime: new Date().toISOString(),
  };
  return { ...localQuestions[idx] };
}

// 更新题目状态
// 调用 PATCH /api/questions/:id/status
export async function updateQuestionStatus(
  id: string,
  status: Question["status"]
): Promise<Question> {
  if (!isApiAvailable) {
    return mockUpdateQuestion(id, { status });
  }
  try {
    return await patch<Question>(`/questions/${id}/status`, { status });
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockUpdateQuestion(id, { status });
  }
}

// 删除题目
// 调用 DELETE /api/questions/:id
export async function deleteQuestion(id: string): Promise<void> {
  if (!isApiAvailable) {
    localQuestions = localQuestions.filter((item) => item._id !== id);
    return;
  }
  try {
    await del<void>(`/questions/${id}`);
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    localQuestions = localQuestions.filter((item) => item._id !== id);
  }
}
