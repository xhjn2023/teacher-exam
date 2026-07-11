import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ListChecks,
  CheckCircle2,
  Target,
  Pencil,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Input,
  Select,
  type BadgeVariant,
  type SelectOption,
} from '@/components/ui'
import {
  cn,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from '@/lib/utils'
import { users as mockUsers } from '@/mock/data/users'
import type { User, DailyStat } from '@/types'
import UserForm, { type UserFormValues } from './UserForm'

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

const statusOptions: SelectOption[] = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'disabled' },
  { label: '封禁', value: 'banned' },
]

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
  accent: string
}

function StatCard({ icon, label, value, unit, accent }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
              accent
            )}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="text-sm text-zinc-500">{label}</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold text-zinc-800">{value}</span>
              {unit && <span className="text-xs text-zinc-400">{unit}</span>}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<User | undefined>(() =>
    mockUsers.find((u) => u.userId === userId)
  )

  const [formOpen, setFormOpen] = useState(false)

  // 内联编辑表单状态
  const [editNickName, setEditNickName] = useState(user?.nickName ?? '')
  const [editStatus, setEditStatus] = useState<User['status']>(user?.status ?? 'active')
  const [editError, setEditError] = useState<string | undefined>(undefined)

  // 每日答题趋势数据（按日期升序）
  const chartData = useMemo<{ date: string; count: number; correctCount: number }[]>(() => {
    if (!user?.dailyStats) return []
    return [...user.dailyStats]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d: DailyStat) => ({
        date: d.date.slice(5),
        count: d.count,
        correctCount: d.correctCount,
      }))
  }, [user])

  const handleEditSubmit = (values: UserFormValues) => {
    if (!user) return
    setUser((prev) =>
      prev
        ? { ...prev, ...values, updateTime: new Date().toISOString() }
        : prev
    )
    setEditNickName(values.nickName)
    setEditStatus(values.status)
    setFormOpen(false)
  }

  const handleInlineSave = () => {
    const trimmed = editNickName.trim()
    if (!trimmed) {
      setEditError('请输入昵称')
      return
    }
    if (trimmed.length > 20) {
      setEditError('昵称不能超过20个字符')
      return
    }
    setEditError(undefined)
    setUser((prev) =>
      prev
        ? {
            ...prev,
            nickName: trimmed,
            status: editStatus,
            updateTime: new Date().toISOString(),
          }
        : prev
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          返回
        </Button>
        <Card>
          <CardBody padded>
            <div className="py-12 text-center text-zinc-400">
              未找到用户ID为「{userId}」的用户
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 顶部返回按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          返回用户列表
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Pencil className="h-4 w-4" />}
          onClick={() => setFormOpen(true)}
        >
          编辑用户
        </Button>
      </div>

      {/* 用户基本信息卡片 */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.nickName}
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-zinc-100"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-medium text-primary-700">
                {getInitial(user.nickName)}
              </span>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-800">
                  {user.nickName}
                </h2>
                <Badge variant={statusBadgeVariant(user.status)} dot rounded>
                  {statusLabel(user.status)}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                <span>用户ID：{user.userId}</span>
                <span>注册时间：{formatDate(user.createTime)}</span>
                <span>最后更新：{formatDateTime(user.updateTime)}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 学习统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-primary-600" />}
          label="学习天数"
          value={user.totalDays}
          unit="天"
          accent="bg-primary-50"
        />
        <StatCard
          icon={<ListChecks className="h-5 w-5 text-blue-600" />}
          label="答题总数"
          value={formatNumber(user.totalCount)}
          unit="题"
          accent="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-accent-600" />}
          label="答对数量"
          value={formatNumber(user.correctCount)}
          unit="题"
          accent="bg-accent-50"
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-amber-600" />}
          label="正确率"
          value={formatPercent(user.correctRate, 1)}
          accent="bg-amber-50"
        />
      </div>

      {/* 每日答题趋势折线图 */}
      <Card>
        <CardHeader title="每日答题趋势" subtitle="近期每日答题数与正确数对比" />
        <CardBody>
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              暂无答题记录
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e4e4e7' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e4e4e7',
                      fontSize: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ color: '#52525b', fontWeight: 600 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="答题数"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="correctCount"
                    name="正确数"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10b981' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 用户信息编辑表单 */}
      <Card>
        <CardHeader title="编辑用户信息" subtitle="修改用户昵称与账号状态" />
        <CardBody>
          <div className="max-w-md space-y-4">
            <Input
              label="昵称"
              required
              placeholder="请输入用户昵称"
              value={editNickName}
              onChange={(e) => {
                setEditNickName(e.target.value)
                if (editError) setEditError(undefined)
              }}
              error={editError}
              maxLength={20}
            />
            <Select
              label="状态"
              required
              options={statusOptions}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as User['status'])}
              hint="启用：用户可正常使用；禁用：临时停用；封禁：永久禁止登录"
            />
            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" onClick={handleInlineSave}>
                保存修改
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditNickName(user.nickName)
                  setEditStatus(user.status)
                  setEditError(undefined)
                }}
              >
                重置
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 编辑 Modal */}
      <UserForm
        open={formOpen}
        user={user}
        onClose={() => setFormOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
