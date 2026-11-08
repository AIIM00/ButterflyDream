import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import useRouteAwareLogout from "../hooks/useRouteAwareLogout.js";

function AdminLayout() {
  const { pathname } = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { handleLogout, isLoggingOut } = useRouteAwareLogout();

  function openMobileSidebar() {
    setIsMobileSidebarOpen(true);
  }

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  if (pathname.replace(/\/$/, "") === "/admin/customers") {
    return (
      <div className="cd-shell">
        <header className="cd-nav">
          <Link className="cd-brand" to="/admin/dashboard">
            ButterflyDream
          </Link>
          <nav aria-label="Main admin navigation">
            {[
              ["Overview", "dashboard"],
              ["Orders", "orders"],
              ["Products", "products"],
              ["Customers", "customers"],
              ["Discounts", "discounts"],
            ].map(([name, path]) => (
              <NavLink key={path} to={"/admin/" + path}>
                {name}
              </NavLink>
            ))}
          </nav>
          <details className="cd-more">
            <summary>More</summary>
            <div>
              {[
                ["Categories", "categories"],
                ["Inventory", "inventory"],
                ["In-store sales", "in-store-sales"],
                ["Notifications", "notifications"],
                ["Website", "website"],
                ["Settings", "settings"],
              ].map(([name, path]) => (
                <Link key={path} to={"/admin/" + path}>
                  {name}
                </Link>
              ))}
              <button disabled={isLoggingOut} onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </details>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    );
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
