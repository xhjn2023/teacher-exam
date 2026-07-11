// API 模块统一导出
// 使用方式：import { getUsers, login, isApiAvailable } from '@/api'

// 基础客户端
export {
  get,
  post,
  put,
  patch,
  del,
  isApiAvailable,
  setApiAvailable,
  checkApiAvailability,
  getToken,
  setToken,
  clearToken,
  paginateMock,
  ApiError,
  type ApiResponse,
} from "./client";

// 认证 API
export { login, getProfile, logout } from "./auth";

// 用户 API
export {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "./users";

// 题目 API
export {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  updateQuestionStatus,
  deleteQuestion,
} from "./questions";

// 科目 API
export {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "./subjects";

// 章节 API
export {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
} from "./chapters";

// 套卷 API
export { getPapers, createPaper, updatePaper, deletePaper } from "./papers";

// 统计 API
export {
  getDashboardStats,
  getUserStats,
  getQuestionStats,
  getContentStats,
  type DashboardStats,
  type UserStats,
  type QuestionStats,
  type ContentStats,
} from "./stats";

// 系统配置 / 日志 / 管理员 API
export {
  getSystemConfig,
  updateSystemConfig,
  getLogs,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "./config";
