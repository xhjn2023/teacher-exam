import type { ExamType } from "@/types";

// 考试类型模拟数据
export const examTypes: ExamType[] = [
  {
    _id: "exam_01",
    name: "教师资格证",
    desc: "幼儿园/小学/中学教师资格",
    sort: 1,
    subjects: ["sub_01", "sub_02"],
    createTime: "2024-01-15T08:00:00.000Z",
  },
  {
    _id: "exam_02",
    name: "教师招聘",
    desc: "各地区教师编制招聘考试",
    sort: 2,
    subjects: ["sub_03", "sub_04"],
    createTime: "2024-01-15T08:00:00.000Z",
  },
  {
    _id: "exam_03",
    name: "特岗教师",
    desc: "农村义务教育阶段特设岗位",
    sort: 3,
    subjects: ["sub_05"],
    createTime: "2024-01-15T08:00:00.000Z",
  },
];
