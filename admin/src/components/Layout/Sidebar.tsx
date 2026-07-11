import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  BookOpen,
  List,
  FileText,
  BarChart3,
  Shield,
  Settings,
  ScrollText,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { roleMap } from "@/lib/utils";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    items: [
      { path: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
    ],
  },
  {
    title: "用户管理",
    items: [
      { path: "/users", label: "用户列表", icon: Users },
    ],
  },
  {
    title: "内容管理",
    items: [
      { path: "/content/questions", label: "题库管理", icon: FileQuestion, roles: ["super", "content"] },
      { path: "/content/subjects", label: "科目管理", icon: BookOpen, roles: ["super", "content"] },
      { path: "/content/chapters", label: "章节管理", icon: List, roles: ["super", "content"] },
      { path: "/content/papers", label: "真题管理", icon: FileText, roles: ["super", "content"] },
    ],
  },
  {
    title: "数据分析",
    items: [
      { path: "/statistics", label: "数据统计", icon: BarChart3 },
    ],
  },
  {
    title: "系统设置",
    items: [
      { path: "/settings/admins", label: "管理员管理", icon: Shield, roles: ["super"] },
      { path: "/settings/config", label: "参数配置", icon: Settings, roles: ["super"] },
      { path: "/settings/logs", label: "操作日志", icon: ScrollText, roles: ["super"] },
    ],
  },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const currentAdmin = useAuthStore((s) => s.currentAdmin);
  const userRole = currentAdmin?.role || "analytics";

  const filteredGroups = menuGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(userRole)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-primary-900 text-zinc-300 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo 区域 */}
      <div className="flex h-16 items-center justify-between border-b border-primary-800 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-accent-500">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="truncate text-sm font-bold text-white">教师考试后台</h1>
              <p className="truncate text-xs text-zinc-400">管理系统</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="hidden items-center justify-center rounded p-1 text-zinc-400 hover:bg-primary-800 hover:text-white lg:flex"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredGroups.map((group, gIndex) => (
          <div key={gIndex} className="mb-4">
            {group.title && !collapsed && (
              <h2 className="mb-2 px-6 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {group.title}
              </h2>
            )}
            <div className="space-y-1 px-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center",
                        isActive
                          ? "bg-white text-primary-900 shadow-sm"
                          : "text-zinc-300 hover:bg-primary-800 hover:text-white"
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 底部用户信息 */}
      {!collapsed && currentAdmin && (
        <div className="border-t border-primary-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-medium text-white">
              {currentAdmin.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{currentAdmin.name}</p>
              <p className="truncate text-xs text-zinc-400">
                {roleMap[currentAdmin.role]?.label || "管理员"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
