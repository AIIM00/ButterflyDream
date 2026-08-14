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
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

function CartLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
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
              bg-brand-cream
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
          bg-brand-cream
        "
      />
    </div>
  );
}

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

  async function handleQuantityChange(item, quantity) {
    try {
      await updateItemQuantity(item.id, quantity);
    } catch (mutationError) {
      toast.error(
        getApiErrorMessage(mutationError, "Unable to update quantity."),
      );
    }
  }

  async function handleRemove(item) {
    try {
      const response = await removeItem(item.id);

      toast.success(response.message ?? "Item removed from cart.");
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, "Unable to remove item."));
    }
  }

  async function handleClearCart() {
    try {
      const response = await clearCart();

      toast.success(response.message ?? "Cart cleared.");

      setClearDialogOpen(false);
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, "Unable to clear cart."));
    }
  }

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

  if (isLoading) {
    return (
      <section className="min-h-screen bg-brand-ivory">
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
            <div className="h-3 w-28 animate-pulse rounded-full bg-brand-pale-champagne" />

            <div className="mt-4 h-11 w-64 animate-pulse rounded-xl bg-brand-cream" />

            <div className="mt-3 h-5 w-44 animate-pulse rounded-lg bg-brand-cream" />
          </div>

          <CartLoading />
        </div>
      </section>
    );
  }

  if (isGuest) {
    return (
      <section
        className="
          flex
          min-h-[70vh]
          items-center
          bg-brand-ivory
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
            overflow-hidden
            rounded-[2rem]
            border
            border-brand-border
            bg-brand-surface
            px-6
            py-10
            text-center
            shadow-sm

            sm:px-10
            sm:py-14
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
              bg-brand-pale-champagne
              text-brand-bronze
            "
          >
            <LockOutlinedIcon
              sx={{
                fontSize: 30,
              }}
            />
          </span>

          <p
            className="
              mt-6
              text-[0.65rem]
              font-bold
              uppercase
              tracking-[0.2em]
              text-brand-bronze
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
              leading-none
              tracking-[-0.04em]
              text-brand-espresso

              sm:text-5xl
            "
          >
            Your pieces, kept for you.
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-lg
              text-sm
              leading-7
              text-brand-muted

              sm:text-base
            "
          >
            Log in to see the pieces saved in your cart and keep them available
            across your devices.
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
                items-center
                justify-center
                rounded-full
                bg-brand-espresso
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-brand-emerald
              "
            >
              Log in
            </Link>

            <Link
              to="/products"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-brand-espresso
                px-6
                py-3
                text-sm
                font-semibold
                text-brand-espresso
                transition
                hover:bg-brand-espresso
                hover:text-white
              "
            >
              Browse products
              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === "error" || error) {
    return (
      <section
        className="
          flex
          min-h-[70vh]
          items-center
          bg-brand-ivory
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
              text-brand-espresso
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
              text-brand-muted
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
              items-center
              gap-2
              rounded-full
              bg-brand-espresso
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-brand-emerald
            "
          >
            <RefreshRoundedIcon fontSize="small" />
            Try again
          </button>
        </div>
      </section>
    );
  }

  const items = cart?.items ?? [];

  const summary = cart?.summary;

  if (items.length === 0) {
    return (
      <section
        className="
          flex
          min-h-[70vh]
          items-center
          bg-brand-ivory
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
            overflow-hidden
            rounded-[2rem]
            border
            border-brand-border
            bg-brand-cream
            px-6
            py-12
            text-center

            sm:px-10
            sm:py-16
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
              bg-brand-surface
              text-brand-bronze
              shadow-sm
            "
          >
            <ShoppingBagOutlinedIcon
              sx={{
                fontSize: 32,
              }}
            />
          </span>

          <p
            className="
              mt-6
              text-[0.65rem]
              font-bold
              uppercase
              tracking-[0.2em]
              text-brand-bronze
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
              text-brand-espresso

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
              text-brand-muted
            "
          >
            Discover pieces designed to become part of your story and save the
            ones that speak to you.
          </p>

          <Link
            to="/products"
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-brand-espresso
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-brand-emerald
            "
          >
            Start shopping
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-brand-ivory">
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
        {/* PAGE INTRO */}
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
                text-[0.65rem]
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-bronze
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
                text-brand-espresso

                sm:text-5xl

                lg:text-6xl
              "
            >
              Pieces chosen for your story.
            </h1>

            <p
              className="
                mt-4
                text-sm
                leading-6
                text-brand-muted

                sm:text-base
              "
            >
              {summary?.totalQuantity ?? 0}{" "}
              {(summary?.totalQuantity ?? 0) === 1 ? "piece" : "pieces"}{" "}
              currently in your cart.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setClearDialogOpen(true)}
            disabled={mutationKey === "clear-cart"}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-brand-error/30
              bg-transparent
              px-4
              py-2.5
              text-xs
              font-semibold
              text-brand-error
              transition
              hover:bg-brand-error/10
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <DeleteSweepOutlinedIcon fontSize="small" />
            Clear cart
          </button>
        </header>

        {/* PRICE CHANGES */}
        {summary?.hasPriceChanges && (
          <div
            className="
              mt-7
              flex
              flex-col
              gap-4
              rounded-[1.5rem]
              border
              border-amber-200
              bg-amber-50
              p-5

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex gap-3">
              <WarningAmberRoundedIcon className="shrink-0 text-amber-700" />

              <div>
                <h2 className="font-semibold text-amber-950">
                  Some prices have changed
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-amber-800
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
                w-fit
                shrink-0
                rounded-full
                bg-amber-900
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                disabled:opacity-50
              "
            >
              {mutationKey === "refresh-prices"
                ? "Updating..."
                : "Accept new prices"}
            </button>
          </div>
        )}

        {/* AVAILABILITY WARNING */}
        {(summary?.hasUnavailableItems || summary?.hasInsufficientStock) && (
          <div
            className="
              mt-4
              rounded-[1.5rem]
              border
              border-brand-error/20
              bg-brand-error/5
              p-5
            "
          >
            <div className="flex gap-3">
              <ErrorOutlineRoundedIcon
                className="shrink-0 text-brand-error"
                fontSize="small"
              />

              <div>
                <h2 className="font-semibold text-brand-error">
                  Your cart needs attention
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-brand-muted
                  "
                >
                  Remove unavailable pieces or reduce quantities that exceed
                  current stock before checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CART CONTENT */}
        <div
          className="
            mt-8
            grid
            gap-7

            lg:grid-cols-[minmax(0,1fr)_22rem]

            xl:gap-10
          "
        >
          {/* ITEMS */}
          <div>
            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  font-display
                  text-2xl
                  font-medium
                  tracking-[-0.03em]
                  text-brand-espresso
                "
              >
                Your pieces
              </h2>

              <span
                className="
                  rounded-full
                  bg-brand-pale-champagne
                  px-3
                  py-1.5
                  text-[0.65rem]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-brand-bronze
                "
              >
                {summary?.totalQuantity ?? 0} items
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

          {/* ORDER SUMMARY */}
          <aside
            className="
              h-fit
              overflow-hidden
              rounded-[1.75rem]
              bg-brand-espresso
              text-brand-cream
              shadow-sm

              lg:sticky
              lg:top-24
            "
          >
            <div className="px-5 pb-5 pt-6 sm:px-6">
              <p
                className="
                  text-[0.62rem]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-brand-champagne
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
                "
              >
                Your selection
              </h2>

              <div
                className="
                  mt-6
                  space-y-4
                  border-b
                  border-white/10
                  pb-6
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    gap-4
                    text-sm
                    text-brand-cream/65
                  "
                >
                  <span>Pieces</span>

                  <span className="font-semibold text-brand-cream">
                    {summary?.totalQuantity ?? 0}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-4
                    text-sm
                    text-brand-cream/65
                  "
                >
                  <span>Subtotal</span>

                  <span className="font-semibold text-brand-cream">
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
                    text-brand-cream/65
                  "
                >
                  <span>Delivery</span>

                  <span
                    className="
                      max-w-[9rem]
                      text-right
                      text-xs
                      leading-5
                      text-brand-cream/50
                    "
                  >
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div
                className="
                  flex
                  items-end
                  justify-between
                  gap-4
                  pt-6
                "
              >
                <span className="text-sm font-medium text-brand-cream/70">
                  Current total
                </span>

                <span
                  className="
                    font-display
                    text-3xl
                    font-medium
                    tracking-[-0.03em]
                  "
                >
                  ${summary?.subtotal ?? "0.00"}
                </span>
              </div>

              {summary?.canCheckout ? (
                <Link
                  to="/checkout"
                  className="
                    mt-6
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-brand-champagne
                    px-5
                    py-3.5
                    text-sm
                    font-bold
                    text-brand-espresso
                    transition
                    hover:bg-brand-champagne-hover
                  "
                >
                  Proceed to checkout
                  <ArrowForwardRoundedIcon fontSize="small" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="
                    mt-6
                    w-full
                    cursor-not-allowed
                    rounded-full
                    bg-white/10
                    px-5
                    py-3.5
                    text-sm
                    font-bold
                    text-white/40
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
                    text-red-300
                  "
                >
                  Resolve price, availability, or stock issues before checkout.
                </p>
              )}

              <Link
                to="/products"
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-1
                  text-xs
                  font-semibold
                  text-brand-cream/70
                  transition
                  hover:text-brand-champagne
                "
              >
                Continue shopping
              </Link>
            </div>

            {/* TRUST STRIP */}
            <div
              className="
                grid
                grid-cols-2
                border-t
                border-white/10
                bg-black/10
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border-r
                  border-white/10
                  px-4
                  py-4
                "
              >
                <LockRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                  className="text-brand-champagne"
                />

                <span
                  className="
                    text-[0.62rem]
                    font-semibold
                    leading-4
                    text-brand-cream/60
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
                  className="text-brand-champagne"
                />

                <span
                  className="
                    text-[0.62rem]
                    font-semibold
                    leading-4
                    text-brand-cream/60
                  "
                >
                  Delivery at checkout
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CLEAR CART DIALOG */}
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
              borderRadius: "24px",

              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            padding: "24px 24px 12px",
          }}
        >
          Clear your cart?
        </DialogTitle>

        <DialogContent
          sx={{
            padding: "8px 24px 20px",

            color: "text.secondary",
          }}
        >
          This will remove every product currently stored in your cart.
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px 24px",

            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => setClearDialogOpen(false)}
            disabled={mutationKey === "clear-cart"}
            className="
              rounded-full
              border
              border-gray-300
              px-5
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:border-gray-950
              hover:text-gray-950
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
              rounded-full
              bg-red-700
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-800
              disabled:opacity-50
            "
          >
            {mutationKey === "clear-cart" ? "Clearing..." : "Clear cart"}
          </button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default Cart;
