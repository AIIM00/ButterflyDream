import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// React Toastify
import { toast } from "react-toastify";

// Components
import CartItemCard from "../../components/cart/CartItemCard.jsx";

// Context
import useCart from "../../context/cart/useCart.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

// MUI Material
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

// MUI Icons
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

/* =========================================================
   LOADING
========================================================= */

function CartLoading() {
  return (
    <div
      className="
        grid
        gap-6

        lg:grid-cols-[minmax(0,1fr)_22rem]
      "
    >
      <div className="space-y-4">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-44

              animate-pulse

              rounded-[1.5rem]

              border
              border-brand-border

              bg-brand-surface-soft
            "
          />
        ))}
      </div>

      <div
        className="
          h-80

          animate-pulse

          rounded-[1.75rem]

          border
          border-brand-border

          bg-brand-surface-soft
        "
      />
    </div>
  );
}

/* =========================================================
   CART
========================================================= */

function Cart() {
  const location = useLocation();

  const {
    cart,
    status,
    error,
    mutationKey,
    isLoading,
    isGuest,
    updateItemQuantity,
    removeItem,
    clearCart,
    refreshPrices,
    reloadCart,
  } = useCart();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  /* =======================================================
     QUANTITY
  ======================================================= */

  async function handleQuantityChange(item, quantity) {
    try {
      await updateItemQuantity(item.id, quantity);
    } catch (mutationError) {
      toast.error(
        getApiErrorMessage(mutationError, "Unable to update quantity."),
      );
    }
  }

  /* =======================================================
     REMOVE
  ======================================================= */

  async function handleRemove(item) {
    try {
      const response = await removeItem(item.id);

      toast.success(response.message ?? "Item removed from cart.");
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, "Unable to remove item."));
    }
  }

  /* =======================================================
     CLEAR CART
  ======================================================= */

  async function handleClearCart() {
    try {
      const response = await clearCart();

      toast.success(response.message ?? "Cart cleared.");

      setClearDialogOpen(false);
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, "Unable to clear cart."));
    }
  }

  /* =======================================================
     REFRESH PRICES
  ======================================================= */

  async function handleRefreshPrices() {
    try {
      const response = await refreshPrices();

      toast.success(response.message ?? "Cart prices updated.");
    } catch (mutationError) {
      toast.error(
        getApiErrorMessage(mutationError, "Unable to refresh prices."),
      );
    }
  }

  /* =========================================================
     LOADING PAGE
  ========================================================= */

  if (isLoading) {
    return (
      <section
        className="
          min-h-screen

          bg-brand-page
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl

            px-4
            py-8

            sm:px-6
            sm:py-10

            lg:px-8
            lg:py-14
          "
        >
          <div className="mb-8 max-w-xl">
            <div
              className="
                h-3
                w-28

                animate-pulse

                rounded-full

                bg-brand-accent-soft
              "
            />

            <div
              className="
                mt-4

                h-11
                w-64

                animate-pulse

                rounded-xl

                bg-brand-surface-soft
              "
            />

            <div
              className="
                mt-3

                h-5
                w-44

                animate-pulse

                rounded-lg

                bg-brand-surface-soft
              "
            />
          </div>

          <CartLoading />
        </div>
      </section>
    );
  }

  /* =========================================================
     GUEST
  ========================================================= */

  if (isGuest) {
    return (
      <section
        className="
          flex
          min-h-[70vh]

          items-center

          bg-brand-page

          px-4
          py-12

          sm:px-6
        "
      >
        <div
          className="
            relative

            mx-auto
            w-full
            max-w-2xl

            overflow-hidden

            rounded-[2rem]

            border
            border-brand-border

            bg-brand-surface

            px-6
            py-10

            text-center

            shadow-[0_18px_50px_rgba(0,0,0,0.05)]

            sm:px-10
            sm:py-14
          "
        >
          {/* DECORATION */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -right-16
              -top-16

              h-40
              w-40

              rounded-full

              border
              border-brand-accent-fill/20
            "
          />

          <div className="relative z-10">
            <span
              className="
                mx-auto

                inline-flex
                h-16
                w-16

                items-center
                justify-center

                rounded-full

                bg-brand-accent-soft

                text-brand-accent-text
              "
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 29,
                }}
              />
            </span>

            <p
              className="
                mt-6

                text-[0.62rem]
                font-bold
                uppercase

                tracking-[0.2em]

                text-brand-accent-text
              "
            >
              Your Butterfly Dream
            </p>

            <h1
              className="
                mt-2

                font-display

                text-4xl
                font-medium

                leading-[0.95]

                tracking-[-0.045em]

                text-brand-text

                sm:text-5xl
              "
            >
              Your pieces,
              <span className="block italic">kept for you.</span>
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-lg

                text-sm
                leading-7

                text-brand-text-muted

                sm:text-base
              "
            >
              Sign in to see the pieces saved in your cart and keep them
              available across your devices.
            </p>

            <div
              className="
                mt-8

                flex
                flex-wrap

                justify-center

                gap-3
              "
            >
              <Link
                to="/login"
                state={{
                  from: location.pathname,
                }}
                className="
                  inline-flex
                  min-h-12

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-primary

                  px-6

                  text-sm
                  font-semibold

                  text-brand-surface

                  transition-all

                  hover:bg-brand-primary-hover

                  active:scale-[0.98]
                "
              >
                Sign in
              </Link>

              <Link
                to="/products"
                className="
                  group

                  inline-flex
                  min-h-12

                  items-center
                  justify-center

                  gap-2

                  rounded-full

                  border
                  border-brand-primary

                  px-6

                  text-sm
                  font-semibold

                  text-brand-primary

                  transition-all

                  hover:bg-brand-primary
                  hover:text-brand-surface

                  active:scale-[0.98]
                "
              >
                Browse products
                <ArrowForwardRoundedIcon
                  className="
                    transition-transform

                    group-hover:translate-x-0.5
                  "
                  sx={{
                    fontSize: 19,
                  }}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (status === "error" || error) {
    return (
      <section
        className="
          flex
          min-h-[70vh]

          items-center

          bg-brand-page

          px-4
          py-12

          sm:px-6
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-2xl

            rounded-[2rem]

            border
            border-brand-error/20

            bg-brand-surface

            px-6
            py-12

            text-center
          "
        >
          <span
            className="
              mx-auto

              inline-flex
              h-16
              w-16

              items-center
              justify-center

              rounded-full

              bg-brand-error/10

              text-brand-error
            "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 32,
              }}
            />
          </span>

          <h1
            className="
              mt-6

              font-display

              text-4xl
              font-medium

              tracking-[-0.04em]

              text-brand-text
            "
          >
            Your cart could not be loaded
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-lg

              text-sm
              leading-7

              text-brand-text-muted
            "
          >
            {getApiErrorMessage(error, "Unable to load your cart.")}
          </p>

          <button
            type="button"
            onClick={() => void reloadCart()}
            className="
              mt-7

              inline-flex
              min-h-11

              items-center
              justify-center

              gap-2

              rounded-full

              bg-brand-primary

              px-6

              text-sm
              font-semibold

              text-brand-surface

              transition-all

              hover:bg-brand-primary-hover

              active:scale-[0.98]
            "
          >
            <RefreshRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Try again
          </button>
        </div>
      </section>
    );
  }

  const items = cart?.items ?? [];

  const summary = cart?.summary;

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (items.length === 0) {
    return (
      <section
        className="
          flex
          min-h-[70vh]

          items-center

          bg-brand-page

          px-4
          py-12

          sm:px-6
        "
      >
        <div
          className="
            relative

            mx-auto
            w-full
            max-w-2xl

            overflow-hidden

            rounded-[2rem]

            border
            border-brand-border

            bg-brand-surface-soft

            px-6
            py-12

            text-center

            sm:px-10
            sm:py-16
          "
        >
          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -bottom-20
              -left-20

              h-48
              w-48

              rounded-full

              border
              border-brand-accent-fill/20
            "
          />

          <div className="relative z-10">
            <span
              className="
                mx-auto

                inline-flex
                h-16
                w-16

                items-center
                justify-center

                rounded-full

                bg-brand-surface

                text-brand-accent-text

                shadow-sm
              "
            >
              <ShoppingBagOutlinedIcon
                sx={{
                  fontSize: 30,
                }}
              />
            </span>

            <p
              className="
                mt-6

                text-[0.62rem]
                font-bold
                uppercase

                tracking-[0.2em]

                text-brand-accent-text
              "
            >
              Your selection
            </p>

            <h1
              className="
                mt-2

                font-display

                text-4xl
                font-medium

                tracking-[-0.04em]

                text-brand-text

                sm:text-5xl
              "
            >
              Your cart is empty.
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-lg

                text-sm
                leading-7

                text-brand-text-muted
              "
            >
              Discover pieces designed to become part of your story and save the
              ones that speak to you.
            </p>

            <Link
              to="/products"
              className="
                group

                mt-8

                inline-flex
                min-h-12

                items-center
                justify-center

                gap-2

                rounded-full

                bg-brand-primary

                px-6

                text-sm
                font-semibold

                text-brand-surface

                transition-all

                hover:bg-brand-primary-hover

                active:scale-[0.98]
              "
            >
              Start shopping
              <ArrowForwardRoundedIcon
                className="
                  transition-transform

                  group-hover:translate-x-0.5
                "
                sx={{
                  fontSize: 19,
                }}
              />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     CART CONTENT
  ========================================================= */

  return (
    <section
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl

          px-4
          pb-16
          pt-7

          sm:px-6
          sm:pt-10

          lg:px-8
          lg:pb-24
          lg:pt-14
        "
      >
        {/* ==================================================
            PAGE INTRO
        ================================================== */}

        <header
          className="
            flex
            flex-col

            gap-5

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div className="max-w-2xl">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase

                tracking-[0.2em]

                text-brand-accent-text
              "
            >
              Your selection
            </p>

            <h1
              className="
                mt-3

                font-display

                text-[2.65rem]
                font-medium

                leading-[0.95]

                tracking-[-0.045em]

                text-brand-text

                sm:text-5xl

                lg:text-6xl
              "
            >
              Pieces chosen
              <span
                className="
                  block
                  italic
                "
              >
                for your story.
              </span>
            </h1>

            <p
              className="
                mt-4

                text-sm
                leading-6

                text-brand-text-muted

                sm:text-base
              "
            >
              {summary?.totalQuantity ?? 0}{" "}
              {(summary?.totalQuantity ?? 0) === 1 ? "piece" : "pieces"}{" "}
              currently in your cart.
            </p>
          </div>

          {/* CLEAR CART */}

          <button
            type="button"
            onClick={() => setClearDialogOpen(true)}
            disabled={mutationKey === "clear-cart"}
            className="
              inline-flex
              min-h-10
              w-fit

              items-center
              justify-center

              gap-2

              rounded-full

              px-3.5

              text-xs
              font-semibold

              text-brand-text-muted

              transition-all

              hover:bg-brand-error/5
              hover:text-brand-error

              active:scale-[0.97]

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <DeleteSweepOutlinedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Clear cart
          </button>
        </header>

        {/* ==================================================
            PRICE CHANGES
        ================================================== */}

        {summary?.hasPriceChanges && (
          <div
            className="
              mt-7

              flex
              flex-col

              gap-4

              rounded-[1.4rem]

              border
              border-amber-500/20

              bg-amber-50

              p-4

              sm:flex-row
              sm:items-center
              sm:justify-between

              sm:p-5
            "
          >
            <div
              className="
                flex
                items-start

                gap-3
              "
            >
              <span
                className="
                  inline-flex
                  h-9
                  w-9
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-amber-500/10

                  text-amber-700
                "
              >
                <WarningAmberRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </span>

              <div>
                <h2
                  className="
                    text-sm
                    font-semibold

                    text-amber-950
                  "
                >
                  Some prices have changed
                </h2>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-amber-800

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Review and accept the latest prices before continuing to
                  checkout.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleRefreshPrices()}
              disabled={mutationKey === "refresh-prices"}
              className="
                inline-flex
                min-h-10
                w-fit
                shrink-0

                items-center
                justify-center

                rounded-full

                bg-amber-900

                px-5

                text-xs
                font-semibold

                text-white

                transition-all

                hover:bg-amber-800

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {mutationKey === "refresh-prices"
                ? "Updating..."
                : "Accept new prices"}
            </button>
          </div>
        )}

        {/* ==================================================
            AVAILABILITY WARNING
        ================================================== */}

        {(summary?.hasUnavailableItems || summary?.hasInsufficientStock) && (
          <div
            className="
              mt-4

              rounded-[1.4rem]

              border
              border-brand-error/20

              bg-brand-error/5

              p-4

              sm:p-5
            "
          >
            <div
              className="
                flex
                items-start

                gap-3
              "
            >
              <span
                className="
                  inline-flex
                  h-9
                  w-9
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-error/10

                  text-brand-error
                "
              >
                <ErrorOutlineRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </span>

              <div>
                <h2
                  className="
                    text-sm
                    font-semibold

                    text-brand-error
                  "
                >
                  Your cart needs attention
                </h2>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-brand-text-muted

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Remove unavailable pieces or reduce quantities that exceed
                  current stock before checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            CART LAYOUT
        ================================================== */}

        <div
          className="
            mt-8

            grid

            gap-7

            lg:grid-cols-[minmax(0,1fr)_22rem]

            xl:gap-10
          "
        >
          {/* ==================================================
              ITEMS
          ================================================== */}

          <div className="min-w-0">
            <div
              className="
                mb-4

                flex
                items-center
                justify-between

                gap-4
              "
            >
              <h2
                className="
                  font-display

                  text-2xl
                  font-medium

                  tracking-[-0.03em]

                  text-brand-text
                "
              >
                Your pieces
              </h2>

              <span
                className="
                  inline-flex
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  px-3
                  py-1.5

                  text-[0.6rem]
                  font-bold
                  uppercase

                  tracking-[0.12em]

                  text-brand-accent-text
                "
              >
                {summary?.totalQuantity ?? 0}{" "}
                {(summary?.totalQuantity ?? 0) === 1 ? "piece" : "pieces"}
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  isUpdating={mutationKey === `update:${item.id}`}
                  isRemoving={mutationKey === `remove:${item.id}`}
                  onQuantityChange={(quantity) =>
                    void handleQuantityChange(item, quantity)
                  }
                  onRemove={() => void handleRemove(item)}
                />
              ))}
            </div>
          </div>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <aside
            className="
              h-fit

              overflow-hidden

              rounded-[1.75rem]

              bg-brand-dark-surface

              text-brand-surface

              shadow-[0_14px_40px_rgba(0,0,0,0.08)]

              lg:sticky
              lg:top-24
            "
          >
            <div
              className="
                px-5
                pb-5
                pt-6

                sm:px-6
              "
            >
              <p
                className="
                  text-[0.58rem]
                  font-bold
                  uppercase

                  tracking-[0.2em]

                  text-brand-accent-fill
                "
              >
                Order summary
              </p>

              <h2
                className="
                  mt-2

                  font-display

                  text-3xl
                  font-medium

                  tracking-[-0.035em]

                  text-brand-surface
                "
              >
                Your selection
              </h2>

              {/* SUMMARY ROWS */}

              <div
                className="
                  mt-6

                  space-y-4

                  border-b
                  border-brand-surface/10

                  pb-6
                "
              >
                <div
                  className="
                    flex
                    justify-between

                    gap-4

                    text-sm

                    text-brand-surface/65
                  "
                >
                  <span>Pieces</span>

                  <span
                    className="
                      font-semibold

                      text-brand-surface
                    "
                  >
                    {summary?.totalQuantity ?? 0}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between

                    gap-4

                    text-sm

                    text-brand-surface/65
                  "
                >
                  <span>Subtotal</span>

                  <span
                    className="
                      font-semibold

                      text-brand-surface
                    "
                  >
                    ${summary?.subtotal ?? "0.00"}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-start
                    justify-between

                    gap-4

                    text-sm

                    text-brand-surface/65
                  "
                >
                  <span>Delivery</span>

                  <span
                    className="
                      max-w-[9rem]

                      text-right

                      text-xs
                      leading-5

                      text-brand-surface/50
                    "
                  >
                    Calculated at checkout
                  </span>
                </div>
              </div>

              {/* TOTAL */}

              <div
                className="
                  flex
                  items-end
                  justify-between

                  gap-4

                  pt-6
                "
              >
                <span
                  className="
                    text-sm
                    font-medium

                    text-brand-surface/65
                  "
                >
                  Current total
                </span>

                <span
                  className="
                    font-display

                    text-3xl
                    font-medium

                    tracking-[-0.03em]

                    text-brand-surface
                  "
                >
                  ${summary?.subtotal ?? "0.00"}
                </span>
              </div>

              {/* CHECKOUT */}

              {summary?.canCheckout ? (
                <Link
                  to="/checkout"
                  className="
                    group

                    mt-6

                    flex
                    min-h-12
                    w-full

                    items-center
                    justify-center

                    gap-2

                    rounded-full

                    bg-brand-accent-fill

                    px-5

                    text-sm
                    font-bold

                    text-brand-text

                    transition-all

                    hover:bg-brand-accent-fill-hover

                    active:scale-[0.985]
                  "
                >
                  Proceed to checkout
                  <ArrowForwardRoundedIcon
                    className="
                      transition-transform

                      group-hover:translate-x-0.5
                    "
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="
                    mt-6

                    min-h-12
                    w-full

                    cursor-not-allowed

                    rounded-full

                    bg-brand-surface/10

                    px-5

                    text-sm
                    font-bold

                    text-brand-surface/40
                  "
                >
                  Checkout unavailable
                </button>
              )}

              {!summary?.canCheckout && (
                <p
                  className="
                    mt-3

                    text-center

                    text-xs
                    leading-5

                    text-brand-error
                  "
                >
                  Resolve price, availability, or stock issues before checkout.
                </p>
              )}

              {/* CONTINUE SHOPPING */}

              <Link
                to="/products"
                className="
                  mt-5

                  flex
                  min-h-9

                  items-center
                  justify-center

                  rounded-full

                  px-3

                  text-xs
                  font-semibold

                  text-brand-surface/65

                  transition-colors

                  hover:text-brand-accent-fill
                "
              >
                Continue shopping
              </Link>
            </div>

            {/* ==================================================
                TRUST STRIP
            ================================================== */}

            <div
              className="
                grid
                grid-cols-2

                border-t
                border-brand-surface/10

                bg-black/10
              "
            >
              <div
                className="
                  flex
                  items-center

                  gap-2

                  border-r
                  border-brand-surface/10

                  px-4
                  py-4
                "
              >
                <LockRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                  className="
                    shrink-0

                    text-brand-accent-fill
                  "
                />

                <span
                  className="
                    text-[0.6rem]
                    font-semibold

                    leading-4

                    text-brand-surface/60
                  "
                >
                  Secure checkout
                </span>
              </div>

              <div
                className="
                  flex
                  items-center

                  gap-2

                  px-4
                  py-4
                "
              >
                <LocalShippingOutlinedIcon
                  sx={{
                    fontSize: 17,
                  }}
                  className="
                    shrink-0

                    text-brand-accent-fill
                  "
                />

                <span
                  className="
                    text-[0.6rem]
                    font-semibold

                    leading-4

                    text-brand-surface/60
                  "
                >
                  Delivery at checkout
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ==================================================
          CLEAR CART DIALOG
      ================================================== */}

      <Dialog
        open={clearDialogOpen}
        onClose={
          mutationKey === "clear-cart"
            ? undefined
            : () => setClearDialogOpen(false)
        }
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "1.5rem",

              overflow: "hidden",

              backgroundColor: "rgb(var(--theme-surface))",

              color: "rgb(var(--theme-text))",

              border: "1px solid rgb(var(--theme-border))",

              boxShadow: "0 24px 70px rgba(0,0,0,0.16)",
            },
          },

          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.34)",

              backdropFilter: "blur(3px)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              flex
              items-center

              gap-3.5

              border-b
              border-brand-border

              px-5
              py-5

              sm:px-6
            "
          >
            <span
              className="
                inline-flex
                h-11
                w-11
                shrink-0

                items-center
                justify-center

                rounded-full

                bg-brand-error/10

                text-brand-error
              "
            >
              <DeleteSweepOutlinedIcon
                sx={{
                  fontSize: 21,
                }}
              />
            </span>

            <div>
              <p
                className="
                  text-[0.56rem]
                  font-bold
                  uppercase

                  tracking-[0.16em]

                  text-brand-error
                "
              >
                Cart cleanup
              </p>

              <h2
                className="
                  mt-1

                  font-display

                  text-[1.35rem]
                  font-medium

                  tracking-[-0.03em]

                  text-brand-text
                "
              >
                Clear your cart?
              </h2>
            </div>
          </div>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              px-5
              py-5

              sm:px-6
            "
          >
            <p
              className="
                text-sm
                leading-6

                text-brand-text-muted
              "
            >
              This will remove every product currently stored in your cart.
            </p>

            <div
              className="
                mt-4

                rounded-[1rem]

                border
                border-brand-error/15

                bg-brand-error/5

                px-4
                py-3
              "
            >
              <p
                className="
                  text-xs
                  font-medium

                  text-brand-error
                "
              >
                This action cannot be undone.
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 0,
          }}
        >
          <div
            className="
              flex
              w-full

              flex-col-reverse

              gap-2.5

              border-t
              border-brand-border

              bg-brand-surface-soft

              px-5
              py-4

              sm:flex-row
              sm:justify-end
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={() => setClearDialogOpen(false)}
              disabled={mutationKey === "clear-cart"}
              className="
                inline-flex
                min-h-11

                items-center
                justify-center

                rounded-full

                border
                border-brand-border

                bg-brand-surface

                px-5

                text-sm
                font-semibold

                text-brand-text

                transition-all

                hover:bg-brand-surface-soft

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleClearCart()}
              disabled={mutationKey === "clear-cart"}
              className="
                inline-flex
                min-h-11

                items-center
                justify-center

                rounded-full

                bg-brand-error

                px-5

                text-sm
                font-semibold

                text-brand-surface

                transition-all

                hover:bg-brand-error/90

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {mutationKey === "clear-cart" ? "Clearing..." : "Clear cart"}
            </button>
          </div>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default Cart;
