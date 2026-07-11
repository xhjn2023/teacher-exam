import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Send,
  GripVertical,
} from "lucide-react";
import type {
  Question,
  QuestionOption,
  ExamType,
  Subject,
  Chapter,
} from "@/types";
import {
  questionTypeMap,
  difficultyMap,
  cn,
} from "@/lib/utils";
import {
  Modal,
  Button,
  Input,
  Select,
} from "@/components/ui";
import { examTypes } from "@/mock/data/examTypes";
import { subjects as subjectList } from "@/mock/data/subjects";
import { chapters as chapterList } from "@/mock/data/chapters";

export interface QuestionFormProps {
  open: boolean;
  onClose: () => void;
  initialValue?: Question | null;
  onSubmit: (data: Partial<Question>, status: "draft" | "pending") => void;
}

interface FormState {
  type: Question["type"] | "";
  examTypeId: string;
  subjectId: string;
  chapterId: string;
  difficulty: number;
  source: string;
  question: string;
  options: QuestionOption[];
  answer: string;
  analysis: string;
  knowledgeTags: { name: string; detail: string }[];
}

interface FormErrors {
  type?: string;
  examTypeId?: string;
  subjectId?: string;
  chapterId?: string;
  difficulty?: string;
  question?: string;
  options?: string;
  answer?: string;
}

const DEFAULT_FORM: FormState = {
  type: "",
  examTypeId: "",
  subjectId: "",
  chapterId: "",
  difficulty: 3,
  source: "",
  question: "",
  options: [
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ],
  answer: "",
  analysis: "",
  knowledgeTags: [{ name: "", detail: "" }],
};

const OPTION_LABELS = "ABCDEFGH".split("");

function getJudgeOptions(): QuestionOption[] {
  return [
    { label: "A", text: "正确" },
    { label: "B", text: "错误" },
  ];
}

