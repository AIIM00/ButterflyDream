import { Link, useLocation } from "react-router-dom";

// MUI Icons
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

// Context
import useAppContext from "../../context/app/useAppContext.js";

/* =========================================================
   PAGE TITLES
========================================================= */

const adminPageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/in-store-sales": "In-Store Sales",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/notifications": "Notifications",
  "/admin/website": "Website",
  "/admin/settings": "Settings",
};

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

  if (pathname.startsWith("/admin/orders/")) {
    return "Manage order";
  }

  return adminPageTitles[pathname] ?? "Administration";
}

/* =========================================================
   HEADER
========================================================= */

function AdminHeader({ onOpenMenu, onLogout, isLoggingOut }) {
  const { user } = useAppContext();
  const location = useLocation();

  const pageTitle = getAdminPageTitle(location.pathname);

  const displayName = user?.fullName?.trim() || "Administrator";

  const userInitial = displayName.charAt(0).toUpperCase() || "A";

  return (
    <header
      className="
        sticky
        top-0
        z-30

        border-b
        border-gray-200/80

        bg-white/90

        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          min-h-[4.25rem]
          items-center
          justify-between
          gap-3

          px-4

          sm:min-h-[4.75rem]
          sm:px-5

          lg:px-6

          xl:px-8
        "
      >
        {/* ===================================================
            LEFT
        =================================================== */}
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3

            sm:gap-4
          "
        >
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open admin navigation"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center

              rounded-xl

              border
              border-gray-200

              bg-white

              text-gray-700

              transition-all

              hover:border-gray-300
              hover:bg-gray-100
              hover:text-gray-950

              lg:hidden
            "
          >
            <MenuRoundedIcon
              sx={{
                fontSize: 21,
              }}
            />
          </button>

          {/* PAGE TITLE */}
          <div className="min-w-0">
            <p
              className="
                hidden

                text-[0.6rem]
                font-bold
                uppercase
                tracking-[0.13em]
                text-gray-400

                sm:block
              "
            >
              Admin panel
            </p>

            <h1
              className="
                truncate

                text-lg
                font-bold
                tracking-[-0.025em]
                text-gray-950

                sm:mt-0.5
                sm:text-xl
              "
            >
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* ===================================================
            RIGHT
        =================================================== */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5

            sm:gap-2
          "
        >
          {/* =================================================
              NOTIFICATIONS
          ================================================= */}
          <Link
            to="/admin/notifications"
            aria-label="Admin notifications"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              border
              border-gray-200

              bg-white

              text-gray-600

              transition-all

              hover:border-gray-300
              hover:bg-gray-100
              hover:text-gray-950

              sm:h-11
              sm:w-11
            "
          >
            <NotificationsNoneRoundedIcon
              sx={{
                fontSize: 21,
              }}
            />

            {/* NOTIFICATION INDICATOR */}
            <span
              className="
                absolute
                right-[7px]
                top-[7px]

                h-2
                w-2

                rounded-full

                bg-red-500

                ring-2
                ring-white
              "
            />
          </Link>

          {/* =================================================
              USER
          ================================================= */}
          <div
            className="
              hidden
              items-center
              gap-2.5

              sm:flex
            "
          >
            <div
              className="
                ml-1
                h-7
                w-px
                bg-gray-200
              "
            />

            {/* AVATAR */}
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-gray-950

                text-xs
                font-bold
                text-white
              "
              aria-hidden="true"
            >
              {userInitial}
            </div>

            {/* USER DETAILS */}
            <div
              className="
                hidden
                min-w-0

                md:block
              "
            >
              <p
                className="
                  max-w-36
                  truncate

                  text-xs
                  font-bold
                  text-gray-950

                  xl:max-w-48
                  xl:text-sm
                "
              >
                {displayName}
              </p>

              {user?.email && (
                <p
                  className="
                    mt-0.5
                    max-w-36
                    truncate

                    text-[0.65rem]
                    text-gray-400

                    xl:max-w-48
                    xl:text-xs
                  "
                >
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* =================================================
              LOGOUT
          ================================================= */}
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-label="Admin logout"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              border
              border-gray-200

              bg-white

              text-gray-500

              transition-all

              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:h-11
              sm:w-11

              xl:w-auto
              xl:gap-2
              xl:px-3.5
            "
          >
            <LogoutRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />

            <span
              className="
                hidden
                text-sm
                font-bold

                xl:inline
              "
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
