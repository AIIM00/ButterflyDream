import { Link, NavLink } from "react-router-dom";

//MUI Icons
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
const adminNavigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: ShoppingBagRoundedIcon,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: CategoryRoundedIcon,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ReceiptLongRoundedIcon,
  },
  {
    label: "In-Store Sales",
    path: "/admin/in-store-sales",
    icon: StorefrontRoundedIcon,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: WarehouseRoundedIcon,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: GroupRoundedIcon,
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: NotificationsRoundedIcon,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: SettingsRoundedIcon,
  },
];

function SidebarContent({ onClose, onLogout, isLoggingOut, showCloseButton }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between border-b border-gray-800 px-6">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-950">
            B
          </span>

          <div>
            <p className="font-bold text-white">Butterfly Dream</p>

            <p className="text-xs text-gray-400">Administration</p>
          </div>
        </Link>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <CloseRoundedIcon />
          </button>
        )}
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-4 py-6"
        aria-label="Admin navigation"
      >
        {adminNavigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-white text-gray-950"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              ].join(" ")
            }
          >
            <Icon fontSize="small" />

            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-gray-800 p-4">
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          <OpenInNewRoundedIcon fontSize="small" />
          View storefront
        </Link>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/50 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogoutRoundedIcon fontSize="small" />

          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}

function AdminSidebar({ isMobileOpen, onMobileClose, onLogout, isLoggingOut }) {
  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 bg-gray-950 lg:sticky lg:top-0 lg:block">
        <SidebarContent
          onClose={() => {}}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          showCloseButton={false}
        />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={onMobileClose}
            className="absolute inset-0 bg-gray-950/60"
          />

          <aside className="relative h-full w-[min(19rem,88vw)] bg-gray-950 shadow-2xl">
            <SidebarContent
              onClose={onMobileClose}
              onLogout={onLogout}
              isLoggingOut={isLoggingOut}
              showCloseButton
            />
          </aside>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