export function QuestionForm({
  open,
  onClose,
  initialValue,
  onSubmit,
}: QuestionFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // 当打开或 initialValue 变化时同步表单
  useEffect(() => {
    if (!open) return;
    if (initialValue) {
      setForm({
        type: initialValue.type,
        examTypeId: initialValue.examTypeId,
        subjectId: initialValue.subjectId,
        chapterId: initialValue.chapterId,
        difficulty: initialValue.difficulty,
        source: initialValue.source ?? "",
        question: initialValue.question,
        options:
          initialValue.type === "judge"
            ? getJudgeOptions()
            : initialValue.options.length > 0
            ? initialValue.options
            : DEFAULT_FORM.options,
        answer: initialValue.answer,
        analysis: initialValue.analysis,
        knowledgeTags:
          initialValue.knowledgeTags.length > 0
            ? initialValue.knowledgeTags
            : [{ name: "", detail: "" }],
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [open, initialValue]);

  // 题型变化时调整选项
  const handleTypeChange = (type: Question["type"]) => {
    let options = form.options;
    if (type === "judge") {
      options = getJudgeOptions();
    } else if (type === "essay") {
      options = [];
    } else if (form.options.length < 2) {
      options = DEFAULT_FORM.options;
    }
    setForm((prev) => ({
      ...prev,
      type,
      options,
      answer: type === "judge" ? "" : prev.answer,
    }));
    setErrors((prev) => ({ ...prev, type: undefined, options: undefined }));
  };

  // 切换考试类型时清空科目与章节
  const handleExamTypeChange = (examTypeId: string) => {
    setForm((prev) => ({
      ...prev,
      examTypeId,
      subjectId: "",
      chapterId: "",
    }));
    setErrors((prev) => ({
      ...prev,
      examTypeId: undefined,
      subjectId: undefined,
      chapterId: undefined,
    }));
  };

  const handleSubjectChange = (subjectId: string) => {
    setForm((prev) => ({ ...prev, subjectId, chapterId: "" }));
    setErrors((prev) => ({
      ...prev,
      subjectId: undefined,
      chapterId: undefined,
    }));
  };

  const updateOption = (index: number, text: string) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], text };
      return { ...prev, options };
    });
    setErrors((prev) => ({ ...prev, options: undefined }));
  };

  const addOption = () => {
    setForm((prev) => {
      if (prev.options.length >= 8) return prev;
      const nextLabel = OPTION_LABELS[prev.options.length];
      return {
        ...prev,
        options: [...prev.options, { label: nextLabel, text: "" }],
      };
    });
  };

  const removeOption = (index: number) => {
    setForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const options = prev.options
        .filter((_, i) => i !== index)
        .map((opt, i) => ({ ...opt, label: OPTION_LABELS[i] }));
      // 同步修正答案
      const answerChars = prev.answer.split("");
      const removedLabel = prev.options[index].label;
      const newAnswer = answerChars
        .filter((c) => c !== removedLabel)
        .join("");
      return { ...prev, options, answer: newAnswer };
    });
  };

  // 单选/判断答案切换
  const handleSingleAnswer = (label: string) => {
    setForm((prev) => ({ ...prev, answer: label }));
    setErrors((prev) => ({ ...prev, answer: undefined }));
  };

  // 多选答案切换
  const handleMultiAnswer = (label: string) => {
    setForm((prev) => {
      const selected = prev.answer.split("").filter(Boolean);
      const exists = selected.includes(label);
      const next = exists
        ? selected.filter((c) => c !== label)
        : [...selected, label].sort();
      return { ...prev, answer: next.join("") };
    });
    setErrors((prev) => ({ ...prev, answer: undefined }));
  };

  const updateTag = (
    index: number,
    field: "name" | "detail",
    value: string
  ) => {
    setForm((prev) => {
      const knowledgeTags = [...prev.knowledgeTags];
      knowledgeTags[index] = { ...knowledgeTags[index], [field]: value };
      return { ...prev, knowledgeTags };
    });
  };

  const addTag = () => {
    setForm((prev) => ({
      ...prev,
      knowledgeTags: [...prev.knowledgeTags, { name: "", detail: "" }],
    }));
  };

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      knowledgeTags:
        prev.knowledgeTags.length <= 1
          ? prev.knowledgeTags
          : prev.knowledgeTags.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.type) next.type = "请选择题型";
    if (!form.examTypeId) next.examTypeId = "请选择考试类型";
    if (!form.subjectId) next.subjectId = "请选择科目";
    if (!form.chapterId) next.chapterId = "请选择章节";
    if (!form.difficulty) next.difficulty = "请选择难度";
    if (!form.question.trim()) next.question = "请输入题目内容";

    if (form.type === "single" || form.type === "multi") {
      const filled = form.options.filter((o) => o.text.trim());
      if (filled.length < 2) next.options = "至少需要2个有效选项";
    }
    if (form.type !== "essay" && !form.answer) {
      next.answer = "请设置答案";
    }
    if (form.type === "essay" && !form.answer.trim()) {
      next.answer = "请输入参考答案";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (status: "draft" | "pending"): Partial<Question> => {
    // 过滤空选项与空标签
    const options =
      form.type === "judge"
        ? getJudgeOptions()
        : form.type === "essay"
        ? []
        : form.options.filter((o) => o.text.trim());

    const knowledgeTags = form.knowledgeTags.filter((t) => t.name.trim());

    return {
      type: form.type as Question["type"],
      examTypeId: form.examTypeId,
      subjectId: form.subjectId,
      chapterId: form.chapterId,
      difficulty: form.difficulty,
      source: form.source.trim() || undefined,
      question: form.question,
      options,
      answer: form.answer,
      analysis: form.analysis,
      knowledgeTags,
      status,
    };
  };

  const handleSubmit = (status: "draft" | "pending") => {
    // 草稿允许跳过部分校验，但仍需基本字段
    if (status === "pending") {
      if (!validate()) return;
    } else {
      // 草稿至少需要题型与题目内容
      const minimal: FormErrors = {};
      if (!form.type) minimal.type = "请选择题型";
      if (!form.question.trim()) minimal.question = "请输入题目内容";
      setErrors(minimal);
      if (Object.keys(minimal).length > 0) return;
    }
    onSubmit(buildPayload(status), status);
  };

  // 可选科目（基于考试类型）
  const availableSubjects = form.examTypeId
    ? subjectList.filter((s) => s.examTypeId === form.examTypeId)
    : [];
  // 可选章节（基于科目）
  const availableChapters = form.subjectId
    ? chapterList.filter((c) => c.subjectId === form.subjectId)
    : [];

  const isEssay = form.type === "essay";
  const isJudge = form.type === "judge";
  const isMulti = form.type === "multi";
  const showOptions = !isEssay;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValue ? "编辑题目" : "新增题目"}
      subtitle="填写题目信息，可保存为草稿或提交审核"
      size="full"
      bodyClassName="max-h-[75vh] overflow-y-auto"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="secondary"
            icon={<Save className="h-4 w-4" />}
            onClick={() => handleSubmit("draft")}
          >
            保存草稿
          </Button>
          <Button
            variant="primary"
            icon={<Send className="h-4 w-4" />}
            onClick={() => handleSubmit("pending")}
          >
            提交审核
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* 基础信息 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="题型"
            required
            placeholder="请选择题型"
            value={form.type}
            onChange={(e) =>
              handleTypeChange(e.target.value as Question["type"])
            }
            error={errors.type}
            options={Object.entries(questionTypeMap).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Select
            label="考试类型"
            required
            placeholder="请选择考试类型"
            value={form.examTypeId}
            onChange={(e) => handleExamTypeChange(e.target.value)}
            error={errors.examTypeId}
            options={examTypes.map((et: ExamType) => ({
              value: et._id,
              label: et.name,
            }))}
          />
          <Select
            label="科目"
            required
            placeholder="请选择科目"
            value={form.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            error={errors.subjectId}
            disabled={!form.examTypeId}
            options={availableSubjects.map((s: Subject) => ({
              value: s._id,
              label: s.name,
            }))}
          />
          <Select
            label="章节"
            required
            placeholder="请选择章节"
            value={form.chapterId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, chapterId: e.target.value }))
            }
            error={errors.chapterId}
            disabled={!form.subjectId}
            options={availableChapters.map((c: Chapter) => ({
              value: c._id,
              label: c.name,
            }))}
          />
          <Select
            label="难度"
            required
            placeholder="请选择难度"
            value={String(form.difficulty)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                difficulty: Number(e.target.value),
              }))
            }
            error={errors.difficulty}
            options={Object.entries(difficultyMap).map(([value, info]) => ({
              value,
              label: info.label,
            }))}
          />
          <Input
            label="来源"
            placeholder="如：2023上教资真题"
            value={form.source}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, source: e.target.value }))
            }
          />
        </div>

        {/* 题目内容 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            题目内容
            <span className="ml-0.5 text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="支持 HTML 标签，如 <p>、<span> 等"
            value={form.question}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, question: e.target.value }));
              setErrors((prev) => ({ ...prev, question: undefined }));
            }}
            className={cn(
              "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-zinc-800 transition-base",
              "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30",
              errors.question
                ? "border-red-400 focus:border-red-500"
                : "border-zinc-300 focus:border-primary-500"
            )}
          />
          {errors.question && (
            <p className="mt-1.5 text-xs text-red-500">{errors.question}</p>
          )}
        </div>

        {/* 选项配置 */}
        {showOptions && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700">
                选项配置
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              {!isJudge && form.options.length < 8 && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={addOption}
                >
                  添加选项
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {form.options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center text-zinc-300">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-sm font-medium text-primary-600">
                    {opt.label}
                  </span>
                  <input
                    type="text"
                    placeholder={`选项 ${opt.label} 内容`}
                    value={opt.text}
                    disabled={isJudge}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={cn(
                      "h-9 w-full rounded-lg border bg-white px-3 text-sm text-zinc-800 transition-base",
                      "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30",
                      isJudge
                        ? "cursor-not-allowed border-zinc-200 bg-zinc-50"
                        : "border-zinc-300 focus:border-primary-500"
                    )}
                  />
                  {!isJudge && form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-base hover:bg-red-50 hover:text-red-500"
                      aria-label="删除选项"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="mt-1.5 text-xs text-red-500">{errors.options}</p>
            )}
          </div>
        )}

        {/* 答案配置 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            答案
            <span className="ml-0.5 text-red-500">*</span>
          </label>
          {isEssay ? (
            <textarea
              rows={4}
              placeholder="请输入参考答案（支持 HTML）"
              value={form.answer}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, answer: e.target.value }));
                setErrors((prev) => ({ ...prev, answer: undefined }));
              }}
              className={cn(
                "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-zinc-800 transition-base",
                "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30",
                errors.answer
                  ? "border-red-400 focus:border-red-500"
                  : "border-zinc-300 focus:border-primary-500"
              )}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {form.options.map((opt) => {
                const active = isMulti
                  ? form.answer.includes(opt.label)
                  : form.answer === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={isJudge ? false : !opt.text.trim()}
                    onClick={() =>
                      isMulti
                        ? handleMultiAnswer(opt.label)
                        : handleSingleAnswer(opt.label)
                    }
                    className={cn(
                      "inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-base",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                      active
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-zinc-300 bg-white text-zinc-600 hover:border-primary-400 hover:text-primary-600",
                      !isJudge && !opt.text.trim() && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
          {errors.answer && (
            <p className="mt-1.5 text-xs text-red-500">{errors.answer}</p>
          )}
          {isMulti && (
            <p className="mt-1.5 text-xs text-zinc-400">
              可选择多个选项，当前已选 {form.answer.length} 项
            </p>
          )}
        </div>

        {/* 解析 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            解析
          </label>
          <textarea
            rows={3}
            placeholder="请输入答案解析（支持 HTML）"
            value={form.analysis}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, analysis: e.target.value }))
            }
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 transition-base placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>

        {/* 知识标签 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-zinc-700">
              知识标签
            </label>
            <Button
              size="sm"
              variant="ghost"
              icon={<Plus className="h-4 w-4" />}
              onClick={addTag}
            >
              添加标签
            </Button>
          </div>
          <div className="space-y-2">
            {form.knowledgeTags.map((tag, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  placeholder="标签名称"
                  value={tag.name}
                  onChange={(e) => updateTag(index, "name", e.target.value)}
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 transition-base placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 sm:w-40"
                />
                <input
                  type="text"
                  placeholder="标签说明"
                  value={tag.detail}
                  onChange={(e) => updateTag(index, "detail", e.target.value)}
                  className="h-9 w-full flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 transition-base placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                {form.knowledgeTags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="shrink-0 self-end rounded-md p-1.5 text-zinc-400 transition-base hover:bg-red-50 hover:text-red-500 sm:self-auto"
                    aria-label="删除标签"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default QuestionForm;
