import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button, Input } from "@/components/ui";
import { post, setToken } from "@/api/client";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [authError, setAuthError] = useState("");

  const validate = () => {
    const next: { username?: string; password?: string } = {};
    if (!username.trim()) {
      next.username = "请输入用户名";
    }
    if (!password) {
      next.password = "请输入密码";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // 调用后端登录 API
      const res = await post<{ token: string; admin: any }>("/auth/login", {
        username: username.trim(),
        password,
      });

      // 保存 JWT token
      setToken(res.token);

      // 映射后端字段到前端 Admin 类型
      const adminData = {
        _id: res.admin.id,
        username: res.admin.username,
        name: res.admin.name,
        role: res.admin.role,
        avatar: res.admin.avatar || "",
        email: res.admin.email || "",
        phone: res.admin.phone || "",
        lastLoginTime: new Date().toISOString(),
        status: "active" as const,
        createTime: res.admin.createTime || new Date().toISOString(),
      };

      // 更新本地 authStore
      login(username.trim(), password, adminData);

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setAuthError(error.message || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* 顶部 Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">教师考试后台管理系统</h1>
          <p className="mt-2 text-sm text-primary-200">
            Teacher Exam Admin Console
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-800">欢迎登录</h2>
            <p className="mt-1 text-sm text-zinc-500">
              请输入您的账号信息以继续
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="用户名"
              placeholder="请输入用户名"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                if (authError) setAuthError("");
              }}
              error={errors.username}
              prefix={<User className="h-4 w-4" />}
              required
            />

            <Input
              label="密码"
              type={showPassword ? "text" : "password"}
              placeholder="请输入密码"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                if (authError) setAuthError("");
              }}
              error={errors.password}
              prefix={<Lock className="h-4 w-4" />}
              suffix={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-zinc-400 transition-colors hover:text-zinc-600"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
                />
                记住我
              </label>
              <button
                type="button"
                className="text-sm text-primary-600 transition-colors hover:text-primary-700"
              >
                忘记密码？
              </button>
            </div>

            {authError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? "登录中..." : "登 录"}
            </Button>
          </form>

          {/* 默认账号提示 */}
          <div className="mt-6 rounded-lg bg-primary-50 px-4 py-3 text-xs text-primary-700">
            <div className="font-medium">默认管理员账号</div>
            <div className="mt-1 flex items-center gap-2 font-numeric">
              <span>账号：admin</span>
              <span className="text-primary-300">|</span>
              <span>密码：admin123</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-primary-200">
          © 2026 教师考试后台管理系统 · WorkBuddy
        </p>
      </div>
    </div>
  );
}
