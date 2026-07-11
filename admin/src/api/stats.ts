// 统计分析 API
// 当 API 不可用时，降级使用 mock/data/statistics.ts 的数据
import { get, isApiAvailable } from "./client";
import {
  kpiMetrics,
  userGrowthTrend,
  answerTrend,
  questionTypeDistribution,
  subjectDistribution,
  examTypeDistribution,
  difficultyDistribution,
  userStatusDistribution,
  subjectCorrectRate,
  dailyActiveUsers,
  chapterQuestionCount,
} from "@/mock/data/statistics";
import type { KpiMetric, ChartDataPoint } from "@/types";

// 仪表盘统计
export interface DashboardStats {
  kpiMetrics: KpiMetric[];
  userGrowthTrend: ChartDataPoint[];
  answerTrend: ChartDataPoint[];
  dailyActiveUsers: ChartDataPoint[];
}

// 用户统计
export interface UserStats {
  userGrowthTrend: ChartDataPoint[];
  userStatusDistribution: ChartDataPoint[];
  dailyActiveUsers: ChartDataPoint[];
  kpiMetrics: KpiMetric[];
}

// 题目统计
export interface QuestionStats {
  questionTypeDistribution: ChartDataPoint[];
  difficultyDistribution: ChartDataPoint[];
  subjectDistribution: ChartDataPoint[];
  subjectCorrectRate: ChartDataPoint[];
}

// 内容统计
export interface ContentStats {
  subjectDistribution: ChartDataPoint[];
  chapterQuestionCount: ChartDataPoint[];
  examTypeDistribution: ChartDataPoint[];
}

// Mock 降级：仪表盘统计
function mockGetDashboardStats(): DashboardStats {
  return {
    kpiMetrics: kpiMetrics.map((k) => ({ ...k })),
    userGrowthTrend: userGrowthTrend.map((d) => ({ ...d })),
    answerTrend: answerTrend.map((d) => ({ ...d })),
    dailyActiveUsers: dailyActiveUsers.map((d) => ({ ...d })),
  };
}

// 获取仪表盘统计
// 调用 GET /api/stats/dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isApiAvailable) {
    return mockGetDashboardStats();
  }
  try {
    return await get<DashboardStats>("/stats/dashboard");
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetDashboardStats();
  }
}

// Mock 降级：用户统计
function mockGetUserStats(): UserStats {
  return {
    userGrowthTrend: userGrowthTrend.map((d) => ({ ...d })),
    userStatusDistribution: userStatusDistribution.map((d) => ({ ...d })),
    dailyActiveUsers: dailyActiveUsers.map((d) => ({ ...d })),
    kpiMetrics: kpiMetrics.map((k) => ({ ...k })),
  };
}

// 获取用户统计
// 调用 GET /api/stats/users
export async function getUserStats(): Promise<UserStats> {
  if (!isApiAvailable) {
    return mockGetUserStats();
  }
  try {
    return await get<UserStats>("/stats/users");
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetUserStats();
  }
}

// Mock 降级：题目统计
function mockGetQuestionStats(): QuestionStats {
  return {
    questionTypeDistribution: questionTypeDistribution.map((d) => ({ ...d })),
    difficultyDistribution: difficultyDistribution.map((d) => ({ ...d })),
    subjectDistribution: subjectDistribution.map((d) => ({ ...d })),
    subjectCorrectRate: subjectCorrectRate.map((d) => ({ ...d })),
  };
}

// 获取题目统计
// 调用 GET /api/stats/questions
export async function getQuestionStats(): Promise<QuestionStats> {
  if (!isApiAvailable) {
    return mockGetQuestionStats();
  }
  try {
    return await get<QuestionStats>("/stats/questions");
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetQuestionStats();
  }
}

// Mock 降级：内容统计
function mockGetContentStats(): ContentStats {
  return {
    subjectDistribution: subjectDistribution.map((d) => ({ ...d })),
    chapterQuestionCount: chapterQuestionCount.map((d) => ({ ...d })),
    examTypeDistribution: examTypeDistribution.map((d) => ({ ...d })),
  };
}

// 获取内容统计
// 调用 GET /api/stats/content
export async function getContentStats(): Promise<ContentStats> {
  if (!isApiAvailable) {
    return mockGetContentStats();
  }
  try {
    return await get<ContentStats>("/stats/content");
  } catch (e) {
    console.warn("API 请求失败，降级使用 Mock 数据", e);
    return mockGetContentStats();
  }
}
