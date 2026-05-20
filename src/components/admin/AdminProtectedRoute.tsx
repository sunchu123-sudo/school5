import { Navigate, Outlet } from "react-router-dom";
import { isAdminLoggedIn } from "@/lib/admin-storage";

export default function AdminProtectedRoute() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
