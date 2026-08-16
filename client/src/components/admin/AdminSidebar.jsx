import { Link, NavLink } from "react-router-dom";

// MUI Icons
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
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";

/* =========================================================
   NAVIGATION
========================================================= */

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
    label: "Website",
    path: "/admin/website",
    icon: WebRoundedIcon,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: SettingsRoundedIcon,
  },
];

/* =========================================================
   SIDEBAR CONTENT
========================================================= */

function SidebarContent({ onClose, onLogout, isLoggingOut, showCloseButton }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* =====================================================
          BRAND
      ===================================================== */}
      <div
        className="
          flex
          min-h-[4.75rem]
          items-center
          justify-between
          gap-3
          border-b
          border-white/[0.07]
          px-4

          sm:px-5
        "
      >
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="
            group
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* LOGO */}
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white
              text-sm
              font-black
              tracking-[-0.04em]
              text-gray-950
              shadow-sm
              transition-transform

              group-hover:scale-[1.03]
            "
          >
            B
          </span>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-bold
                tracking-[-0.02em]
                text-white
              "
            >
              Butterfly Dream
            </p>

            <p
              className="
                mt-0.5
                text-[0.6rem]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-gray-500
              "
            >
              Administration
            </p>
          </div>
        </Link>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-500
              transition-colors

              hover:bg-white/10
              hover:text-white
            "
          >
            <CloseRoundedIcon
              sx={{
                fontSize: 20,
              }}
            />
          </button>
        )}
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav
        aria-label="Admin navigation"
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          py-4

          [scrollbar-width:thin]
          [scrollbar-color:rgba(255,255,255,0.15)_transparent]

          sm:px-4
        "
      >
        <p
          className="
            mb-2
            px-3
            text-[0.58rem]
            font-bold
            uppercase
            tracking-[0.14em]
            text-gray-600
          "
        >
          Workspace
        </p>

        <div className="space-y-1">
          {adminNavigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  `
                      group
                      relative
                      flex
                      min-h-11
                      items-center
                      gap-3
                      overflow-hidden
                      rounded-xl
                      px-3
                      text-sm
                      font-semibold
                      transition-all
                    `,
                  isActive
                    ? `
                        bg-white
                        text-gray-950
                        shadow-sm
                      `
                    : `
                        text-gray-400

                        hover:bg-white/[0.06]
                        hover:text-white
                      `,
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* ACTIVE BAR */}
                  {isActive && (
                    <span
                      className="
                          absolute
                          left-0
                          top-1/2
                          h-5
                          w-[3px]
                          -translate-y-1/2
                          rounded-r-full
                          bg-gray-950
                        "
                    />
                  )}

                  <span
                    className={[
                      `
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          transition-colors
                        `,
                      isActive
                        ? "bg-gray-100 text-gray-950"
                        : `
                            text-gray-500

                            group-hover:bg-white/[0.06]
                            group-hover:text-white
                          `,
                    ].join(" ")}
                  >
                    <Icon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  </span>

                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div
        className="
          shrink-0
          border-t
          border-white/[0.07]
          p-3

          sm:p-4
        "
      >
        <p
          className="
            mb-2
            px-3
            text-[0.58rem]
            font-bold
            uppercase
            tracking-[0.14em]
            text-gray-600
          "
        >
          Account
        </p>

        <div className="space-y-1">
          {/* STOREFRONT */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="
              group
              flex
              min-h-11
              items-center
              gap-3
              rounded-xl
              px-3
              text-sm
              font-semibold
              text-gray-400
              transition-colors

              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-gray-500
                transition-colors

                group-hover:bg-white/[0.06]
                group-hover:text-white
              "
            >
              <OpenInNewRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            </span>

            <span className="min-w-0 flex-1 truncate">View storefront</span>

            <OpenInNewRoundedIcon
              sx={{
                fontSize: 14,
              }}
              className="
                shrink-0
                text-gray-600
                transition-colors

                group-hover:text-gray-400
              "
            />
          </Link>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="
              group
              flex
              min-h-11
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              text-left
              text-sm
              font-semibold
              text-red-300
              transition-colors

              hover:bg-red-500/10
              hover:text-red-200

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-red-400
                transition-colors

                group-hover:bg-red-500/10
                group-hover:text-red-300
              "
            >
              <LogoutRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />
            </span>

            <span className="truncate">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function AdminSidebar({ isMobileOpen, onMobileClose, onLogout, isLoggingOut }) {
  return (
    <>
      {/* =====================================================
          DESKTOP
      ===================================================== */}
      <aside
        className="
          sticky
          top-0
          hidden
          h-screen
          w-[17rem]
          shrink-0
          bg-gray-950

          lg:block

          xl:w-72
        "
      >
        <SidebarContent
          onClose={() => {}}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          showCloseButton={false}
        />
      </aside>

      {/* =====================================================
          MOBILE / TABLET DRAWER
      ===================================================== */}
      {isMobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-50

            lg:hidden
          "
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={onMobileClose}
            className="
              absolute
              inset-0
              bg-gray-950/65
              backdrop-blur-[2px]
            "
          />

          {/* DRAWER */}
          <aside
            className="
              relative
              h-full
              w-[min(18rem,86vw)]
              overflow-hidden
              bg-gray-950
              shadow-[18px_0_50px_rgba(0,0,0,0.28)]
            "
          >
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
