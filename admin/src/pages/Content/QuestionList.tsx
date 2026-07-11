import { useMemo, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  ArrowDownUp,
  FileQuestion,
} from "lucide-react";
import type { Question } from "@/types";
import {
  questionTypeMap,
  difficultyMap,
  statusMap,
  formatDateTime,
  cn,
} from "@/lib/utils";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Pagination,
  SearchBar,
  ConfirmDialog,
  Modal,
} from "@/components/ui";
import { questions as questionData } from "@/mock/data/questions";
import { subjects } from "@/mock/data/subjects";
import { QuestionForm } from "./QuestionForm";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "草稿", value: "draft" },
  { label: "待审核", value: "pending" },
  { label: "已发布", value: "published" },
  { label: "已下架", value: "offline" },
];

const TYPE_OPTIONS = [
  { label: "全部题型", value: "" },
  ...Object.entries(questionTypeMap).map(([value, label]) => ({ value, label })),
];

// 去除 HTML 标签后的纯文本
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function QuestionList() {
  const [list, setList] = useState<Question[]>(() => [...questionData]);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // 表单 Modal
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  // 查看 Modal
  const [viewing, setViewing] = useState<Question | null>(null);

  // 删除确认
  const [deleting, setDeleting] = useState<Question | null>(null);

  // 审核确认
  const [reviewing, setReviewing] = useState<Question | null>(null);

  // 下架/发布确认
  const [toggling, setToggling] = useState<Question | null>(null);

  const subjectOptions = useMemo(
    () => [
      { label: "全部科目", value: "" },
      ...subjects.map((s) => ({ label: s.name, value: s._id })),
    ],
    []
  );

  // 过滤
  const filtered = useMemo(() => {
    return list.filter((q) => {
      const text = stripHtml(q.question);
      if (keyword && !text.includes(keyword)) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      if (subjectFilter && q.subjectId !== subjectFilter) return false;
      if (statusFilter && q.status !== statusFilter) return false;
      return true;
    });
  }, [list, keyword, typeFilter, subjectFilter, statusFilter]);

  // 分页
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const subjectMap = useMemo(() => {
    const m = new Map<string, string>();
    subjects.forEach((s) => m.set(s._id, s.name));
    return m;
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (q: Question) => {
    setEditing(q);
    setFormOpen(true);
  };

  const handleSubmit = (data: Partial<Question>, status: "draft" | "pending") => {
    if (editing) {
      setList((prev) =>
        prev.map((q) =>
          q._id === editing._id
            ? { ...q, ...data, status, updateTime: new Date().toISOString() }
            : q
        )
      );
    } else {
      const now = new Date().toISOString();
      const newQ: Question = {
        _id: "q_" + Date.now(),
        examTypeId: data.examTypeId ?? "",
        subjectId: data.subjectId ?? "",
        chapterId: data.chapterId ?? "",
        type: data.type ?? "single",
        difficulty: data.difficulty ?? 3,
        source: data.source,
        question: data.question ?? "",
        options: data.options ?? [],
        answer: data.answer ?? "",
        analysis: data.analysis ?? "",
        knowledgeTags: data.knowledgeTags ?? [],
        status,
        createTime: now,
        updateTime: now,
      };
      setList((prev) => [newQ, ...prev]);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setList((prev) => prev.filter((q) => q._id !== deleting._id));
    setDeleting(null);
  };

  const handleReview = () => {
    if (!reviewing) return;
    setList((prev) =>
      prev.map((q) =>
        q._id === reviewing._id
          ? { ...q, status: "published", updateTime: new Date().toISOString() }
          : q
      )
    );
    setReviewing(null);
  };

  const handleToggle = () => {
    if (!toggling) return;
    const nextStatus = toggling.status === "published" ? "offline" : "published";
    setList((prev) =>
      prev.map((q) =>
        q._id === toggling._id
          ? { ...q, status: nextStatus, updateTime: new Date().toISOString() }
          : q
      )
    );
    setToggling(null);
  };

  return (
    <div className="space-y-4">
      {/* 顶部工具栏 */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <SearchBar
                placeholder="搜索题目内容..."
                onSearch={handleSearch}
                onChange={setKeyword}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="w-32"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                options={TYPE_OPTIONS}
              />
              <Select
                className="w-36"
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setPage(1);
                }}
                options={subjectOptions}
              />
              <Select
                className="w-32"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
              />
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={handleAdd}
              >
                新增题目
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead className="min-w-[18rem]">题目内容</TableHead>
              <TableHead>题型</TableHead>
              <TableHead>难度</TableHead>
              <TableHead>科目</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead align="right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={7}>
                  <TableEmpty
                    icon={<FileQuestion className="h-10 w-10" />}
                    description="暂无题目数据"
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((q) => {
                const diff = difficultyMap[q.difficulty];
                const st = statusMap[q.status];
                return (
                  <TableRow key={q._id}>
                    <TableCell>
                      <div className="max-w-md truncate text-sm text-zinc-700">
                        {stripHtml(q.question).slice(0, 50) || "（空）"}
                        {stripHtml(q.question).length > 50 && "..."}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{questionTypeMap[q.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                          diff?.color
                        )}
                      >
                        {diff?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {subjectMap.get(q.subjectId) ?? "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                          st?.color
                        )}
                      >
                        {st?.label}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-zinc-500">
                      {formatDateTime(q.updateTime)}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewing(q)}
                          className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-zinc-100 hover:text-primary-600"
                          aria-label="查看"
                          title="查看"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(q)}
                          className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-zinc-100 hover:text-primary-600"
                          aria-label="编辑"
                          title="编辑"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {q.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => setReviewing(q)}
                            className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-accent-50 hover:text-accent-600"
                            aria-label="审核"
                            title="审核通过"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {(q.status === "published" || q.status === "offline") && (
                          <button
                            type="button"
                            onClick={() => setToggling(q)}
                            className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-amber-50 hover:text-amber-600"
                            aria-label={q.status === "published" ? "下架" : "发布"}
                            title={q.status === "published" ? "下架" : "发布"}
                          >
                            <ArrowDownUp className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleting(q)}
                          className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-red-50 hover:text-red-500"
                          aria-label="删除"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 分页 */}
      {total > 0 && (
        <div className="flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
          />
        </div>
      )}

      {/* 新增/编辑表单 */}
      <QuestionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initialValue={editing}
        onSubmit={handleSubmit}
      />

      {/* 查看详情 */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="题目详情"
        size="full"
        bodyClassName="max-h-[75vh] overflow-y-auto"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)}>
            关闭
          </Button>
        }
      >
        {viewing && <QuestionDetail question={viewing} subjectName={subjectMap.get(viewing.subjectId)} />}
      </Modal>

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleting}
        title="删除题目"
        message={`确定要删除该题目吗？`}
        description="删除后不可恢复，请谨慎操作。"
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      {/* 审核确认 */}
      <ConfirmDialog
        open={!!reviewing}
        title="审核通过"
        message="确定将该题目审核通过并发布？"
        confirmText="通过"
        confirmVariant="primary"
        onConfirm={handleReview}
        onCancel={() => setReviewing(null)}
      />

      {/* 下架/发布确认 */}
      <ConfirmDialog
        open={!!toggling}
        title={toggling?.status === "published" ? "下架题目" : "发布题目"}
        message={
          toggling?.status === "published"
            ? "下架后该题目将不再对用户可见，确认下架？"
            : "发布后该题目将对用户可见，确认发布？"
        }
        confirmText={toggling?.status === "published" ? "下架" : "发布"}
        confirmVariant={toggling?.status === "published" ? "danger" : "primary"}
        onConfirm={handleToggle}
        onCancel={() => setToggling(null)}
      />
    </div>
  );
}

