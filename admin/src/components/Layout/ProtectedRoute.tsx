import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentAdmin = useAuthStore((s) => s.currentAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && currentAdmin && !roles.includes(currentAdmin.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
