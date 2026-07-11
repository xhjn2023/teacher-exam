import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  BarChart3,
  Download,
  FileText,
  Flame,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import {
  cn,
  formatNumber,
  formatPercent,
} from '@/lib/utils'
import {
  answerTrend,
  dailyActiveUsers,
  subjectDistribution,
  userGrowthTrend,
  userStatusDistribution,
} from '@/mock/data/statistics'

// 统一图表配色方案
const CHART_COLORS = {
  primary: '#4f46e5',
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  red: '#ef4444',
  cyan: '#06b6d4',
  pink: '#ec4899',
}

const PIE_COLORS = [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.red]

// 时间范围选项
const TIME_RANGES = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
]

// 7日留存率模拟数据（第N日留存率）
const retentionData = [
  { name: '第1日', value: 100 },
  { name: '第2日', value: 68.5 },
  { name: '第3日', value: 52.3 },
  { name: '第4日', value: 43.8 },
  { name: '第5日', value: 38.2 },
  { name: '第6日', value: 34.6 },
  { name: '第7日', value: 31.5 },
]

// 各难度正确率数据
const difficultyCorrectRate = [
  { name: '简单', value: 88.5 },
  { name: '较易', value: 82.3 },
  { name: '中等', value: 71.6 },
  { name: '较难', value: 58.2 },
  { name: '困难', value: 42.8 },
]

// 易错题排行 Top 10
const errorProneQuestions = [
  { rank: 1, question: '下列属于中国古代四大发明的是', errorRate: 78.5, answerCount: 3256 },
  { rank: 2, question: '简述启发式教学的基本要求', errorRate: 72.3, answerCount: 2890 },
  { rank: 3, question: '形成性评价和总结性评价的功能相同', errorRate: 68.7, answerCount: 4120 },
  { rank: 4, question: '下列属于学习动机基本结构的有', errorRate: 65.4, answerCount: 3560 },
  { rank: 5, question: '论述特岗教师的岗位职责', errorRate: 62.1, answerCount: 1980 },
  { rank: 6, question: '皮亚杰的认知发展阶段理论包括哪些', errorRate: 58.9, answerCount: 2740 },
  { rank: 7, question: '维果茨基的最近发展区理论', errorRate: 55.6, answerCount: 3010 },
  { rank: 8, question: '布鲁纳的认知-发现学习理论', errorRate: 52.3, answerCount: 2580 },
  { rank: 9, question: '奥苏贝尔的有意义学习理论', errorRate: 49.8, answerCount: 2230 },
  { rank: 10, question: '加涅的信息加工学习理论', errorRate: 46.5, answerCount: 1890 },
]

// 题目收藏排行
const favoriteQuestions = [
  { rank: 1, question: '皮亚杰的认知发展阶段理论包括哪些', favoriteCount: 3256, subject: '教育知识与能力' },
  { rank: 2, question: '简述启发式教学的基本要求', favoriteCount: 2890, subject: '教育综合知识' },
  { rank: 3, question: '维果茨基的最近发展区理论', favoriteCount: 2740, subject: '教育理论基础' },
  { rank: 4, question: '下列属于中国古代四大发明的是', favoriteCount: 2580, subject: '综合素质' },
  { rank: 5, question: '布鲁纳的认知-发现学习理论', favoriteCount: 2230, subject: '学科专业知识' },
]

// 根据错误率获取颜色
function getErrorRateColor(rate: number): string {
  if (rate >= 70) return 'text-red-600'
  if (rate >= 50) return 'text-orange-600'
  if (rate >= 30) return 'text-amber-600'
  return 'text-accent-600'
}

// Tooltip 样式
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
}

