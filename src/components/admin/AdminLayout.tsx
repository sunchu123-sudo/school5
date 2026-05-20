import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminNav from "./AdminNav";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <AdminHeader />
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        <AdminNav />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
