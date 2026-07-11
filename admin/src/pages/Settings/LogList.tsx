import { useMemo, useState } from 'react'
import {
  ClipboardList,
  Download,
  Filter,
  RotateCcw,
  Search,
} from 'lucide-react'
import type { OperationLog } from '@/types'
import {
  Badge,
  type BadgeVariant,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { cn, formatDateTime } from '@/lib/utils'
import { logs as allLogs } from '@/mock/data/logs'

const PAGE_SIZE = 10

// 模块选项
const MODULE_OPTIONS = [
  { label: '全部模块', value: '' },
  { label: '题目管理', value: '题目管理' },
  { label: '用户管理', value: '用户管理' },
  { label: '真题套卷', value: '真题套卷' },
  { label: '科目管理', value: '科目管理' },
  { label: '章节管理', value: '章节管理' },
  { label: '管理员管理', value: '管理员管理' },
  { label: '系统配置', value: '系统配置' },
  { label: '数据分析', value: '数据分析' },
]

// 操作类型选项
const ACTION_OPTIONS = [
  { label: '全部操作', value: '' },
  { label: '新增', value: '新增' },
  { label: '编辑', value: '编辑' },
  { label: '删除', value: '删除' },
  { label: '发布', value: '发布' },
  { label: '下线', value: '下线' },
  { label: '审核通过', value: '审核通过' },
  { label: '提交审核', value: '提交审核' },
  { label: '禁用', value: '禁用' },
  { label: '封禁', value: '封禁' },
  { label: '解禁', value: '解禁' },
  { label: '修改', value: '修改' },
  { label: '查看', value: '查看' },
  { label: '导出', value: '导出' },
  { label: '登录', value: '登录' },
]

// 时间范围选项
const TIME_RANGE_OPTIONS = [
  { label: '全部时间', value: '' },
  { label: '近7天', value: '7' },
  { label: '近30天', value: '30' },
  { label: '近90天', value: '90' },
]

// 操作类型对应的 Badge 变体
function getActionBadgeVariant(action: string): BadgeVariant {
  switch (action) {
    case '新增':
    case '发布':
    case '审核通过':
    case '解禁':
      return 'success'
    case '编辑':
    case '修改':
    case '查看':
      return 'info'
    case '删除':
    case '下线':
    case '禁用':
    case '封禁':
      return 'danger'
    case '提交审核':
      return 'warning'
    case '导出':
    case '登录':
      return 'primary'
    default:
      return 'default'
  }
}

// 模块对应的 Badge 变体
function getModuleBadgeVariant(module: string): BadgeVariant {
  switch (module) {
    case '题目管理':
    case '真题套卷':
      return 'primary'
    case '用户管理':
      return 'info'
    case '管理员管理':
    case '系统配置':
      return 'warning'
    case '数据分析':
      return 'success'
    default:
      return 'default'
  }
}

export default function LogList() {
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 按时间倒序排列并过滤
  const filteredLogs = useMemo(() => {
    let result: OperationLog[] = [...allLogs]

    // 模块筛选
    if (moduleFilter) {
      result = result.filter((log) => log.module === moduleFilter)
    }

    // 操作类型筛选
    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter)
    }

    // 时间范围筛选
    if (timeRange) {
      const days = parseInt(timeRange, 10)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      result = result.filter((log) => new Date(log.createTime) >= cutoff)
    }

    // 关键词搜索（在详情、目标、管理员、IP中搜索）
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      result = result.filter(
        (log) =>
          log.detail.toLowerCase().includes(kw) ||
          log.target.toLowerCase().includes(kw) ||
          log.adminName.toLowerCase().includes(kw) ||
          log.ip.toLowerCase().includes(kw)
      )
    }

    // 按时间倒序
    result.sort(
      (a, b) =>
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    )

    return result
  }, [moduleFilter, actionFilter, timeRange, keyword])

  // 当前页数据
  const pagedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredLogs.slice(start, start + PAGE_SIZE)
  }, [filteredLogs, currentPage])

  // 重置筛选
  const handleReset = () => {
    setModuleFilter('')
    setActionFilter('')
    setTimeRange('')
    setKeyword('')
    setCurrentPage(1)
  }

  // 筛选条件变化时重置页码
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setCurrentPage(1)
  }

  const hasActiveFilters = moduleFilter || actionFilter || timeRange || keyword

  return (
    <div className="animate-fade-in space-y-5">
      {/* 页面标题 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">操作日志</h1>
          <p className="mt-1 text-sm text-zinc-500">
            查看系统操作记录，追踪管理员行为与变更历史
          </p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />}>
          导出日志
        </Button>
      </div>

      {/* 筛选区域 */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-600" />
              筛选条件
            </span>
          }
          subtitle="按模块、操作类型、时间范围或关键词筛选日志"
          extra={
            hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={handleReset}
              >
                重置
              </Button>
            ) : undefined
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="模块"
              value={moduleFilter}
              onChange={(e) => handleFilterChange(setModuleFilter)(e.target.value)}
              options={MODULE_OPTIONS}
            />
            <Select
              label="操作类型"
              value={actionFilter}
              onChange={(e) => handleFilterChange(setActionFilter)(e.target.value)}
              options={ACTION_OPTIONS}
            />
            <Select
              label="时间范围"
              value={timeRange}
              onChange={(e) => handleFilterChange(setTimeRange)(e.target.value)}
              options={TIME_RANGE_OPTIONS}
            />
            <Input
              label="关键词"
              placeholder="搜索详情/目标/IP"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setCurrentPage(1)
              }}
              prefix={<Search className="h-4 w-4" />}
            />
          </div>
        </CardBody>
      </Card>

      {/* 日志列表 */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary-600" />
              日志列表
            </span>
          }
          subtitle={`共 ${filteredLogs.length} 条记录`}
        />
        <CardBody padded={false}>
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead className="w-40">时间</TableHead>
                <TableHead className="w-28">管理员</TableHead>
                <TableHead className="w-28">模块</TableHead>
                <TableHead className="w-24">操作</TableHead>
                <TableHead className="w-36">目标</TableHead>
                <TableHead>详情</TableHead>
                <TableHead className="w-32">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="whitespace-nowrap text-zinc-500">
                    {formatDateTime(log.createTime)}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-700">
                    {log.adminName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getModuleBadgeVariant(log.module)}>
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600">{log.target}</TableCell>
                  <TableCell className="max-w-md">
                    <span
                      className="inline-block w-full truncate text-zinc-600"
                      title={log.detail}
                    >
                      {log.detail}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {log.ip}
                  </TableCell>
                </TableRow>
              ))}
              {pagedLogs.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <TableEmpty
                      description={
                        hasActiveFilters ? '没有符合条件的日志记录' : '暂无日志数据'
                      }
                    />
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 分页器 */}
      {filteredLogs.length > 0 && (
        <div className={cn('flex justify-center', 'lg:justify-end')}>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={filteredLogs.length}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
