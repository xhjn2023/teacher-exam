import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  BookMarked,
  FolderOpen,
} from "lucide-react";
import type { Chapter, Subject } from "@/types";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardBody,
  CardHeader,
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
  Modal,
  ConfirmDialog,
  Empty,
} from "@/components/ui";
import { chapters as chapterData } from "@/mock/data/chapters";
import { subjects } from "@/mock/data/subjects";

interface ChapterFormState {
  _id?: string;
  subjectId: string;
  name: string;
  sort: number;
}

interface ChapterFormErrors {
  subjectId?: string;
  name?: string;
  sort?: string;
}

const DEFAULT_FORM: ChapterFormState = {
  subjectId: "",
  name: "",
  sort: 1,
};

export function ChapterList() {
  const [list, setList] = useState<Chapter[]>(() => [...chapterData]);
  const [subjectFilter, setSubjectFilter] = useState("");

  // 表单
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ChapterFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<ChapterFormErrors>({});
  const isEdit = !!form._id;

  // 删除确认
  const [deleting, setDeleting] = useState<Chapter | null>(null);

  const subjectMap = useMemo(() => {
    const m = new Map<string, Subject>();
    subjects.forEach((s) => m.set(s._id, s));
    return m;
  }, []);

  // 按科目分组
  const grouped = useMemo(() => {
    const m = new Map<string, Chapter[]>();
    list
      .filter((c) => !subjectFilter || c.subjectId === subjectFilter)
      .forEach((c) => {
        const arr = m.get(c.subjectId) ?? [];
        arr.push(c);
        m.set(c.subjectId, arr);
      });
    m.forEach((arr) => arr.sort((a, b) => a.sort - b.sort));
    return m;
  }, [list, subjectFilter]);

  const handleAdd = (subjectId?: string) => {
    setForm({ ...DEFAULT_FORM, subjectId: subjectId ?? "" });
    setErrors({});
    setFormOpen(true);
  };

  const handleEdit = (c: Chapter) => {
    setForm({ _id: c._id, subjectId: c.subjectId, name: c.name, sort: c.sort });
    setErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const next: ChapterFormErrors = {};
    if (!form.subjectId) next.subjectId = "请选择所属科目";
    if (!form.name.trim()) next.name = "请输入章节名称";
    if (!form.sort || form.sort < 1) next.sort = "排序需为正整数";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEdit && form._id) {
      setList((prev) =>
        prev.map((c) =>
          c._id === form._id
            ? {
                ...c,
                subjectId: form.subjectId,
                name: form.name.trim(),
                sort: form.sort,
              }
            : c
        )
      );
    } else {
      const now = new Date().toISOString();
      const newChapter: Chapter = {
        _id: "ch_" + Date.now(),
        subjectId: form.subjectId,
        name: form.name.trim(),
        sort: form.sort,
        questionCount: 0,
        createTime: now,
      };
      setList((prev) => [...prev, newChapter]);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setList((prev) => prev.filter((c) => c._id !== deleting._id));
    setDeleting(null);
  };

  const subjectOptions = useMemo(
    () => [
      { label: "全部科目", value: "" },
      ...subjects.map((s) => ({ label: s.name, value: s._id })),
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              className="sm:w-48"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              options={subjectOptions}
            />
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => handleAdd()}
            >
              新增章节
            </Button>
          </div>
        </CardBody>
      </Card>

      {grouped.size === 0 ? (
        <Card>
          <CardBody>
            <Empty
              icon={<BookMarked className="h-12 w-12" />}
              title="暂无章节"
              description="点击右上角新增章节"
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {subjects.map((sub) => {
            const items = grouped.get(sub._id) ?? [];
            if (items.length === 0) return null;
            return (
              <Card key={sub._id}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary-500" />
                      {sub.name}
                    </span>
                  }
                  subtitle={`共 ${items.length} 个章节`}
                  extra={
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() => handleAdd(sub._id)}
                    >
                      添加章节
                    </Button>
                  }
                />
                <CardBody padded={false}>
                  <Table>
                    <TableHeader>
                      <TableRow hoverable={false}>
                        <TableHead>章节名称</TableHead>
                        <TableHead>所属科目</TableHead>
                        <TableHead align="center">题目数量</TableHead>
                        <TableHead align="center">排序</TableHead>
                        <TableHead align="right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell>
                            <span className="font-medium text-zinc-700">
                              {c.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-500">
                            {subjectMap.get(c.subjectId)?.name ?? "-"}
                          </TableCell>
                          <TableCell align="center">
                            <Badge variant="info">
                              {formatNumber(c.questionCount)}
                            </Badge>
                          </TableCell>
                          <TableCell align="center" className="text-zinc-500">
                            {c.sort}
                          </TableCell>
                          <TableCell align="right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(c)}
                                className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-zinc-100 hover:text-primary-600"
                                aria-label="编辑"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleting(c)}
                                className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-red-50 hover:text-red-500"
                                aria-label="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
        title={isEdit ? "编辑章节" : "新增章节"}
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
            label="所属科目"
            required
            placeholder="请选择科目"
            value={form.subjectId}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, subjectId: e.target.value }));
              setErrors((prev) => ({ ...prev, subjectId: undefined }));
            }}
            error={errors.subjectId}
            options={subjects.map((s) => ({
              value: s._id,
              label: s.name,
            }))}
          />
          <Input
            label="章节名称"
            required
            placeholder="如：职业理念"
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
        title="删除章节"
        message={`确定要删除章节「${deleting?.name}」吗？`}
        description="删除后相关题目将失去章节归属，请谨慎操作。"
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

export default ChapterList;
