import { useLocation, useNavigate } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { roleMap, cn } from "@/lib/utils";

const routeNameMap: Record<string, string> = {
  "/dashboard": "仪表盘",
  "/users": "用户管理",
  "/content/questions": "题库管理",
  "/content/subjects": "科目管理",
  "/content/chapters": "章节管理",
  "/content/papers": "真题管理",
  "/statistics": "数据统计",
  "/settings/admins": "管理员管理",
  "/settings/config": "参数配置",
  "/settings/logs": "操作日志",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const currentAdmin = useAuthStore((s) => s.currentAdmin);
  const logout = useAuthStore((s) => s.logout);

  const currentPath = location.pathname;
  const currentName = routeNameMap[currentPath] || 
    (currentPath.includes("/users/") ? "用户详情" : "后台管理");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm">
      {/* 左侧：折叠按钮 + 面包屑 */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <nav className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">首页</span>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
          <span className="font-medium text-zinc-900">{currentName}</span>
        </nav>
      </div>

      {/* 右侧：通知 + 用户 */}
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-medium text-white">
            {currentAdmin?.name.charAt(0) || "A"}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-zinc-900">
              {currentAdmin?.name || "管理员"}
            </p>
            <p className="text-xs text-zinc-500">
              {currentAdmin ? roleMap[currentAdmin.role]?.label : ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600",
            "hover:bg-red-50 hover:text-red-600"
          )}
          title="退出登录"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
