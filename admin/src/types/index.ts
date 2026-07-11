// 考试类型
export interface ExamType {
  _id: string;
  name: string;
  desc: string;
  sort: number;
  subjects: string[];
  createTime: string;
}

// 科目
export interface Subject {
  _id: string;
  examTypeId: string;
  name: string;
  icon: string;
  sort: number;
  questionCount: number;
  createTime: string;
}

// 章节
export interface Chapter {
  _id: string;
  subjectId: string;
  name: string;
  sort: number;
  questionCount: number;
  createTime: string;
}

// 题目选项
export interface QuestionOption {
  label: string;
  text: string;
}

// 知识标签
export interface KnowledgeTag {
  name: string;
  detail: string;
}

// 题目
export interface Question {
  _id: string;
  examTypeId: string;
  subjectId: string;
  chapterId: string;
  type: "single" | "multi" | "judge" | "essay";
  difficulty: number;
  source?: string;
  question: string;
  options: QuestionOption[];
  answer: string;
  analysis: string;
  knowledgeTags: KnowledgeTag[];
  status: "draft" | "pending" | "published" | "offline";
  createTime: string;
  updateTime: string;
}

// 真题套卷
export interface RealPaper {
  _id: string;
  examTypeId: string;
  subjectId: string;
  name: string;
  year: number;
  duration: number;
  totalScore: number;
  questionIds: string[];
  status: "draft" | "published";
  createTime: string;
}

// 用户
export interface User {
  _id: string;
  userId: string;
  nickName: string;
  avatarUrl: string;
  totalDays: number;
  totalCount: number;
  correctCount: number;
  correctRate: number;
  dailyStats: DailyStat[];
  status: "active" | "disabled" | "banned";
  createTime: string;
  updateTime: string;
}

// 每日统计
export interface DailyStat {
  date: string;
  count: number;
  correctCount: number;
}

// 管理员
export interface Admin {
  _id: string;
  username: string;
  password: string;
  name: string;
  role: "super" | "content" | "analytics";
  avatar: string;
  email: string;
  phone: string;
  lastLoginTime: string;
  status: "active" | "disabled";
  createTime: string;
}

// 操作日志
export interface OperationLog {
  _id: string;
  adminId: string;
  adminName: string;
  module: string;
  action: string;
  target: string;
  detail: string;
  ip: string;
  createTime: string;
}

// 系统配置
export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxQuestionsPerExam: number;
  defaultExamDuration: number;
  enableRegistration: boolean;
  enableNotice: boolean;
  noticeContent: string;
}

// KPI指标
export interface KpiMetric {
  label: string;
  value: number;
  unit: string;
  change: number;
  icon: string;
  color: string;
}

// 图表数据点
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 查询参数
export interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  type?: string;
  subjectId?: string;
  chapterId?: string;
  examTypeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
