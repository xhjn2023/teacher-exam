import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Ban, Trash2, Plus, CheckCircle2 } from 'lucide-react'
import {
  Button,
  Badge,
  SearchBar,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Pagination,
  ConfirmDialog,
  type BadgeVariant,
  type SelectOption,
} from '@/components/ui'
import {
  cn,
  formatDate,
  formatNumber,
  formatPercent,
} from '@/lib/utils'
import { getUsers } from '@/api/users'
import type { User } from '@/types'
import UserForm, { type UserFormValues } from './UserForm'

const PAGE_SIZE = 10

const statusOptions: SelectOption[] = [
  { label: '全部状态', value: '' },
  { label: '正常', value: 'active' },
  { label: '已禁用', value: 'disabled' },
  { label: '已封禁', value: 'banned' },
]

function statusBadgeVariant(status: User['status']): BadgeVariant {
  switch (status) {
    case 'active':
      return 'success'
    case 'disabled':
      return 'default'
    case 'banned':
      return 'danger'
    default:
      return 'default'
  }
}

function statusLabel(status: User['status']): string {
  switch (status) {
    case 'active':
      return '正常'
    case 'disabled':
      return '已禁用'
    case 'banned':
      return '已封禁'
    default:
      return '未知'
  }
}

function getInitial(name: string): string {
  return name?.trim()?.charAt(0) ?? '?'
}

function getRateColor(rate: number): string {
  if (rate >= 80) return 'bg-accent-500'
  if (rate >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getRateTextColor(rate: number): string {
  if (rate >= 80) return 'text-accent-600'
  if (rate >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export default function UserList() {
  const navigate = useNavigate()
  const [userList, setUserList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // 从 API 加载用户数据
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const res = await getUsers({ page: 1, pageSize: 1000 })
        setUserList(res.list)
      } catch (error) {
        console.error('加载用户列表失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return userList.filter((u) => {
      const matchKeyword =
        !kw ||
        u.nickName.toLowerCase().includes(kw) ||
        u.userId.toLowerCase().includes(kw)
      const matchStatus = !statusFilter || u.status === statusFilter
      return matchKeyword && matchStatus
    })
  }, [userList, keyword, statusFilter])

  const total = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pagedUsers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, safePage])

  const handleSearch = (val: string) => {
    setKeyword(val)
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handleViewDetail = (user: User) => {
    navigate(`/users/${user.userId}`)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleFormSubmit = (values: UserFormValues) => {
    if (editingUser) {
      setUserList((prev) =>
        prev.map((u) =>
          u._id === editingUser._id
            ? { ...u, ...values, updateTime: new Date().toISOString() }
            : u
        )
      )
    }
    setFormOpen(false)
    setEditingUser(null)
  }

  const handleToggleStatus = (user: User) => {
    const nextStatus: User['status'] = user.status === 'active' ? 'disabled' : 'active'
    setUserList((prev) =>
      prev.map((u) =>
        u._id === user._id
          ? { ...u, status: nextStatus, updateTime: new Date().toISOString() }
          : u
      )
    )
  }

  const handleDelete = (user: User) => {
    setDeleteTarget(user)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setTimeout(() => {
      setUserList((prev) => prev.filter((u) => u._id !== deleteTarget._id))
      setDeleteLoading(false)
      setDeleteTarget(null)
    }, 300)
  }

  return (
    <div className="space-y-4">
      {/* 顶部工具栏 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-72">
            <SearchBar
              value={keyword}
              placeholder="搜索昵称 / 用户ID"
              onSearch={handleSearch}
              onChange={setKeyword}
              onClear={() => setKeyword('')}
            />
          </div>
          <div className="sm:w-40">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
          </div>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      {/* 数据表格 */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-card">
        <Table hoverable>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>用户</TableHead>
              <TableHead>用户ID</TableHead>
              <TableHead align="center">学习天数</TableHead>
              <TableHead align="center">答题总数</TableHead>
              <TableHead>正确率</TableHead>
              <TableHead align="center">状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead align="center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <TableEmpty description="暂无符合条件的用户" />
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => (
                <TableRow key={user._id}>
                  {/* 头像 + 昵称 */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.nickName}
                          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-zinc-100"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                          {getInitial(user.nickName)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-800">
                          {user.nickName}
                        </div>
                        <div className="truncate text-xs text-zinc-400">
                          {user.userId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {/* 用户ID */}
                  <TableCell>
                    <span className="font-mono text-xs text-zinc-500">
                      {user.userId}
                    </span>
                  </TableCell>
                  {/* 学习天数 */}
                  <TableCell align="center">
                    <span className="font-medium text-zinc-700">
                      {user.totalDays}
                    </span>
                    <span className="ml-0.5 text-xs text-zinc-400">天</span>
                  </TableCell>
                  {/* 答题总数 */}
                  <TableCell align="center">
                    <span className="font-medium text-zinc-700">
                      {formatNumber(user.totalCount)}
                    </span>
                  </TableCell>
                  {/* 正确率 */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={cn('h-full rounded-full transition-all', getRateColor(user.correctRate))}
                          style={{ width: `${Math.min(user.correctRate, 100)}%` }}
                        />
                      </div>
                      <span className={cn('text-xs font-medium', getRateTextColor(user.correctRate))}>
                        {formatPercent(user.correctRate, 1)}
                      </span>
                    </div>
                  </TableCell>
                  {/* 状态 */}
                  <TableCell align="center">
                    <Badge variant={statusBadgeVariant(user.status)} dot rounded>
                      {statusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  {/* 注册时间 */}
                  <TableCell>
                    <span className="text-zinc-600">{formatDate(user.createTime)}</span>
                  </TableCell>
                  {/* 操作 */}
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="查看详情"
                        onClick={() => handleViewDetail(user)}
                        className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-primary-50 hover:text-primary-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="编辑"
                        onClick={() => handleEdit(user)}
                        className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title={user.status === 'active' ? '禁用' : '启用'}
                        onClick={() => handleToggleStatus(user)}
                        className={cn(
                          'rounded-md p-1.5 transition-base',
                          user.status === 'active'
                            ? 'text-zinc-400 hover:bg-amber-50 hover:text-amber-600'
                            : 'text-zinc-400 hover:bg-accent-50 hover:text-accent-600'
                        )}
                      >
                        {user.status === 'active' ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        title="删除"
                        onClick={() => handleDelete(user)}
                        className="rounded-md p-1.5 text-zinc-400 transition-base hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="border-t border-zinc-100 px-5 py-3">
          <Pagination
            current={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setCurrentPage}
          />
        </div>
      </div>

      {/* 编辑/新增 Modal */}
      <UserForm
        open={formOpen}
        user={editingUser}
        onClose={() => {
          setFormOpen(false)
          setEditingUser(null)
        }}
        onSubmit={handleFormSubmit}
      />

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除用户"
        message={`确定要删除用户「${deleteTarget?.nickName}」吗？`}
        description="该操作不可恢复，将同时清除该用户的所有学习记录。"
        confirmText="删除"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
      />
    </div>
  )
}
