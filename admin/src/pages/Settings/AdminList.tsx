import { useMemo, useState } from 'react'
import {
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import type { Admin } from '@/types'
import {
  Badge,
  type BadgeVariant,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import {
  cn,
  formatDateTime,
  generateId,
  roleMap,
  statusMap,
} from '@/lib/utils'
import { admins as initialAdmins } from '@/mock/data/admins'

// 角色选项
const ROLE_OPTIONS = [
  { label: '超级管理员', value: 'super' },
  { label: '内容运营', value: 'content' },
  { label: '数据分析', value: 'analytics' },
]

// 表单数据接口
interface AdminFormData {
  username: string
  name: string
  password: string
  role: Admin['role']
  email: string
  phone: string
}

// 表单错误接口
interface AdminFormErrors {
  username?: string
  name?: string
  password?: string
  email?: string
  phone?: string
}

const emptyForm: AdminFormData = {
  username: '',
  name: '',
  password: '',
  role: 'content',
  email: '',
  phone: '',
}

// 邮箱校验
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// 手机号校验
const PHONE_REGEX = /^1[3-9]\d{9}$/

export default function AdminList() {
  const [adminList, setAdminList] = useState<Admin[]>(initialAdmins)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminFormData>(emptyForm)
  const [formErrors, setFormErrors] = useState<AdminFormErrors>({})

  // 确认对话框状态
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {})

  // 计算统计信息
  const stats = useMemo(
    () => ({
      total: adminList.length,
      active: adminList.filter((a) => a.status === 'active').length,
      super: adminList.filter((a) => a.role === 'super').length,
    }),
    [adminList]
  )

  // 打开新增弹窗
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setFormErrors({})
    setModalOpen(true)
  }

  // 打开编辑弹窗
  const handleOpenEdit = (admin: Admin) => {
    setEditingId(admin._id)
    setFormData({
      username: admin.username,
      name: admin.name,
      password: '',
      role: admin.role,
      email: admin.email,
      phone: admin.phone,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  // 表单校验
  const validate = (): boolean => {
    const errors: AdminFormErrors = {}
    if (!formData.username.trim()) {
      errors.username = '请输入用户名'
    } else if (formData.username.trim().length < 3) {
      errors.username = '用户名至少3个字符'
    }
    if (!formData.name.trim()) {
      errors.name = '请输入姓名'
    }
    if (!editingId) {
      if (!formData.password) {
        errors.password = '请输入密码'
      } else if (formData.password.length < 6) {
        errors.password = '密码至少6位'
      }
    }
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱'
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = '邮箱格式不正确'
    }
    if (!formData.phone.trim()) {
      errors.phone = '请输入手机号'
    } else if (!PHONE_REGEX.test(formData.phone)) {
      errors.phone = '手机号格式不正确'
    }
    // 检查用户名重复
    const duplicate = adminList.find(
      (a) => a.username === formData.username.trim() && a._id !== editingId
    )
    if (duplicate) {
      errors.username = '该用户名已存在'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 提交表单
  const handleSubmit = () => {
    if (!validate()) return
    if (editingId) {
      // 编辑模式
      setAdminList((prev) =>
        prev.map((a) =>
          a._id === editingId
            ? {
                ...a,
                username: formData.username.trim(),
                name: formData.name.trim(),
                role: formData.role,
                email: formData.email.trim(),
                phone: formData.phone.trim(),
              }
            : a
        )
      )
    } else {
      // 新增模式
      const newAdmin: Admin = {
        _id: generateId('admin_'),
        username: formData.username.trim(),
        password: formData.password,
        name: formData.name.trim(),
        role: formData.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        lastLoginTime: '-',
        status: 'active',
        createTime: new Date().toISOString(),
      }
      setAdminList((prev) => [...prev, newAdmin])
    }
    setModalOpen(false)
  }

  // 切换状态（启用/禁用）
  const handleToggleStatus = (admin: Admin) => {
    const isDisable = admin.status === 'active'
    setConfirmTitle(isDisable ? '禁用管理员' : '启用管理员')
    setConfirmMessage(
      isDisable
        ? `确定要禁用管理员「${admin.name}」吗？禁用后该账号将无法登录系统。`
        : `确定要启用管理员「${admin.name}」吗？`
    )
    setConfirmAction(() => () => {
      setAdminList((prev) =>
        prev.map((a) =>
          a._id === admin._id
            ? { ...a, status: isDisable ? 'disabled' : 'active' }
            : a
        )
      )
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  // 重置密码
  const handleResetPassword = (admin: Admin) => {
    setConfirmTitle('重置密码')
    setConfirmMessage(
      `确定要重置管理员「${admin.name}」的密码吗？重置后密码将恢复为默认密码。`
    )
    setConfirmAction(() => () => {
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  // 更新表单字段
  const updateField = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* 页面标题 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">管理员管理</h1>
          <p className="mt-1 text-sm text-zinc-500">
            管理系统管理员账号、角色权限与登录状态
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreate}
        >
          新增管理员
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card hoverable>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-zinc-500">管理员总数</div>
              <div className="mt-0.5 text-lg font-semibold text-zinc-800">{stats.total}</div>
            </div>
          </CardBody>
        </Card>
        <Card hoverable>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-zinc-500">启用中</div>
              <div className="mt-0.5 text-lg font-semibold text-zinc-800">{stats.active}</div>
            </div>
          </CardBody>
        </Card>
        <Card hoverable>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-zinc-500">超级管理员</div>
              <div className="mt-0.5 text-lg font-semibold text-zinc-800">{stats.super}</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 管理员列表 */}
      <Card>
        <CardHeader title="管理员列表" subtitle={`共 ${adminList.length} 个账号`} />
        <CardBody padded={false}>
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead>管理员</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>手机</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead align="center">状态</TableHead>
                <TableHead align="center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminList.map((admin) => {
                const role = roleMap[admin.role]
                const status = statusMap[admin.status]
                return (
                  <TableRow key={admin._id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="h-8 w-8 shrink-0 rounded-full bg-zinc-100"
                        />
                        <span className="font-medium text-zinc-800">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600">{admin.username}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                          role.color
                        )}
                      >
                        {role.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-600">{admin.email}</TableCell>
                    <TableCell className="text-zinc-600">{admin.phone}</TableCell>
                    <TableCell className="text-zinc-500">
                      {admin.lastLoginTime === '-'
                        ? '-'
                        : formatDateTime(admin.lastLoginTime)}
                    </TableCell>
                    <TableCell align="center">
                      <Badge
                        variant={
                          (admin.status === 'active' ? 'success' : 'default') as BadgeVariant
                        }
                        dot
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(admin)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-base hover:bg-primary-50 hover:text-primary-600"
                          title="编辑"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin)}
                          className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-md transition-base',
                            admin.status === 'active'
                              ? 'text-zinc-500 hover:bg-amber-50 hover:text-amber-600'
                              : 'text-zinc-500 hover:bg-accent-50 hover:text-accent-600'
                          )}
                          title={admin.status === 'active' ? '禁用' : '启用'}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(admin)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-base hover:bg-blue-50 hover:text-blue-600"
                          title="重置密码"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {adminList.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <TableEmpty description="暂无管理员数据" />
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 新增/编辑管理员 Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '编辑管理员' : '新增管理员'}
        subtitle={editingId ? '修改管理员基本信息' : '创建一个新的管理员账号'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmit} icon={<UserPlus className="h-4 w-4" />}>
              {editingId ? '保存修改' : '创建账号'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="用户名"
            placeholder="请输入登录用户名"
            required
            value={formData.username}
            onChange={(e) => updateField('username', e.target.value)}
            error={formErrors.username}
          />
          <Input
            label="姓名"
            placeholder="请输入管理员姓名"
            required
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={formErrors.name}
          />
          <Input
            label={editingId ? '密码（留空不修改）' : '密码'}
            type="password"
            placeholder={editingId ? '留空则不修改密码' : '请输入登录密码'}
            required={!editingId}
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={formErrors.password}
          />
          <Select
            label="角色"
            required
            value={formData.role}
            onChange={(e) => updateField('role', e.target.value)}
            options={ROLE_OPTIONS}
          />
          <Input
            label="邮箱"
            placeholder="请输入邮箱地址"
            required
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={formErrors.email}
            prefix={<Mail className="h-4 w-4" />}
          />
          <Input
            label="手机号"
            placeholder="请输入手机号"
            required
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            error={formErrors.phone}
            prefix={<Phone className="h-4 w-4" />}
          />
        </div>
      </Modal>

      {/* 确认对话框 */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmVariant={confirmTitle.includes('禁用') ? 'danger' : 'primary'}
        confirmText={confirmTitle.includes('禁用') ? '确认禁用' : '确定'}
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
