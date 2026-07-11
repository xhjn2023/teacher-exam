import type { SystemConfig } from "@/types";

// 系统配置模拟数据
export const systemConfig: SystemConfig = {
  siteName: "教师考试题库管理后台",
  siteDescription: "教师考试小程序管理系统，提供题库管理、用户管理、数据分析等功能",
  contactEmail: "admin@teacherexam.com",
  maxQuestionsPerExam: 100,
  defaultExamDuration: 120,
  enableRegistration: true,
  enableNotice: true,
  noticeContent: "欢迎使用教师考试题库系统，祝您备考顺利！如有问题请联系客服。",
};
