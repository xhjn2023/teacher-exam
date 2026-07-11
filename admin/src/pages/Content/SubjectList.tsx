import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
} from "lucide-react";
import type { Subject, ExamType } from "@/types";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  ConfirmDialog,
  Empty,
} from "@/components/ui";
import { subjects as subjectData } from "@/mock/data/subjects";
import { examTypes } from "@/mock/data/examTypes";

interface SubjectFormState {
  _id?: string;
  examTypeId: string;
  name: string;
  sort: number;
}

interface SubjectFormErrors {
  examTypeId?: string;
  name?: string;
  sort?: string;
}

const DEFAULT_FORM: SubjectFormState = {
  examTypeId: "",
  name: "",
  sort: 1,
};

export function SubjectList() {
  const [list, setList] = useState<Subject[]>(() => [...subjectData]);

  // 表单
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<SubjectFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<SubjectFormErrors>({});
  const isEdit = !!form._id;

  // 删除确认
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const examTypeMap = useMemo(() => {
    const m = new Map<string, ExamType>();
    examTypes.forEach((et) => m.set(et._id, et));
    return m;
  }, []);

  // 按考试类型分组
  const grouped = useMemo(() => {
    const m = new Map<string, Subject[]>();
    list.forEach((s) => {
      const arr = m.get(s.examTypeId) ?? [];
      arr.push(s);
      m.set(s.examTypeId, arr);
    });
    // 组内按 sort 排序
    m.forEach((arr) => arr.sort((a, b) => a.sort - b.sort));
    return m;
  }, [list]);

  const handleAdd = (examTypeId?: string) => {
    setForm({ ...DEFAULT_FORM, examTypeId: examTypeId ?? "" });
    setErrors({});
    setFormOpen(true);
  };

  const handleEdit = (s: Subject) => {
    setForm({ _id: s._id, examTypeId: s.examTypeId, name: s.name, sort: s.sort });
    setErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const next: SubjectFormErrors = {};
    if (!form.examTypeId) next.examTypeId = "请选择考试类型";
    if (!form.name.trim()) next.name = "请输入科目名称";
    if (!form.sort || form.sort < 1) next.sort = "排序需为正整数";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEdit && form._id) {
      setList((prev) =>
        prev.map((s) =>
          s._id === form._id
            ? {
                ...s,
                examTypeId: form.examTypeId,
                name: form.name.trim(),
                sort: form.sort,
              }
            : s
        )
      );
    } else {
      const now = new Date().toISOString();
      const newSubject: Subject = {
        _id: "sub_" + Date.now(),
        examTypeId: form.examTypeId,
        name: form.name.trim(),
        icon: "",
        sort: form.sort,
        questionCount: 0,
        createTime: now,
      };
      setList((prev) => [...prev, newSubject]);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setList((prev) => prev.filter((s) => s._id !== deleting._id));
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => handleAdd()}
        >
          新增科目
        </Button>
      </div>

      {grouped.size === 0 ? (
        <Card>
          <CardBody>
            <Empty
              icon={<BookOpen className="h-12 w-12" />}
              title="暂无科目"
              description="点击右上角新增科目"
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {examTypes.map((et) => {
            const items = grouped.get(et._id) ?? [];
            if (items.length === 0) return null;
            return (
              <Card key={et._id}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary-500" />
                      {et.name}
                    </span>
                  }
                  subtitle={et.desc}
                  extra={
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() => handleAdd(et._id)}
                    >
                      添加科目
                    </Button>
                  }
                />
                <CardBody>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((s) => (
                      <div
                        key={s._id}
                        className="group relative rounded-lg border border-zinc-200 bg-white p-4 transition-base hover:border-primary-300 hover:shadow-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-zinc-800">
                                {s.name}
                              </span>
                              <Badge variant="default">#{s.sort}</Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{formatNumber(s.questionCount)} 道题目</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-base group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEdit(s)}
                              className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-zinc-100 hover:text-primary-600"
                              aria-label="编辑"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(s)}
                              className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-red-50 hover:text-red-500"
                              aria-label="删除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* 新增/编辑 Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={isEdit ? "编辑科目" : "新增科目"}
        size="md"
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
          <Select
            label="考试类型"
            required
            placeholder="请选择考试类型"
            value={form.examTypeId}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, examTypeId: e.target.value }));
              setErrors((prev) => ({ ...prev, examTypeId: undefined }));
            }}
            error={errors.examTypeId}
            options={examTypes.map((et) => ({
              value: et._id,
              label: et.name,
            }))}
          />
          <Input
            label="科目名称"
            required
            placeholder="如：综合素质"
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />
          <Input
            label="排序"
            required
            type="number"
            min={1}
            placeholder="数字越小越靠前"
            value={form.sort}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                sort: Number(e.target.value),
              }));
              setErrors((prev) => ({ ...prev, sort: undefined }));
            }}
            error={errors.sort}
          />
        </div>
      </Modal>

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleting}
        title="删除科目"
        message={`确定要删除科目「${deleting?.name}」吗？`}
        description="删除后相关章节将失去归属，请谨慎操作。"
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

export default SubjectList;
