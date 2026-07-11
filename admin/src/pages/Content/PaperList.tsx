import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Clock,
  Calendar,
  Hash,
} from "lucide-react";
import type { RealPaper, Subject, ExamType } from "@/types";
import {
  statusMap,
  formatDate,
  cn,
} from "@/lib/utils";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Pagination,
  Modal,
  ConfirmDialog,
  Empty,
} from "@/components/ui";
import { papers as paperData } from "@/mock/data/papers";
import { subjects } from "@/mock/data/subjects";
import { examTypes } from "@/mock/data/examTypes";

const PAGE_SIZE = 10;

interface PaperFormState {
  _id?: string;
  examTypeId: string;
  subjectId: string;
  name: string;
  year: number;
  duration: number;
  totalScore: number;
  status: "draft" | "published";
}

interface PaperFormErrors {
  examTypeId?: string;
  subjectId?: string;
  name?: string;
  year?: string;
  duration?: string;
  totalScore?: string;
}

const DEFAULT_FORM: PaperFormState = {
  examTypeId: "",
  subjectId: "",
  name: "",
  year: new Date().getFullYear(),
  duration: 120,
  totalScore: 150,
  status: "draft",
};

export function PaperList() {
  const [list, setList] = useState<RealPaper[]>(() => [...paperData]);
  const [page, setPage] = useState(1);

  // 表单
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PaperFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<PaperFormErrors>({});
  const isEdit = !!form._id;

  // 查看
  const [viewing, setViewing] = useState<RealPaper | null>(null);

  // 删除
  const [deleting, setDeleting] = useState<RealPaper | null>(null);

  const subjectMap = useMemo(() => {
    const m = new Map<string, Subject>();
    subjects.forEach((s) => m.set(s._id, s));
    return m;
  }, []);

  const examTypeMap = useMemo(() => {
    const m = new Map<string, ExamType>();
    examTypes.forEach((et) => m.set(et._id, et));
    return m;
  }, []);

  // 分页
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = list.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleAdd = () => {
    setForm({ ...DEFAULT_FORM });
    setErrors({});
    setFormOpen(true);
  };

  const handleEdit = (p: RealPaper) => {
    setForm({
      _id: p._id,
      examTypeId: p.examTypeId,
      subjectId: p.subjectId,
      name: p.name,
      year: p.year,
      duration: p.duration,
      totalScore: p.totalScore,
      status: p.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const next: PaperFormErrors = {};
    if (!form.examTypeId) next.examTypeId = "请选择考试类型";
    if (!form.subjectId) next.subjectId = "请选择科目";
    if (!form.name.trim()) next.name = "请输入套卷名称";
    if (!form.year || form.year < 2000) next.year = "请输入有效年份";
    if (!form.duration || form.duration <= 0) next.duration = "时长需大于0";
    if (!form.totalScore || form.totalScore <= 0)
      next.totalScore = "总分需大于0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEdit && form._id) {
      setList((prev) =>
        prev.map((p) =>
          p._id === form._id
            ? {
                ...p,
                examTypeId: form.examTypeId,
                subjectId: form.subjectId,
                name: form.name.trim(),
                year: form.year,
                duration: form.duration,
                totalScore: form.totalScore,
                status: form.status,
              }
            : p
        )
      );
    } else {
      const now = new Date().toISOString();
      const newPaper: RealPaper = {
        _id: "paper_" + Date.now(),
        examTypeId: form.examTypeId,
        subjectId: form.subjectId,
        name: form.name.trim(),
        year: form.year,
        duration: form.duration,
        totalScore: form.totalScore,
        questionIds: [],
        status: form.status,
        createTime: now,
      };
      setList((prev) => [newPaper, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setList((prev) => prev.filter((p) => p._id !== deleting._id));
    setDeleting(null);
  };

  const handleToggleStatus = (p: RealPaper) => {
    const nextStatus = p.status === "published" ? "draft" : "published";
    setList((prev) =>
      prev.map((item) =>
        item._id === p._id ? { ...item, status: nextStatus } : item
      )
    );
  };

  // 可选科目（基于考试类型）
  const availableSubjects = form.examTypeId
    ? subjects.filter((s) => s.examTypeId === form.examTypeId)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAdd}
        >
          新增套卷
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead className="min-w-[20rem]">套卷名称</TableHead>
              <TableHead align="center">年份</TableHead>
              <TableHead align="center">时长</TableHead>
              <TableHead align="center">总分</TableHead>
              <TableHead align="center">题目数</TableHead>
              <TableHead align="center">状态</TableHead>
              <TableHead align="right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={7}>
                  <TableEmpty
                    icon={<FileText className="h-10 w-10" />}
                    description="暂无套卷数据"
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((p) => {
                const st = statusMap[p.status];
                return (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-700">
                            {p.name}
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-400">
                            {examTypeMap.get(p.examTypeId)?.name ?? "-"} ·{" "}
                            {subjectMap.get(p.subjectId)?.name ?? "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <Badge variant="default">{p.year}</Badge>
                    </TableCell>
                    <TableCell align="center" className="text-zinc-600">
                      {p.duration}分钟
                    </TableCell>
                    <TableCell align="center" className="text-zinc-600">
                      {p.totalScore}分
                    </TableCell>
                    <TableCell align="center" className="text-zinc-600">
                      {p.questionIds.length}
                    </TableCell>
                    <TableCell align="center">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                          st?.color
                        )}
                      >
                        {st?.label}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewing(p)}
                          className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-zinc-100 hover:text-primary-600"
                          aria-label="查看"
                          title="查看"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-zinc-100 hover:text-primary-600"
                          aria-label="编辑"
                          title="编辑"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium transition-base",
                            p.status === "published"
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-accent-600 hover:bg-accent-50"
                          )}
                        >
                          {p.status === "published" ? "下架" : "发布"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(p)}
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

      {/* 新增/编辑 Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={isEdit ? "编辑套卷" : "新增套卷"}
        size="lg"
        bodyClassName="max-h-[70vh] overflow-y-auto"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSave}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="考试类型"
              required
              placeholder="请选择考试类型"
              value={form.examTypeId}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  examTypeId: e.target.value,
                  subjectId: "",
                }));
                setErrors((prev) => ({
                  ...prev,
                  examTypeId: undefined,
                  subjectId: undefined,
                }));
              }}
              error={errors.examTypeId}
              options={examTypes.map((et) => ({
                value: et._id,
                label: et.name,
              }))}
            />
            <Select
              label="科目"
              required
              placeholder="请选择科目"
              value={form.subjectId}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, subjectId: e.target.value }));
                setErrors((prev) => ({ ...prev, subjectId: undefined }));
              }}
              error={errors.subjectId}
              disabled={!form.examTypeId}
              options={availableSubjects.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
            />
          </div>
          <Input
            label="套卷名称"
            required
            placeholder="如：2023年上半年教师资格证考试《综合素质》真题"
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="年份"
              required
              type="number"
              min={2000}
              value={form.year}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, year: Number(e.target.value) }));
                setErrors((prev) => ({ ...prev, year: undefined }));
              }}
              error={errors.year}
            />
            <Input
              label="时长（分钟）"
              required
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  duration: Number(e.target.value),
                }));
                setErrors((prev) => ({ ...prev, duration: undefined }));
              }}
              error={errors.duration}
            />
            <Input
              label="总分"
              required
              type="number"
              min={1}
              value={form.totalScore}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  totalScore: Number(e.target.value),
                }));
                setErrors((prev) => ({ ...prev, totalScore: undefined }));
              }}
              error={errors.totalScore}
            />
          </div>
          <Select
            label="状态"
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as "draft" | "published",
              }))
            }
            options={[
              { value: "draft", label: "草稿" },
              { value: "published", label: "已发布" },
            ]}
          />
        </div>
      </Modal>

      {/* 查看详情 */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="套卷详情"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)}>
            关闭
          </Button>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-zinc-400">套卷名称</div>
              <div className="mt-1 text-sm font-medium text-zinc-800">
                {viewing.name}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  年份
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-700">
                  {viewing.year}
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  时长
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-700">
                  {viewing.duration}分钟
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Hash className="h-3.5 w-3.5" />
                  总分
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-700">
                  {viewing.totalScore}分
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <FileText className="h-3.5 w-3.5" />
                  题目数
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-700">
                  {viewing.questionIds.length}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-zinc-400">考试类型</div>
                <div className="mt-1 text-sm text-zinc-700">
                  {examTypeMap.get(viewing.examTypeId)?.name ?? "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-400">科目</div>
                <div className="mt-1 text-sm text-zinc-700">
                  {subjectMap.get(viewing.subjectId)?.name ?? "-"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-zinc-400">状态</div>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      statusMap[viewing.status]?.color
                    )}
                  >
                    {statusMap[viewing.status]?.label}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-400">创建时间</div>
                <div className="mt-1 text-sm text-zinc-700">
                  {formatDate(viewing.createTime)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-400">题目列表</div>
              {viewing.questionIds.length === 0 ? (
                <div className="mt-2">
                  <Empty
                    size="sm"
                    description="暂未关联题目"
                  />
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {viewing.questionIds.map((id) => (
                    <Badge key={id} variant="default">
                      {id}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleting}
        title="删除套卷"
        message={`确定要删除套卷「${deleting?.name}」吗？`}
        description="删除后不可恢复，请谨慎操作。"
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

export default PaperList;
