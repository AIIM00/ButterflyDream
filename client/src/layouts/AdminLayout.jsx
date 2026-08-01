import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import useRouteAwareLogout from "../hooks/useRouteAwareLogout.js";

function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { handleLogout, isLoggingOut } = useRouteAwareLogout();

  function openMobileSidebar() {
    setIsMobileSidebarOpen(true);
  }

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <div className="min-w-0 flex-1">
        <AdminHeader
          onOpenMenu={openMobileSidebar}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
