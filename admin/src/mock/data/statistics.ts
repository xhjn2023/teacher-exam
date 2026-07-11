import type { ChartDataPoint, KpiMetric } from "@/types";

// KPI 指标数据
export const kpiMetrics: KpiMetric[] = [
  {
    label: "总用户数",
    value: 12856,
    unit: "人",
    change: 12.5,
    icon: "users",
    color: "#3b82f6",
  },
  {
    label: "今日活跃",
    value: 3248,
    unit: "人",
    change: 8.2,
    icon: "activity",
    color: "#10b981",
  },
  {
    label: "题目总数",
    value: 8174,
    unit: "道",
    change: 5.6,
    icon: "file-text",
    color: "#f59e0b",
  },
  {
    label: "今日答题量",
    value: 28560,
    unit: "次",
    change: -3.2,
    icon: "edit",
    color: "#8b5cf6",
  },
];

// 用户增长趋势（近30天，按天统计）
export const userGrowthTrend: ChartDataPoint[] = [
  { name: "06-12", value: 12580, newUsers: 86 },
  { name: "06-13", value: 12650, newUsers: 70 },
  { name: "06-14", value: 12710, newUsers: 60 },
  { name: "06-15", value: 12785, newUsers: 75 },
  { name: "06-16", value: 12820, newUsers: 35 },
  { name: "06-17", value: 12830, newUsers: 10 },
  { name: "06-18", value: 12860, newUsers: 30 },
  { name: "06-19", value: 12920, newUsers: 60 },
  { name: "06-20", value: 13010, newUsers: 90 },
  { name: "06-21", value: 13080, newUsers: 70 },
  { name: "06-22", value: 13130, newUsers: 50 },
  { name: "06-23", value: 13155, newUsers: 25 },
  { name: "06-24", value: 13160, newUsers: 5 },
  { name: "06-25", value: 13210, newUsers: 50 },
  { name: "06-26", value: 13280, newUsers: 70 },
  { name: "06-27", value: 13350, newUsers: 70 },
  { name: "06-28", value: 13410, newUsers: 60 },
  { name: "06-29", value: 13430, newUsers: 20 },
  { name: "06-30", value: 13435, newUsers: 5 },
  { name: "07-01", value: 13510, newUsers: 75 },
  { name: "07-02", value: 13590, newUsers: 80 },
  { name: "07-03", value: 13660, newUsers: 70 },
  { name: "07-04", value: 13690, newUsers: 30 },
  { name: "07-05", value: 13695, newUsers: 5 },
  { name: "07-06", value: 13700, newUsers: 5 },
  { name: "07-07", value: 13780, newUsers: 80 },
  { name: "07-08", value: 13860, newUsers: 80 },
  { name: "07-09", value: 13930, newUsers: 70 },
  { name: "07-10", value: 14000, newUsers: 70 },
  { name: "07-11", value: 14086, newUsers: 86 },
];

// 答题量趋势（近12周，按周统计）
export const answerTrend: ChartDataPoint[] = [
  { name: "第16周", value: 156800, correctRate: 76 },
  { name: "第17周", value: 168500, correctRate: 77 },
  { name: "第18周", value: 175200, correctRate: 78 },
  { name: "第19周", value: 182300, correctRate: 78 },
  { name: "第20周", value: 195600, correctRate: 79 },
  { name: "第21周", value: 201800, correctRate: 80 },
  { name: "第22周", value: 198500, correctRate: 79 },
  { name: "第23周", value: 210300, correctRate: 80 },
  { name: "第24周", value: 218700, correctRate: 81 },
  { name: "第25周", value: 225600, correctRate: 81 },
  { name: "第26周", value: 232100, correctRate: 82 },
  { name: "第27周", value: 241800, correctRate: 82 },
];

// 题型分布
export const questionTypeDistribution: ChartDataPoint[] = [
  { name: "单选题", value: 4520 },
  { name: "多选题", value: 1860 },
  { name: "判断题", value: 1230 },
  { name: "简答题", value: 564 },
];

// 科目分布（题目数量）
export const subjectDistribution: ChartDataPoint[] = [
  { name: "综合素质", value: 1256 },
  { name: "教育知识与能力", value: 1480 },
  { name: "教育综合知识", value: 2032 },
  { name: "学科专业知识", value: 1786 },
  { name: "教育理论基础", value: 1620 },
];

// 考试类型分布（用户选择偏好）
export const examTypeDistribution: ChartDataPoint[] = [
  { name: "教师资格证", value: 5680 },
  { name: "教师招聘", value: 4320 },
  { name: "特岗教师", value: 1856 },
];

// 难度分布
export const difficultyDistribution: ChartDataPoint[] = [
  { name: "简单", value: 2450 },
  { name: "中等", value: 3860 },
  { name: "较难", value: 1420 },
  { name: "困难", value: 444 },
];

// 用户状态分布
export const userStatusDistribution: ChartDataPoint[] = [
  { name: "活跃", value: 11820 },
  { name: "禁用", value: 780 },
  { name: "封禁", value: 256 },
];

// 各科目正确率
export const subjectCorrectRate: ChartDataPoint[] = [
  { name: "综合素质", value: 82 },
  { name: "教育知识与能力", value: 76 },
  { name: "教育综合知识", value: 73 },
  { name: "学科专业知识", value: 79 },
  { name: "教育理论基础", value: 75 },
];

// 每日活跃用户趋势（近14天）
export const dailyActiveUsers: ChartDataPoint[] = [
  { name: "06-28", value: 2850 },
  { name: "06-29", value: 2680 },
  { name: "06-30", value: 2520 },
  { name: "07-01", value: 3120 },
  { name: "07-02", value: 3280 },
  { name: "07-03", value: 3350 },
  { name: "07-04", value: 3010 },
  { name: "07-05", value: 2890 },
  { name: "07-06", value: 2750 },
  { name: "07-07", value: 3080 },
  { name: "07-08", value: 3210 },
  { name: "07-09", value: 3180 },
  { name: "07-10", value: 3300 },
  { name: "07-11", value: 3248 },
];

// 章节题目数量分布（综合素质科目）
export const chapterQuestionCount: ChartDataPoint[] = [
  { name: "职业理念", value: 248 },
  { name: "教育法律法规", value: 312 },
  { name: "教师职业道德规范", value: 186 },
  { name: "文化素养", value: 275 },
  { name: "基本能力", value: 235 },
];
