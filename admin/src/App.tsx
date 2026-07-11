import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ProtectedRoute } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { UserList, UserDetail } from "@/pages/Users";
import {
  QuestionList,
  SubjectList,
  ChapterList,
  PaperList,
} from "@/pages/Content";
import Statistics from "@/pages/Statistics";
import { AdminList, ConfigPage, LogList } from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页 */}
        <Route path="/login" element={<Login />} />

        {/* 受保护路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* 默认重定向到仪表盘 */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* 仪表盘 */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* 用户管理 */}
          <Route path="users" element={<UserList />} />
          <Route path="users/:userId" element={<UserDetail />} />

          {/* 内容管理 */}
          <Route
            path="content/questions"
            element={
              <ProtectedRoute roles={["super", "content"]}>
                <QuestionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="content/subjects"
            element={
              <ProtectedRoute roles={["super", "content"]}>
                <SubjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="content/chapters"
            element={
              <ProtectedRoute roles={["super", "content"]}>
                <ChapterList />
              </ProtectedRoute>
            }
          />
          <Route
            path="content/papers"
            element={
              <ProtectedRoute roles={["super", "content"]}>
                <PaperList />
              </ProtectedRoute>
            }
          />

          {/* 数据统计 */}
          <Route path="statistics" element={<Statistics />} />

          {/* 系统设置 */}
          <Route
            path="settings/admins"
            element={
              <ProtectedRoute roles={["super"]}>
                <AdminList />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/config"
            element={
              <ProtectedRoute roles={["super"]}>
                <ConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/logs"
            element={
              <ProtectedRoute roles={["super"]}>
                <LogList />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 重定向 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
