import { Link, useLocation } from "react-router-dom";

//MUI Icons
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

//Context
import useAppContext from "../../context/app/useAppContext.js";

const adminPageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings",
};

function AdminHeader({ onOpenMenu, onLogout, isLoggingOut }) {
  const { user } = useAppContext();
  const location = useLocation();

  function getAdminPageTitle(pathname) {
    if (pathname === "/admin/products/new") {
      return "Create product";
    }

    if (
      pathname.startsWith("/admin/products/") &&
      pathname !== "/admin/products/new"
    ) {
      return "Manage product";
    }
    if (pathname === "/admin/orders") {
      return "Orders";
    }

    if (pathname.startsWith("/admin/orders/")) {
      return "Manage order";
    }

    return adminPageTitles[pathname] ?? "Administration";
  }

  const pageTitle = getAdminPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-5 px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open admin navigation"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <MenuRoundedIcon />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Admin panel
            </p>

            <h1 className="mt-1 text-xl font-bold text-gray-950">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/admin/notifications"
            aria-label="Admin notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-100"
          >
            <NotificationsNoneRoundedIcon />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Link>

          <div className="hidden border-l border-gray-200 pl-4 sm:block">
            <p className="max-w-48 truncate text-sm font-semibold text-gray-950">
              {user?.fullName || "Administrator"}
            </p>

            <p className="max-w-48 truncate text-xs text-gray-500">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-label="Admin logout"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogoutRoundedIcon fontSize="small" />

            <span className="hidden xl:inline">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
