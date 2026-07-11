import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Users,
  FileText,
  Edit3,
  TrendingUp,
  TrendingDown,
  UserPlus,
  BarChart3,
  Settings,
  ArrowRight,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardBody } from "@/components/ui";
import { cn, formatNumber } from "@/lib/utils";
import { getDashboardStats } from "@/api/stats";
import type { DashboardStats } from "@/api/stats";

// KPI 配置：图标 + 渐变背景
const kpiConfig: Record<
  string,
  { icon: ReactNode; gradient: string; change: number }
> = {
  users: {
    icon: <Users className="h-6 w-6 text-white" />,
    gradient: "from-blue-500 to-blue-600",
    change: 12.5,
  },
  "file-text": {
    icon: <FileText className="h-6 w-6 text-white" />,
    gradient: "from-amber-500 to-orange-600",
    change: 5.6,
  },
  edit: {
    icon: <Edit3 className="h-6 w-6 text-white" />,
    gradient: "from-purple-500 to-purple-600",
    change: -3.2,
  },
  rate: {
    icon: <Activity className="h-6 w-6 text-white" />,
    gradient: "from-emerald-500 to-emerald-600",
    change: 1.8,
  },
};

// 饼图配色
const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

// 自定义 Tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-card">
      {label && <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-700">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span>{entry.name}:</span>
          <span className="font-numeric font-medium">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  unit: string;
  iconKey: string;
  change: number;
  isPercent?: boolean;
}

function KpiCard({ label, value, unit, iconKey, change, isPercent }: KpiCardProps) {
  const config = kpiConfig[iconKey] || kpiConfig["users"];
  const isUp = change >= 0;
  const displayValue = isPercent ? `${value}%` : `${formatNumber(value)}`;

  return (
    <Card hoverable className="animate-fade-in">
      <CardBody className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-numeric text-3xl font-bold text-zinc-800">
              {displayValue}
            </span>
            {!isPercent && (
              <span className="text-sm text-zinc-400">{unit}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isUp ? "+" : ""}
              {change}%
            </span>
            <span className="text-xs text-zinc-400">环比</span>
          </div>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
            config.gradient
          )}
        >
          {config.icon}
        </div>
      </CardBody>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  desc: string;
  icon: ReactNode;
  gradient: string;
  onClick?: () => void;
}

function QuickAction({ title, desc, icon, gradient, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-card transition-base hover:border-primary-300 hover:shadow-card-hover"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
          gradient
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-zinc-800">{title}</div>
        <div className="mt-0.5 truncate text-xs text-zinc-500">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition-base group-hover:text-primary-500" />
    </button>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("加载仪表盘数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // 计算平均正确率（取近12周答题趋势的平均正确率）
  const avgCorrectRate = useMemo(() => {
    if (!stats?.answerTrend) return 0;
    const rates = stats.answerTrend.map((d) => d.correctRate as number);
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [stats]);

  // KPI 卡片数据
  const kpiCards = useMemo(() => {
    if (!stats?.kpiMetrics) return [];
    const totalUsers = stats.kpiMetrics.find((k) => k.icon === "users")?.value ?? 0;
    const totalQuestions = stats.kpiMetrics.find((k) => k.icon === "file-text")?.value ?? 0;
    const todayAnswers = stats.kpiMetrics.find((k) => k.icon === "edit")?.value ?? 0;
    return [
      { label: "用户总数", value: totalUsers, unit: "人", iconKey: "users", change: 12.5 },
      { label: "题目总数", value: totalQuestions, unit: "道", iconKey: "file-text", change: 5.6 },
      { label: "今日答题量", value: todayAnswers, unit: "次", iconKey: "edit", change: -3.2 },
      { label: "平均正确率", value: avgCorrectRate, unit: "%", iconKey: "rate", change: 1.8, isPercent: true },
    ];
  }, [stats, avgCorrectRate]);

  // 快捷操作
  const quickActions: QuickActionProps[] = [
    {
      title: "添加题目",
      desc: "录入新的考试题目",
      icon: <FileText className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "用户管理",
      desc: "查看与管理用户列表",
      icon: <UserPlus className="h-5 w-5" />,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "数据统计",
      desc: "查看运营数据分析",
      icon: <BarChart3 className="h-5 w-5" />,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "系统设置",
      desc: "配置系统参数",
      icon: <Settings className="h-5 w-5" />,
      gradient: "from-zinc-500 to-zinc-700",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 页面标题 */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-zinc-800">仪表盘</h1>
          <p className="mt-1 text-sm text-zinc-500">
            核心运营指标与数据趋势概览
          </p>
        </div>

        {/* KPI 卡片区 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* 图表区域 第一行 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 用户增长趋势 */}
          <Card className="animate-fade-in">
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <LineChartIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-800">用户增长趋势</div>
                    <div className="text-xs text-zinc-400">最近30天</div>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats?.userGrowthTrend || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatNumber(v)}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      iconType="circle"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="总用户数"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      name="新增用户"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 题型分布饼图 */}
          <Card className="animate-fade-in">
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                    <PieChartIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-800">题型分布</div>
                    <div className="text-xs text-zinc-400">各类型题目数量占比</div>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.questionTypeDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      style={{ fontSize: 11 }}
                    >
                      {(stats?.questionTypeDistribution || []).map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 图表区域 第二行 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 答题量趋势柱状图 */}
          <Card className="animate-fade-in">
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-800">答题量趋势</div>
                    <div className="text-xs text-zinc-400">最近12周</div>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.answerTrend || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatNumber(v)}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                    <Bar
                      dataKey="value"
                      name="答题量"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* 科目题目分布 */}
          <Card className="animate-fade-in">
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <BarChart3 className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-800">科目题目分布</div>
                    <div className="text-xs text-zinc-400">各科目题目数量</div>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.subjectDistribution || []}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatNumber(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      width={110}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                    <Bar
                      dataKey="value"
                      name="题目数"
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 快捷操作区 */}
        <div className="animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-800">快捷操作</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
