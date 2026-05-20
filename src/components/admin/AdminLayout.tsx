import { Outlet, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminNav from "./AdminNav";
import { clearAdminLoggedIn } from "@/lib/admin-storage";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminLoggedIn();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AdminHeader onLogout={handleLogout} />
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        <AdminNav />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
