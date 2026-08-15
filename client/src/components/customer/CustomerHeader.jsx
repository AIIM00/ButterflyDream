import { useEffect, useRef, useState } from "react";

import { Link, NavLink } from "react-router-dom";

// MUI Icons
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

// Context and hooks
import useAppContext from "../../context/app/useAppContext.js";
import useCart from "../../context/cart/useCart.js";
import useNotifications from "../../context/notification/useNotifications.js";
import useWishlist from "../../context/wishlist/useWishlist.js";
import useRouteAwareLogout from "../../hooks/useRouteAwareLogout.js";

/* =========================================================
   NAVIGATION
========================================================= */

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
const customerSocials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/butterfly.dream2",
    type: "instagram",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@butterfly.dream22",
    type: "tiktok",
  },
];
/* =========================================================
   HELPERS
========================================================= */

function formatCount(count) {
  return count > 99 ? "99+" : count;
}

function getFirstName(user) {
  return user?.fullName?.trim().split(/\s+/)[0] || "Account";
}

function getInitials(user) {
  const fullName = user?.fullName?.trim();

  if (!fullName) {
    return "A";
  }

  const names = fullName.split(/\s+/).filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

function getDesktopNavigationClass({ isActive }) {
  return [
    `
      group
      relative

      inline-flex
      min-h-10

      items-center

      px-1

      font-body

      text-[0.68rem]
      font-semibold
      uppercase

      tracking-[0.18em]

      transition-colors
      duration-200
    `,

    isActive
      ? "text-brand-text"
      : "text-brand-text-muted hover:text-brand-text",
  ].join(" ");
}

/* =========================================================
   HEADER ICON BUTTON
========================================================= */

const headerIconClass = `
  group/header-action

  relative

  inline-flex
  h-11
  w-11
  shrink-0

  items-center
  justify-center

  rounded-full

  border-0
  bg-transparent

  text-brand-text

  transition-all
  duration-200

  hover:bg-brand-primary/5

  active:scale-90

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-brand-accent-fill/35

  disabled:cursor-not-allowed
  disabled:opacity-50
`;

/* =========================================================
   HEADER BADGE
========================================================= */

function HeaderBadge({ count, tone = "default" }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={`
        absolute

        -right-0.5
        -top-0.5

        flex
        min-h-[17px]
        min-w-[17px]

        items-center
        justify-center

        rounded-full

        px-1

        text-[8px]
        font-bold

        leading-none

        ${
          tone === "error"
            ? `
                bg-brand-error
                text-brand-surface
              `
            : `
                bg-brand-accent-text
                text-brand-surface
              `
        }
      `}
    >
      {formatCount(count)}
    </span>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function CustomerAvatar({ user, size = "header" }) {
  const initials = getInitials(user);

  const sizeClass =
    size === "drawer"
      ? `
          h-12
          w-12

          text-sm
        `
      : `
          h-11
          w-11

          text-[0.7rem]
        `;

  return (
    <span
      className={`
        inline-flex
        shrink-0

        items-center
        justify-center

        rounded-full

        bg-brand-accent-soft

        font-bold

        tracking-[0.06em]

        text-brand-accent-text

        ${sizeClass}
      `}
    >
      {initials}
    </span>
  );
}

/* =========================================================
   DRAWER COUNT
========================================================= */

function DrawerCount({ count }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className="
        inline-flex
        min-h-6
        min-w-6

        items-center
        justify-center

        rounded-full

        bg-brand-accent-soft

        px-2

        text-[0.65rem]
        font-bold

        text-brand-accent-text
      "
    >
      {formatCount(count)}
    </span>
  );
}

/* =========================================================
   DRAWER NAVIGATION ITEM
========================================================= */

function DrawerNavItem({
  to,
  icon: Icon,
  children,
  count = 0,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `
        group/drawer-link

        flex
        min-h-[3.5rem]
        w-full

        items-center
        justify-between

        gap-3

        border-b
        border-brand-border/70

        px-1

        transition-colors
        duration-200

        ${
          isActive
            ? `
                text-brand-text
              `
            : `
                text-brand-text-muted

                hover:text-brand-text
              `
        }
      `}
    >
      {({ isActive }) => (
        <>
          <span
            className="
              flex
              min-w-0

              items-center

              gap-3.5
            "
          >
            <span
              className={`
                inline-flex
                h-9
                w-9
                shrink-0

                items-center
                justify-center

                rounded-full

                transition-colors

                ${
                  isActive
                    ? `
                        bg-brand-accent-soft
                        text-brand-accent-text
                      `
                    : `
                        bg-transparent
                        text-brand-text-muted

                        group-hover/drawer-link:bg-brand-surface-soft
                        group-hover/drawer-link:text-brand-text
                      `
                }
              `}
            >
              <Icon
                sx={{
                  fontSize: 19,
                }}
              />
            </span>

            <span
              className="
                truncate

                text-sm
                font-semibold
              "
            >
              {children}
            </span>
          </span>

          <span
            className="
              flex
              shrink-0

              items-center

              gap-2
            "
          >
            <DrawerCount count={count} />

            <ArrowForwardIosRoundedIcon
              sx={{
                fontSize: 12,
              }}
              className="
                text-brand-text-muted/50

                transition-transform
                duration-200

                group-hover/drawer-link:translate-x-0.5
              "
            />
          </span>
        </>
      )}
    </NavLink>
  );
}

function InstagramSocialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />

      <circle cx="17.4" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function CustomerSocialIcon({ type }) {
  if (type === "instagram") {
    return <InstagramSocialIcon />;
  }

  return (
    <span
      aria-hidden="true"
      className="
        text-[1.35rem]
        font-bold
        leading-none
      "
    >
      ♪
    </span>
  );
}
/* =========================================================
   CUSTOMER HEADER
========================================================= */

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

  /* =======================================================
     DRAWER CONTROLS
  ======================================================= */

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function openMobileMenu() {
    setIsMobileMenuOpen(true);
  }

  async function handleCustomerLogout() {
    closeMobileMenu();

    await handleLogout();
  }

  /* =======================================================
     ESCAPE + BODY SCROLL
  ======================================================= */

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      closeMobileMenu();

      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        className="
          sticky
          top-0
          z-40

          border-b
          border-brand-border

          bg-brand-page/95

          font-body

          text-brand-text

          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto

            flex
            h-[64px]
            max-w-7xl

            items-center

            px-4

            sm:h-[70px]
            sm:px-6

            lg:h-[82px]
            lg:px-8
          "
        >
          {/* ==============================================
              LEFT
          ============================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1

              items-center

              lg:basis-1/3
            "
          >
            {/* DESKTOP NAV */}

            <nav
              aria-label="Main navigation"
              className="
                hidden

                items-center

                gap-7

                lg:flex
              "
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
                        aria-hidden="true"
                        className={`
                            absolute
                            inset-x-1
                            bottom-0

                            h-px

                            origin-left

                            bg-brand-accent-fill

                            transition-transform
                            duration-200

                            ${
                              isActive
                                ? "scale-x-100"
                                : "scale-x-0 group-hover:scale-x-100"
                            }
                          `}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* MOBILE LOGO */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              aria-label="Butterfly Dream home"
              className="
                inline-flex
                min-h-10
                min-w-0

                flex-col

                justify-center

                lg:hidden
              "
            >
              <span
                className="
                  truncate

                  font-display

                  text-[1.35rem]
                  font-medium

                  leading-none

                  tracking-[-0.035em]

                  text-brand-text

                  sm:text-[1.55rem]
                "
              >
                Butterfly <span className="italic">Dream</span>
              </span>

              <span
                className="
                  mt-1

                  text-[0.47rem]
                  font-semibold
                  uppercase

                  tracking-[0.25em]

                  text-brand-text-muted
                "
              >
                Jewelry &amp; Accessories
              </span>
            </Link>
          </div>

          {/* ==============================================
              DESKTOP CENTER LOGO
          ============================================== */}

          <Link
            to="/"
            aria-label="Butterfly Dream home"
            className="
              hidden

              min-h-11
              shrink-0

              flex-col
              items-center
              justify-center

              px-4

              lg:flex
              lg:basis-1/3
            "
          >
            <span
              className="
                font-display

                text-[1.9rem]
                font-medium

                leading-none

                tracking-[-0.04em]

                text-brand-text
              "
            >
              Butterfly <span className="italic">Dream</span>
            </span>

            <span
              className="
                mt-1.5

                text-[0.52rem]
                font-semibold
                uppercase

                tracking-[0.3em]

                text-brand-text-muted
              "
            >
              Jewelry &amp; Accessories
            </span>
          </Link>

          {/* ==============================================
              RIGHT ACTIONS
          ============================================== */}

          <div
            className="
              flex
              flex-1

              items-center
              justify-end

              sm:gap-0.5

              lg:basis-1/3
              lg:gap-1
            "
          >
            {!authLoading && (
              <>
                {/* ==========================================
                    CART
                ========================================== */}

                <Link
                  to="/cart"
                  aria-label={`Shopping cart with ${totalQuantity} ${
                    totalQuantity === 1 ? "item" : "items"
                  }`}
                  className={headerIconClass}
                >
                  <ShoppingBagOutlinedIcon
                    sx={{
                      fontSize: 22,
                    }}
                  />

                  <HeaderBadge count={totalQuantity} />
                </Link>

                {/* ==========================================
                    WISHLIST
                ========================================== */}

                {isCustomer && (
                  <>
                    <Link
                      to="/wishlist"
                      aria-label={`Wishlist with ${wishlistItemCount} ${
                        wishlistItemCount === 1 ? "product" : "products"
                      }`}
                      className={headerIconClass}
                    >
                      <FavoriteBorderRoundedIcon
                        sx={{
                          fontSize: 22,
                        }}
                      />

                      <HeaderBadge count={wishlistItemCount} />
                    </Link>
                    <Link
                      to="/notifications"
                      aria-label={`Notifications with ${notificationUnreadCount} ${
                        notificationUnreadCount === 1
                          ? "notification"
                          : "notifications"
                      }`}
                      className={headerIconClass}
                    >
                      <NotificationsNoneRoundedIcon
                        sx={{
                          fontSize: 22,
                        }}
                      />
                      <HeaderBadge count={notificationUnreadCount} />
                    </Link>
                  </>
                )}

                {/* ==========================================
                    CUSTOMER AVATAR
                ========================================== */}

                {isCustomer && (
                  <Link
                    to="/account"
                    aria-label={`Open ${customerFirstName}'s account`}
                    title={user?.fullName ?? customerFirstName}
                    className="
                      hidden
                      rounded-full
                      transition-transform
                      duration-200

                      active:scale-90

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-brand-accent-fill/35

                      xs:inline-flex
                    "
                  >
                    <CustomerAvatar user={user} />
                  </Link>
                )}

                {/* ==========================================
                    DESKTOP CUSTOMER ACCOUNT
                ========================================== */}

                {isCustomer && (
                  <Link
                    to="/account"
                    className="
                      hidden

                      min-h-10

                      items-center

                      gap-2

                      border-l
                      border-brand-border

                      pl-4

                      text-sm
                      font-semibold

                      text-brand-text

                      transition-colors

                      hover:text-brand-accent-text

                      lg:flex
                    "
                  >
                    <PersonOutlineRoundedIcon
                      sx={{
                        fontSize: 19,
                      }}
                    />

                    <span
                      className="
                        max-w-24
                        truncate
                      "
                    >
                      {customerFirstName}
                    </span>
                  </Link>
                )}

                {/* ==========================================
                    GUEST DESKTOP AUTH
                ========================================== */}

                {!isAuthenticated && (
                  <div
                    className="
                      hidden

                      items-center

                      gap-2

                      lg:flex
                    "
                  >
                    <Link
                      to="/login"
                      className="
                        inline-flex
                        min-h-10

                        items-center

                        px-3

                        text-sm
                        font-semibold

                        text-brand-text

                        hover:text-brand-accent-text
                      "
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/register"
                      className="
                        inline-flex
                        min-h-10

                        items-center
                        justify-center

                        rounded-full

                        bg-brand-primary

                        px-5

                        text-sm
                        font-semibold

                        text-brand-surface

                        transition-colors

                        hover:bg-brand-primary-hover
                      "
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* ==============================================
                MENU
            ============================================== */}

            <button
              ref={menuButtonRef}
              type="button"
              onClick={openMobileMenu}
              aria-label="Open navigation menu"
              aria-controls="customer-mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              className={`
                ${headerIconClass}

                lg:hidden
              `}
            >
              <MenuRoundedIcon
                sx={{
                  fontSize: 23,
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          MOBILE SIDE DRAWER
      ================================================== */}

      {isMobileMenuOpen && (
        <div
          id="customer-mobile-navigation"
          className="
            fixed
            inset-0
            z-[70]

            lg:hidden
          "
        >
          {/* BACKDROP */}

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="
              absolute
              inset-0

              bg-black/30

              backdrop-blur-[2px]
            "
          />

          {/* DRAWER */}

          <aside
            aria-label="Customer navigation"
            className="
              absolute
              bottom-0
              right-0
              top-0

              flex
              w-[88%]
              max-w-[340px]

              flex-col

              border-l
              border-brand-border

              bg-brand-page

              shadow-[-20px_0_60px_rgba(0,0,0,0.12)]
            "
          >
            {/* ==============================================
                DRAWER HEADER
            ============================================== */}

            <div
              className="
                flex
                min-h-[88px]

                items-center

                gap-3.5

                border-b
                border-brand-border

                px-5
              "
            >
              {isCustomer ? (
                <Link
                  to="/account"
                  onClick={closeMobileMenu}
                  aria-label="Open my account"
                  className="
      group/account

      flex
      min-w-0
      flex-1

      items-center

      gap-3.5

      rounded-[1rem]

      py-2

      transition-all
      duration-200

      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-brand-accent-fill/35
    "
                >
                  <CustomerAvatar user={user} size="drawer" />

                  <div
                    className="
        min-w-0
        flex-1
      "
                  >
                    <p
                      className="
          truncate

          font-display

          text-[1.15rem]
          font-medium

          tracking-[-0.025em]

          text-brand-text

          transition-colors

          group-hover/account:text-brand-accent-text
        "
                    >
                      {user.fullName}
                    </p>

                    <p
                      className="
          mt-0.5

          text-[0.62rem]
          font-medium

          text-brand-text-muted
        "
                    >
                      View my account
                    </p>
                  </div>

                  <ArrowForwardIosRoundedIcon
                    aria-hidden="true"
                    className="
        mr-1

        shrink-0

        text-brand-text-muted/50

        transition-all
        duration-200

        group-hover/account:translate-x-0.5
        group-hover/account:text-brand-accent-text
      "
                    sx={{
                      fontSize: 12,
                    }}
                  />
                </Link>
              ) : (
                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p
                    className="
                      font-display

                      text-[1.3rem]
                      font-medium

                      tracking-[-0.035em]

                      text-brand-text
                    "
                  >
                    Butterfly <span className="italic">Dream</span>
                  </p>

                  <p
                    className="
                      mt-1

                      text-[0.62rem]

                      text-brand-text-muted
                    "
                  >
                    Jewelry &amp; Accessories
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="
                  inline-flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-transparent

                  text-brand-text

                  transition-all

                  hover:bg-brand-primary/5

                  active:scale-90

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-accent-fill/35
                "
              >
                <CloseRoundedIcon
                  sx={{
                    fontSize: 22,
                  }}
                />
              </button>
            </div>

            {/* ==============================================
                NAVIGATION
            ============================================== */}

            <nav
              aria-label="Mobile navigation"
              className="
                min-h-0
                flex-1

                overflow-y-auto

                px-5
                py-3
              "
            >
              <DrawerNavItem
                to="/"
                end
                icon={HomeOutlinedIcon}
                onClick={closeMobileMenu}
              >
                Home
              </DrawerNavItem>

              <DrawerNavItem
                to="/products"
                icon={StorefrontOutlinedIcon}
                onClick={closeMobileMenu}
              >
                Shop
              </DrawerNavItem>

              {isCustomer && (
                <>
                  <DrawerNavItem
                    to="/orders"
                    icon={ReceiptLongOutlinedIcon}
                    onClick={closeMobileMenu}
                  >
                    My orders
                  </DrawerNavItem>

                  <DrawerNavItem
                    to="/wishlist"
                    icon={FavoriteBorderRoundedIcon}
                    count={wishlistItemCount}
                    onClick={closeMobileMenu}
                  >
                    Wishlist
                  </DrawerNavItem>

                  <DrawerNavItem
                    to="/notifications"
                    icon={NotificationsNoneRoundedIcon}
                    count={notificationUnreadCount}
                    onClick={closeMobileMenu}
                  >
                    Notifications
                  </DrawerNavItem>
                </>
              )}
            </nav>

            {/* ==============================================
                DRAWER BOTTOM
            ============================================== */}

            {/* ==================================================
    DRAWER BOTTOM
================================================== */}

            <div
              className="
    border-t
    border-brand-border

    bg-brand-surface/50

    px-5
    pb-5
    pt-4
  "
            >
              {isCustomer ? (
                <>
                  {/* ==============================================
          SOCIALS
      ============================================== */}

                  <div
                    className="
          pb-4

          text-center
        "
                  >
                    <p
                      className="
            text-[0.56rem]
            font-bold
            uppercase

            tracking-[0.18em]

            text-brand-text-muted
          "
                    >
                      Join us on
                    </p>

                    <div
                      className="
            mt-3

            flex
            items-center
            justify-center

            gap-2.5
          "
                    >
                      {customerSocials.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Follow Butterfly Dream on ${social.name}`}
                          title={social.name}
                          className="
                inline-flex
                h-11
                w-11

                items-center
                justify-center

                rounded-full

                border
                border-brand-border

                bg-brand-surface

                text-brand-text

                transition-all
                duration-200

                hover:border-brand-accent-fill
                hover:bg-brand-accent-soft
                hover:text-brand-accent-text

                active:scale-90

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/35
              "
                        >
                          <CustomerSocialIcon type={social.type} />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* ==============================================
          SIGN OUT
      ============================================== */}

                  <div
                    className="
          border-t
          border-brand-border

          pt-4
        "
                  >
                    <button
                      type="button"
                      onClick={() => void handleCustomerLogout()}
                      disabled={isLoggingOut}
                      className="
            inline-flex
            min-h-11
            w-full

            items-center
            justify-center

            gap-2

            rounded-full

            border
            border-brand-error/25

            bg-transparent

            px-5

            text-sm
            font-semibold

            text-brand-error

            transition-all
            duration-200

            hover:bg-brand-error/5

            active:scale-[0.985]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-error/25

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                    >
                      <LogoutRoundedIcon
                        sx={{
                          fontSize: 18,
                        }}
                      />

                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>

                  {/* ==============================================
          COPYRIGHT
      ============================================== */}

                  <div
                    className="
          mt-5

          border-t
          border-brand-border

          pt-4

          text-center
        "
                  >
                    <p
                      className="
            text-[0.6rem]
            font-medium

            leading-5

            text-brand-text-muted
          "
                    >
                      © {new Date().getFullYear()} Butterfly Dream.
                      <br />
                      All rights reserved.
                    </p>

                    <p
                      className="
            mt-1.5

            font-display

            text-[0.8rem]
            font-medium
            italic

            text-brand-accent-text
          "
                    >
                      Jewelry made part of your story
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* ==============================================
          GUEST SOCIALS
      ============================================== */}

                  <div
                    className="
          pb-4

          text-center
        "
                  >
                    <p
                      className="
            text-[0.56rem]
            font-bold
            uppercase

            tracking-[0.18em]

            text-brand-text-muted
          "
                    >
                      Join us on
                    </p>

                    <div
                      className="
            mt-3

            flex
            items-center
            justify-center

            gap-2.5
          "
                    >
                      {customerSocials.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Follow Butterfly Dream on ${social.name}`}
                          title={social.name}
                          className="
                inline-flex
                h-11
                w-11

                items-center
                justify-center

                rounded-full

                border
                border-brand-border

                bg-brand-surface

                text-brand-text

                transition-all
                duration-200

                hover:border-brand-accent-fill
                hover:bg-brand-accent-soft
                hover:text-brand-accent-text

                active:scale-90
              "
                        >
                          <CustomerSocialIcon type={social.type} />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* AUTH */}

                  <div
                    className="
          flex
          flex-col

          gap-2.5

          border-t
          border-brand-border

          pt-4
        "
                  >
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="
            inline-flex
            min-h-11
            w-full

            items-center
            justify-center

            rounded-full

            border
            border-brand-primary

            text-sm
            font-semibold

            text-brand-primary

            transition-all

            hover:bg-brand-surface-soft
          "
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="
            inline-flex
            min-h-11
            w-full

            items-center
            justify-center

            rounded-full

            bg-brand-primary

            text-sm
            font-semibold

            text-brand-surface

            transition-colors

            hover:bg-brand-primary-hover
          "
                    >
                      Create account
                    </Link>
                  </div>

                  {/* COPYRIGHT */}

                  <div
                    className="
          mt-5

          border-t
          border-brand-border

          pt-4

          text-center
        "
                  >
                    <p
                      className="
            text-[0.6rem]
            font-medium

            leading-5

            text-brand-text-muted
          "
                    >
                      © {new Date().getFullYear()} Butterfly Dream.
                      <br />
                      All rights reserved.
                    </p>

                    <p
                      className="
            mt-1.5

            font-display

            text-[0.8rem]
            font-medium
            italic

            text-brand-accent-text
          "
                    >
                      Jewelry made part of your story
                    </p>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default CustomerHeader;