export default function Statistics() {
  const [timeRange, setTimeRange] = useState(30)

  // 根据时间范围过滤用户增长数据
  const filteredUserGrowth = useMemo(() => {
    const len = userGrowthTrend.length
    const sliceLen = Math.min(timeRange, len)
    return userGrowthTrend.slice(len - sliceLen)
  }, [timeRange])

  // 用户增长趋势数据（注册数 + 活跃数）
  const userGrowthChartData = useMemo(() => {
    const activeLen = dailyActiveUsers.length
    return filteredUserGrowth.map((item, idx) => {
      const activeIdx = activeLen - filteredUserGrowth.length + idx
      return {
        name: item.name,
        注册数: item.newUsers as number,
        活跃数: activeIdx >= 0 ? (dailyActiveUsers[activeIdx]?.value as number) : 0,
      }
    })
  }, [filteredUserGrowth])

  // 各科目访问热度（使用科目分布数据）
  const subjectHeatData = useMemo(
    () =>
      [...subjectDistribution]
        .map((item) => ({ name: item.name, 访问量: item.value as number }))
        .sort((a, b) => b.访问量 - a.访问量),
    []
  )

  return (
    <div className="animate-fade-in space-y-5">
      {/* 页面标题与时间范围选择器 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">数据统计</h1>
          <p className="mt-1 text-sm text-zinc-500">
            查看平台运营数据，了解用户行为与内容热度
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setTimeRange(range.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-base',
                  timeRange === range.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="md" icon={<Download className="h-4 w-4" />}>
            导出
          </Button>
        </div>
      </div>

      {/* 用户分析区域 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-semibold text-zinc-800">用户分析</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 用户增长趋势 */}
          <Card>
            <CardHeader
              title="用户增长趋势"
              subtitle={`近${timeRange}天注册与活跃用户数变化`}
            />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userGrowthChartData}
                    margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e4e4e7' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      iconType="circle"
                    />
                    <Line
                      type="monotone"
                      dataKey="注册数"
                      stroke={CHART_COLORS.blue}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART_COLORS.blue }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="活跃数"
                      stroke={CHART_COLORS.green}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART_COLORS.green }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 用户状态分布 */}
          <Card>
            <CardHeader
              title="用户状态分布"
              subtitle="当前用户账号状态统计"
            />
            <CardBody>
              <div className="flex h-72 w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStatusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
                      }
                      labelLine={{ stroke: '#a1a1aa', strokeWidth: 1 }}
                    >
                      {userStatusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number) => formatNumber(value) + ' 人'}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 7日留存率 */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="7日留存率"
              subtitle="新用户注册后7日内的留存情况"
            />
            <CardBody>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={retentionData}
                    margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e4e4e7' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number) => formatPercent(value, 1)}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="留存率"
                      stroke={CHART_COLORS.purple}
                      strokeWidth={2}
                      dot={{ r: 4, fill: CHART_COLORS.purple }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 答题分析区域 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-semibold text-zinc-800">答题分析</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 答题量趋势 */}
          <Card>
            <CardHeader
              title="答题量趋势"
              subtitle="近12周答题量统计"
            />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={answerTrend}
                    margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e4e4e7' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number) => formatNumber(value) + ' 次'}
                    />
                    <Bar
                      dataKey="value"
                      name="答题量"
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 正确率分布（按难度） */}
          <Card>
            <CardHeader
              title="正确率分布"
              subtitle="按题目难度统计的平均正确率"
            />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={difficultyCorrectRate}
                    margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e4e4e7' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number) => formatPercent(value, 1)}
                    />
                    <Bar
                      dataKey="value"
                      name="正确率"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    >
                      {difficultyCorrectRate.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={[
                            CHART_COLORS.green,
                            CHART_COLORS.cyan,
                            CHART_COLORS.amber,
                            CHART_COLORS.purple,
                            CHART_COLORS.red,
                          ][index % 5]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 易错题排行 */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="易错题排行 Top 10"
              subtitle="按错误率降序排列的高错率题目"
              extra={
                <Badge variant="danger" dot>
                  高错误率
                </Badge>
              }
            />
            <CardBody padded={false}>
              <Table>
                <TableHeader>
                  <TableRow hoverable={false}>
                    <TableHead align="center" className="w-16">排名</TableHead>
                    <TableHead>题目内容</TableHead>
                    <TableHead align="right" className="w-32">错误率</TableHead>
                    <TableHead align="right" className="w-32">答题人数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorProneQuestions.map((item) => (
                    <TableRow key={item.rank}>
                      <TableCell align="center">
                        <span
                          className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                            item.rank <= 3
                              ? 'bg-red-50 text-red-600'
                              : 'bg-zinc-100 text-zinc-600'
                          )}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md truncate" title={item.question}>
                        {item.question}
                      </TableCell>
                      <TableCell align="right">
                        <span className={cn('font-semibold', getErrorRateColor(item.errorRate))}>
                          {formatPercent(item.errorRate, 1)}
                        </span>
                      </TableCell>
                      <TableCell align="right" className="text-zinc-600">
                        {formatNumber(item.answerCount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 内容热度区域 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-semibold text-zinc-800">内容热度</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 各科目访问热度 */}
          <Card>
            <CardHeader
              title="各科目访问热度"
              subtitle="按科目统计的访问量排行"
            />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={subjectHeatData}
                    margin={{ top: 8, right: 16, left: 24, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e4e4e7' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                      width={110}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number) => formatNumber(value) + ' 次'}
                    />
                    <Bar
                      dataKey="访问量"
                      fill={CHART_COLORS.amber}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 题目收藏排行 */}
          <Card>
            <CardHeader
              title="题目收藏排行"
              subtitle="收藏数最多的热门题目"
              extra={
                <Badge variant="info" dot>
                  热门
                </Badge>
              }
            />
            <CardBody padded={false}>
              <Table>
                <TableHeader>
                  <TableRow hoverable={false}>
                    <TableHead align="center" className="w-16">排名</TableHead>
                    <TableHead>题目内容</TableHead>
                    <TableHead className="w-36">所属科目</TableHead>
                    <TableHead align="right" className="w-24">收藏数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favoriteQuestions.map((item) => (
                    <TableRow key={item.rank}>
                      <TableCell align="center">
                        <span
                          className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                            item.rank <= 3
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-zinc-100 text-zinc-600'
                          )}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={item.question}>
                        {item.question}
                      </TableCell>
                      <TableCell className="text-zinc-500">
                        <Badge variant="default">{item.subject}</Badge>
                      </TableCell>
                      <TableCell align="right">
                        <span className="font-medium text-amber-600">
                          {formatNumber(item.favoriteCount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 底部概览信息 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '累计注册用户', value: 14086, icon: Users, color: CHART_COLORS.blue },
          { label: '今日活跃用户', value: 3248, icon: Activity, color: CHART_COLORS.green },
          { label: '累计答题量', value: 241800, icon: TrendingUp, color: CHART_COLORS.amber },
          { label: '题目总数', value: 8174, icon: FileText, color: CHART_COLORS.purple },
        ].map((item) => (
          <Card key={item.label} hoverable>
            <CardBody className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: item.color + '15', color: item.color }}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-zinc-500">{item.label}</div>
                <div className="mt-0.5 text-lg font-semibold text-zinc-800">
                  {formatNumber(item.value)}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
