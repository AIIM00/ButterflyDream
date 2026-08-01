import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

//MUI Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

// Context and hooks
import useAppContext from "../../context/app/useAppContext.js";
import useCart from "../../context/cart/useCart.js";
import useRouteAwareLogout from "../../hooks/useRouteAwareLogout.js";
import useWishlist from "../../context/wishlist/useWishlist.js";
import useNotifications from "../../context/notification/useNotifications.js";

const publicNavigation = [
  {
    label: "Home",
    path: "/",
    end: true,
  },
  {
    label: "Shop",
    path: "/products",
    end: false,
  },
];

function getNavigationClass({ isActive }) {
  return [
    "text-sm font-medium transition",
    isActive ? "text-gray-950" : "text-gray-600 hover:text-gray-950",
  ].join(" ");
}

function CustomerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, authLoading } = useAppContext();

  const { totalQuantity } = useCart();

  const { itemCount: wishlistItemCount } = useWishlist();
  const { unreadCount: notificationUnreadCount } = useNotifications();

  const { handleLogout, isLoggingOut } = useRouteAwareLogout();

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  async function handleCustomerLogout() {
    closeMobileMenu();
    await handleLogout();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-3"
          aria-label="Butterfly Dream home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-lg font-bold text-white">
            B
          </span>

          <span className="text-xl font-bold tracking-tight text-gray-950">
            Butterfly Dream
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {publicNavigation.map(({ label, path, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={getNavigationClass}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!authLoading && (
            <>
              {isCustomer ? (
                <>
                  <Link
                    to="/notifications"
                    aria-label={`Notifications with ${notificationUnreadCount} unread`}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  >
                    <NotificationsNoneRoundedIcon />

                    {notificationUnreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                        {notificationUnreadCount > 99
                          ? "99+"
                          : notificationUnreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/wishlist"
                    aria-label={`Wishlist with ${wishlistItemCount} ${
                      wishlistItemCount === 1 ? "product" : "products"
                    }`}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  >
                    <FavoriteBorderRoundedIcon />

                    {wishlistItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                        {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    aria-label={`Shopping cart with ${totalQuantity} ${
                      totalQuantity === 1 ? "item" : "items"
                    }`}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  >
                    <ShoppingBagOutlinedIcon />

                    {totalQuantity > 0 && (
                      <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gray-950 px-1 text-[10px] font-bold leading-none text-white">
                        {totalQuantity > 99 ? "99+" : totalQuantity}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/account"
                    className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-950 hover:text-gray-950"
                  >
                    <PersonOutlineRoundedIcon fontSize="small" />

                    <span>
                      {user.fullName?.trim().split(/\s+/)[0] || "Account"}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleCustomerLogout()}
                    disabled={isLoggingOut}
                    aria-label="Log out"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LogoutRoundedIcon />
                  </button>
                </>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void handleCustomerLogout()}
                  disabled={isLoggingOut}
                  className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Create account
                  </Link>

                  <Link
                    to="/cart"
                    aria-label="Shopping cart"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  >
                    <ShoppingBagOutlinedIcon />
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          aria-label={
            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-800 md:hidden"
        >
          {isMobileMenuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-5 py-6 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {publicNavigation.map(({ label, path, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "rounded-xl px-4 py-3 text-base font-semibold transition",
                    isActive
                      ? "bg-gray-950 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}

            {isCustomer && (
              <>
                <NavLink
                  to="/notifications"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition",
                      isActive
                        ? "bg-gray-950 text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")
                  }
                >
                  <span className="flex items-center gap-3">
                    <NotificationsNoneRoundedIcon />
                    Notifications
                  </span>

                  {notificationUnreadCount > 0 && (
                    <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-gray-950 shadow-sm">
                      {notificationUnreadCount > 99
                        ? "99+"
                        : notificationUnreadCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition",
                      isActive
                        ? "bg-gray-950 text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")
                  }
                >
                  <span className="flex items-center gap-3">
                    <FavoriteBorderRoundedIcon />
                    Wishlist
                  </span>

                  {wishlistItemCount > 0 && (
                    <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-gray-950 shadow-sm">
                      {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}

            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                [
                  "flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition",
                  isActive
                    ? "bg-gray-950 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")
              }
            >
              <span className="flex items-center gap-3">
                <ShoppingBagOutlinedIcon />
                Cart
              </span>

              {totalQuantity > 0 && (
                <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-gray-950 shadow-sm">
                  {totalQuantity > 99 ? "99+" : totalQuantity}
                </span>
              )}
            </NavLink>

            {isCustomer && (
              <NavLink
                to="/account"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition",
                    isActive
                      ? "bg-gray-950 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")
                }
              >
                <PersonOutlineRoundedIcon />
                My account
              </NavLink>
            )}
          </nav>

          {!authLoading && (
            <div className="mt-5 border-t border-gray-200 pt-5">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void handleCustomerLogout()}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogoutRoundedIcon fontSize="small" />

                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800"
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-gray-950 px-4 py-3 text-center font-semibold text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default CustomerHeader;
