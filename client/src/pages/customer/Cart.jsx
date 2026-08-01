import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

//React Toastify
import { toast } from "react-toastify";

//Components
import CartItemCard from "../../components/cart/CartItemCard.jsx";

//Context
import useCart from "../../context/cart/useCart.js";

//Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

//MUI Material
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
//MUI Icons
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function CartLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>

      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
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
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <CartLoading />
      </section>
    );
  }

  if (isGuest) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <LockOutlinedIcon
            sx={{
              fontSize: 40,
            }}
          />
        </span>

        <h1 className="mt-6 text-3xl font-bold text-gray-950">
          Log in to view your cart
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
          Your cart is connected to your customer account so it can remain
          available across your devices.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            state={{
              from: location.pathname,
            }}
            className="rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Log in
          </Link>

          <Link
            to="/products"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:border-gray-950"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  if (status === "error" || error) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ErrorOutlineRoundedIcon
          className="text-red-500"
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          Your cart could not be loaded
        </h1>

        <p className="mt-4 text-gray-600">
          {getApiErrorMessage(error, "Unable to load your cart.")}
        </p>

        <button
          type="button"
          onClick={() => void reloadCart()}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          <RefreshRoundedIcon />
          Try again
        </button>
      </section>
    );
  }

  const items = cart?.items ?? [];
  const summary = cart?.summary;

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ShoppingBagOutlinedIcon
            sx={{
              fontSize: 42,
            }}
          />
        </span>

        <h1 className="mt-6 text-3xl font-bold text-gray-950">
          Your cart is empty
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
          Explore our accessories and add your favorite products to your cart.
        </p>

        <Link
          to="/products"
          className="mt-8 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Shopping cart
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            Your selected items
          </h1>

          <p className="mt-3 text-gray-600">
            {summary?.totalQuantity ?? 0}{" "}
            {(summary?.totalQuantity ?? 0) === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <button
          type="button"
          onClick={() => setClearDialogOpen(true)}
          disabled={mutationKey === "clear-cart"}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <DeleteSweepOutlinedIcon />
          Clear cart
        </button>
      </header>

      {summary?.hasPriceChanges && (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <WarningAmberRoundedIcon className="shrink-0 text-amber-700" />

            <div>
              <h2 className="font-bold text-amber-900">
                Some prices have changed
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Review the updated prices and accept them before proceeding.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleRefreshPrices()}
            disabled={mutationKey === "refresh-prices"}
            className="shrink-0 rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {mutationKey === "refresh-prices"
              ? "Updating..."
              : "Accept new prices"}
          </button>
        </div>
      )}

      {(summary?.hasUnavailableItems || summary?.hasInsufficientStock) && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-bold text-red-800">Cart requires attention</h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            Remove unavailable products or reduce quantities that exceed current
            stock before checkout.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
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

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-gray-950">Order summary</h2>

          <div className="mt-6 space-y-4 border-b border-gray-200 pb-6">
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Items</span>

              <span className="font-semibold text-gray-950">
                {summary?.totalQuantity ?? 0}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-gray-600">
              <span>Subtotal</span>

              <span className="font-semibold text-gray-950">
                ${summary?.subtotal ?? "0.00"}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-gray-600">
              <span>Delivery</span>

              <span className="text-sm font-medium text-gray-500">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-6">
            <span className="text-lg font-bold text-gray-950">
              Current total
            </span>

            <span className="text-xl font-bold text-gray-950">
              ${summary?.subtotal ?? "0.00"}
            </span>
          </div>

          {summary?.canCheckout ? (
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-xl bg-gray-950 px-5 py-3.5 text-center font-bold text-white transition hover:bg-gray-800"
            >
              Proceed to checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-300 px-5 py-3.5 font-bold text-gray-600"
            >
              Checkout unavailable
            </button>
          )}

          {!summary?.canCheckout && (
            <p className="mt-3 text-center text-xs leading-5 text-red-600">
              Resolve price, availability, or stock issues before checkout.
            </p>
          )}

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            Checkout will be enabled after the order and delivery flow is
            implemented.
          </p>

          <Link
            to="/products"
            className="mt-5 block text-center text-sm font-semibold text-gray-700 hover:text-gray-950"
          >
            Continue shopping
          </Link>
        </aside>
      </div>

      <Dialog
        open={clearDialogOpen}
        onClose={
          mutationKey === "clear-cart"
            ? undefined
            : () => setClearDialogOpen(false)
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Clear your cart?</DialogTitle>

        <DialogContent dividers>
          This will remove every product currently stored in your cart.
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <button
            type="button"
            onClick={() => setClearDialogOpen(false)}
            disabled={mutationKey === "clear-cart"}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleClearCart()}
            disabled={mutationKey === "clear-cart"}
            className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {mutationKey === "clear-cart" ? "Clearing..." : "Clear cart"}
          </button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default Cart;