// 题目详情展示
function QuestionDetail({
  question,
  subjectName,
}: {
  question: Question;
  subjectName?: string;
}) {
  const diff = difficultyMap[question.difficulty];
  const st = statusMap[question.status];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{questionTypeMap[question.type]}</Badge>
        <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", diff?.color)}>
          {diff?.label}
        </span>
        <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", st?.color)}>
          {st?.label}
        </span>
        {subjectName && <Badge variant="default">{subjectName}</Badge>}
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-zinc-400">题目内容</div>
        <div
          className="prose prose-sm max-w-none rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
      </div>

      {question.options.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-zinc-400">选项</div>
          <div className="space-y-1.5">
            {question.options.map((opt) => {
              const isAnswer =
                question.type === "multi"
                  ? question.answer.includes(opt.label)
                  : question.answer === opt.label;
              return (
                <div
                  key={opt.label}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                    isAnswer
                      ? "border-accent-300 bg-accent-50 text-accent-700"
                      : "border-zinc-200 bg-white text-zinc-600"
                  )}
                >
                  <span className="font-medium">{opt.label}.</span>
                  <span>{opt.text}</span>
                  {isAnswer && <CheckCircle className="ml-auto h-4 w-4 text-accent-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 text-xs font-medium text-zinc-400">参考答案</div>
        <div className="rounded-lg bg-accent-50 p-3 text-sm font-medium text-accent-700">
          {question.answer}
        </div>
      </div>

      {question.analysis && (
        <div>
          <div className="mb-1 text-xs font-medium text-zinc-400">解析</div>
          <div
            className="prose prose-sm max-w-none rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600"
            dangerouslySetInnerHTML={{ __html: question.analysis }}
          />
        </div>
      )}

      {question.knowledgeTags.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-zinc-400">知识标签</div>
          <div className="space-y-1.5">
            {question.knowledgeTags.map((tag, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-primary-600">{tag.name}</span>
                {tag.detail && (
                  <span className="ml-2 text-zinc-500">{tag.detail}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {question.source && (
        <div className="text-xs text-zinc-400">来源：{question.source}</div>
      )}
    </div>
  );
}

export default QuestionList;
