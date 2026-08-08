import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

// MUI Icons
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

// Context and hooks
import useAppContext from "../../context/app/useAppContext.js";
import useCart from "../../context/cart/useCart.js";
import useNotifications from "../../context/notification/useNotifications.js";
import useWishlist from "../../context/wishlist/useWishlist.js";
import useRouteAwareLogout from "../../hooks/useRouteAwareLogout.js";

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

const desktopIconClass =
  "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-transparent text-[#241D20] transition-colors duration-200 hover:border-[#E6DFDA] hover:bg-[#F8F5F1] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function formatCount(count) {
  return count > 99 ? "99+" : count;
}

function getFirstName(user) {
  return user?.fullName?.trim().split(/\s+/)[0] || "Account";
}

function getDesktopNavigationClass({ isActive }) {
  return [
    "group relative inline-flex min-h-11 items-center px-1 font-[Manrope] text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
    isActive ? "text-[#241D20]" : "text-[#756C70] hover:text-[#241D20]",
  ].join(" ");
}

function getMobileNavigationClass({ isActive }) {
  return [
    "flex min-h-12 items-center justify-content border-b px-1 py-3 font-[Manrope] text-[0.95rem] font-semibold transition-colors duration-200",
    isActive
      ? "border-[#E2C79C] text-[#241D20]"
      : "border-[#E6DFDA] text-[#756C70] hover:text-[#241D20]",
  ].join(" ");
}

function HeaderBadge({ count, tone = "dark" }) {
  if (count <= 0) {
    return null;
  }

  const toneClass =
    tone === "red" ? "bg-[#A94747] text-white" : "bg-[#5B4632] text-white";

  return (
    <span
      className={`absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-[Manrope] text-[9px] font-bold leading-none ${toneClass}`}
      aria-hidden="true"
    >
      {formatCount(count)}
    </span>
  );
}

function MobileMenuCount({ count }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#F2E8D8] px-2 text-xs font-bold text-[#5B4632]">
      {formatCount(count)}
    </span>
  );
}

function CustomerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const { user, isAuthenticated, authLoading } = useAppContext();
  const { totalQuantity } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { unreadCount: notificationUnreadCount } = useNotifications();
  const { handleLogout, isLoggingOut } = useRouteAwareLogout();

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const customerFirstName = getFirstName(user);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((currentValue) => !currentValue);
  }

  function handleHeaderKeyDown(event) {
    if (event.key !== "Escape" || !isMobileMenuOpen) {
      return;
    }

    closeMobileMenu();
    menuButtonRef.current?.focus();
  }

  async function handleCustomerLogout() {
    closeMobileMenu();
    await handleLogout();
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-[#E6DFDA] bg-[#FBF8F3]/95 font-[Manrope] text-[#241D20] backdrop-blur-md"
      onKeyDown={handleHeaderKeyDown}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center px-5 sm:px-8 lg:h-[84px] lg:px-12">
        <div className="flex min-w-0 flex-1 items-center lg:basis-1/3">
          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Main navigation"
          >
            {publicNavigation.map(({ label, path, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={getDesktopNavigationClass}
              >
                {({ isActive }) => (
                  <>
                    <span>{label}</span>

                    <span
                      className={`absolute inset-x-1 bottom-1 h-px origin-left bg-[#E2C79C] transition-transform duration-200 ${
                        isActive
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="inline-flex flex-col min-h-11 min-w-0 items-center lg:hidden"
            aria-label="Butterfly Dream home"
          >
            <span className="truncate font-['Bodoni_Moda'] text-[1.55rem] font-medium leading-none tracking-[-0.025em] text-[#241D20] sm:text-[1.75rem] py-0.5">
              Butterfly <span className="italic">Dream</span>
            </span>
            <span className="mt-1.5 font-[Manrope] text-[0.56rem] font-semibold uppercase tracking-[0.34em] text-[#756C70]">
              Jewelry &amp; Accessories
            </span>
          </Link>
        </div>

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="hidden min-h-11 shrink-0 flex-col items-center justify-center px-4 lg:flex lg:basis-1/3"
          aria-label="Butterfly Dream home"
        >
          <span className="font-['Bodoni_Moda'] text-[2rem] font-medium leading-none tracking-[-0.03em] text-[#241D20] xl:text-[2.15rem]">
            Butterfly <span className="italic">Dream</span>
          </span>

          <span className="mt-1.5 font-[Manrope] text-[0.56rem] font-semibold uppercase tracking-[0.34em] text-[#756C70]">
            Jewelry &amp; Accessories
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-1.5 lg:basis-1/3 lg:gap-2">
          {!authLoading && (
            <>
              {isCustomer ? (
                <>
                  <Link
                    to="/notifications"
                    aria-label={`Notifications with ${notificationUnreadCount} unread`}
                    className={`${desktopIconClass} hidden md:inline-flex`}
                  >
                    <NotificationsNoneRoundedIcon fontSize="small" />

                    <HeaderBadge count={notificationUnreadCount} tone="red" />
                  </Link>

                  <Link
                    to="/wishlist"
                    aria-label={`Wishlist with ${wishlistItemCount} ${
                      wishlistItemCount === 1 ? "product" : "products"
                    }`}
                    className={`${desktopIconClass} hidden md:inline-flex`}
                  >
                    <FavoriteBorderRoundedIcon fontSize="small" />

                    <HeaderBadge count={wishlistItemCount} />
                  </Link>
                </>
              ) : null}

              <Link
                to="/cart"
                aria-label={`Shopping cart with ${totalQuantity} ${
                  totalQuantity === 1 ? "item" : "items"
                }`}
                className={desktopIconClass}
              >
                <ShoppingBagOutlinedIcon fontSize="small" />

                <HeaderBadge count={totalQuantity} />
              </Link>

              {isCustomer ? (
                <Link
                  to="/account"
                  className="hidden min-h-11 items-center gap-2 border-l border-[#E6DFDA] pl-4 text-sm font-semibold text-[#241D20] transition-colors hover:text-[#5B4632] lg:flex"
                  aria-label={`Open ${customerFirstName}'s account`}
                >
                  <PersonOutlineRoundedIcon fontSize="small" />

                  <span className="max-w-24 truncate">{customerFirstName}</span>
                </Link>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void handleCustomerLogout()}
                  disabled={isLoggingOut}
                  className="hidden min-h-11 items-center justify-center border border-[#E6DFDA] px-4 text-sm font-semibold text-[#241D20] transition-colors hover:border-[#5B4632] hover:text-[#5B4632] disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              ) : (
                <div className="hidden items-center gap-2 lg:flex">
                  <Link
                    to="/login"
                    className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#241D20] transition-colors hover:text-[#5B4632]"
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex min-h-11 items-center justify-center bg-[#5B4632] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#463526]"
                  >
                    Create account
                  </Link>
                </div>
              )}

              {isCustomer ? (
                <button
                  type="button"
                  onClick={() => void handleCustomerLogout()}
                  disabled={isLoggingOut}
                  aria-label="Log out"
                  className={`${desktopIconClass} hidden lg:inline-flex hover:border-[#A94747]/30 hover:bg-[#A94747]/5 hover:text-[#A94747]`}
                >
                  <LogoutRoundedIcon fontSize="small" />
                </button>
              ) : null}
            </>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMobileMenu}
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-controls="customer-mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E6DFDA] text-[#241D20] transition-colors hover:border-[#E2C79C] hover:bg-white focus-visible:outline-none lg:hidden"
          >
            {isMobileMenuOpen ? (
              <CloseRoundedIcon fontSize="small" />
            ) : (
              <MenuRoundedIcon fontSize="small" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="customer-mobile-navigation"
          className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-[#E6DFDA] bg-[#FBF8F3] lg:hidden"
        >
          <div className="mx-auto max-w-7xl px-5 pb-7 pt-4 sm:px-8">
            {isCustomer && (
              <div className="mb-4 border-b border-[#E6DFDA] pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#756C70]">
                  Welcome back
                </p>

                <p className="mt-1 font-['Bodoni_Moda'] text-2xl font-medium text-[#241D20]">
                  {customerFirstName}
                </p>
              </div>
            )}

            <nav aria-label="Mobile navigation">
              {publicNavigation.map(({ label, path, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={closeMobileMenu}
                  className={getMobileNavigationClass}
                >
                  <span>{label}</span>
                </NavLink>
              ))}

              {isCustomer && (
                <>
                  <NavLink
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className={getMobileNavigationClass}
                  >
                    <span className="flex items-center gap-3">
                      <NotificationsNoneRoundedIcon fontSize="small" />
                      Notifications
                    </span>

                    <MobileMenuCount count={notificationUnreadCount} />
                  </NavLink>

                  <NavLink
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className={getMobileNavigationClass}
                  >
                    <span className="flex items-center gap-3">
                      <FavoriteBorderRoundedIcon fontSize="small" />
                      Wishlist
                    </span>

                    <MobileMenuCount count={wishlistItemCount} />
                  </NavLink>
                </>
              )}

              {isCustomer && (
                <NavLink
                  to="/account"
                  onClick={closeMobileMenu}
                  className={getMobileNavigationClass}
                >
                  <span className="flex items-center gap-3">
                    <PersonOutlineRoundedIcon fontSize="small" />
                    My account
                  </span>
                </NavLink>
              )}
            </nav>

            {!authLoading && (
              <div className="pt-6 flex items-center justify-center gap-3 sm:gap-2">
                <div className="flex flex-col items-center justify-center gap-3 pt-6">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => void handleCustomerLogout()}
                      disabled={isLoggingOut}
                      className="
        inline-flex
        min-h-12
        w-fit
        items-center
        justify-center
        gap-2
        rounded-full
        border
        border-[#A94747]/45
        px-5
        text-sm
        font-semibold
        text-[#A94747]
        transition-colors
        hover:bg-[#A94747]/5
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
                    >
                      <LogoutRoundedIcon fontSize="small" />

                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="
          inline-flex
          min-h-10
          w-fit
          items-center
          justify-center
          rounded-full
          border
          border-[#5B4632]
          px-8
          text-sm
          font-semibold
          text-[#5B4632]
          transition-colors
          hover:bg-white
        "
                      >
                        Sign in
                      </Link>

                      <Link
                        to="/register"
                        onClick={closeMobileMenu}
                        className="
          inline-flex
          min-h-10
          w-fit
          items-center
          justify-center
          rounded-full
          bg-[#5B4632]
          px-8
          text-sm
          font-semibold
          text-white
          transition-colors
          hover:bg-[#463526]
        "
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-xs leading-5 text-[#756C70]">
              Thoughtful accessories for every transformation.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

export default CustomerHeader;
