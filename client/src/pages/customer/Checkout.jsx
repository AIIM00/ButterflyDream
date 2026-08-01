import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { toast } from "react-toastify";
import CheckoutAddressCard from "../../components/checkout/CheckoutAddressCard.jsx";
import CheckoutOrderItem from "../../components/checkout/CheckoutOrderItem.jsx";
import useCart from "../../context/cart/useCart.js";
import {
  fetchCustomerCheckout,
  placeCustomerOrder,
} from "../../services/checkoutApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

const CUSTOMER_NOTE_MAX_LENGTH = 1000;

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function getCheckoutIssueMessage(summary) {
  if (!summary) {
    return null;
  }

  if (summary.hasPriceChanges) {
    return "Some product prices have changed. Return to your cart and accept the new prices.";
  }

  if (summary.hasUnavailableItems) {
    return "Your cart contains unavailable products. Return to your cart and remove them.";
  }

  if (summary.hasInsufficientStock) {
    return "Some quantities exceed the available stock. Return to your cart and reduce them.";
  }

  return null;
}

function CheckoutLoading() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          <div className="h-36 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-52 animate-pulse rounded-2xl bg-gray-100" />
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </section>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { reloadCart } = useCart();

  const [checkoutState, setCheckoutState] = useState({
    status: "loading",
    checkout: null,
    error: null,
  });

  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [customerNote, setCustomerNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCheckout() {
      try {
        const response = await fetchCustomerCheckout({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const checkout = response.checkout;

        setCheckoutState({
          status: "ready",
          checkout,
          error: null,
        });

        setSelectedAddressId(checkout.defaultAddressId ?? "");
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          navigate("/login", {
            replace: true,
            state: {
              from: `${location.pathname}${location.search}`,
            },
          });

          return;
        }

        setCheckoutState({
          status: "error",
          checkout: null,
          error,
        });
      }
    }

    void loadCheckout();

    return () => {
      controller.abort();
    };
  }, [location.pathname, location.search, navigate]);

  async function handleRetry() {
    setCheckoutState({
      status: "loading",
      checkout: null,
      error: null,
    });

    try {
      const response = await fetchCustomerCheckout();

      setCheckoutState({
        status: "ready",
        checkout: response.checkout,
        error: null,
      });

      setSelectedAddressId(response.checkout.defaultAddressId ?? "");
    } catch (error) {
      if (isAuthenticationError(error)) {
        navigate("/login", {
          replace: true,
          state: {
            from: "/checkout",
          },
        });

        return;
      }

      setCheckoutState({
        status: "error",
        checkout: null,
        error,
      });
    }
  }

  async function refreshCheckoutAfterFailure() {
    try {
      const response = await fetchCustomerCheckout();

      setCheckoutState({
        status: "ready",
        checkout: response.checkout,
        error: null,
      });

      const addressStillExists = response.checkout.addresses.some(
        (address) => address.id === selectedAddressId,
      );

      if (!addressStillExists) {
        setSelectedAddressId(response.checkout.defaultAddressId ?? "");
      }
    } catch {
      // The original order error remains visible through the toast.
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error("Select a delivery address.");

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await placeCustomerOrder({
        addressId: selectedAddressId,

        customerNote: customerNote.trim() || null,
      });

      await reloadCart().catch(() => undefined);

      toast.success(response.message ?? "Order placed successfully.");

      navigate(`/checkout/success/${response.order.id}`, {
        replace: true,
        state: {
          order: response.order,
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to place your order."));

      if (error?.response?.status === 409) {
        await refreshCheckoutAfterFailure();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkoutState.status === "loading") {
    return <CheckoutLoading />;
  }

  if (checkoutState.status === "error") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ErrorOutlineRoundedIcon
          className="text-red-500"
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          Checkout could not be loaded
        </h1>

        <p className="mt-4 text-gray-600">
          {getApiErrorMessage(checkoutState.error, "Unable to load checkout.")}
        </p>

        <button
          type="button"
          onClick={() => void handleRetry()}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          <RefreshRoundedIcon />
          Try again
        </button>
      </section>
    );
  }

  const checkout = checkoutState.checkout;

  const addresses = checkout?.addresses ?? [];

  const items = checkout?.cart?.items ?? [];

  const summary = checkout?.cart?.summary;

  const issueMessage = getCheckoutIssueMessage(summary);

  const canSubmit =
    Boolean(selectedAddressId) &&
    Boolean(summary?.canPlaceOrder) &&
    !isSubmitting;

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-950">Your cart is empty</h1>

        <p className="mt-4 text-gray-600">
          Add products to your cart before starting checkout.
        </p>

        <Link
          to="/products"
          className="mt-8 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Secure checkout
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          Complete your order
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-gray-600">
          Review your delivery address and order details before placing your
          cash-on-delivery order.
        </p>
      </header>

      {!checkout.ordersEnabled && (
        <div className="mt-8 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <WarningAmberRoundedIcon className="shrink-0" />

          <div>
            <h2 className="font-bold">Orders are temporarily unavailable</h2>

            <p className="mt-1 text-sm leading-6">
              The store is not currently accepting new orders.
            </p>
          </div>
        </div>
      )}

      {issueMessage && (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <WarningAmberRoundedIcon className="shrink-0 text-amber-700" />

            <div>
              <h2 className="font-bold text-amber-900">
                Your cart requires attention
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                {issueMessage}
              </p>
            </div>
          </div>

          <Link
            to="/cart"
            className="shrink-0 rounded-xl bg-amber-800 px-5 py-2.5 text-center text-sm font-semibold text-white"
          >
            Review cart
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                <LocalShippingOutlinedIcon />
              </span>

              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Delivery address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select where your order should be delivered.
                </p>
              </div>
            </div>

            {addresses.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                  <CheckoutAddressCard
                    key={address.id}
                    address={address}
                    selected={selectedAddressId === address.id}
                    disabled={isSubmitting}
                    onSelect={setSelectedAddressId}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-bold text-amber-900">
                  No saved delivery address
                </h3>

                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Add a delivery address to your customer account before placing
                  an order.
                </p>

                <Link
                  to="/account"
                  className="mt-4 inline-flex rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Go to account
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Order items</h2>

            <p className="mt-1 text-sm text-gray-500">
              Review your selected products and quantities.
            </p>

            <div className="mt-4">
              {items.map((item) => (
                <CheckoutOrderItem key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="customer-note"
              className="text-xl font-bold text-gray-950"
            >
              Delivery note
            </label>

            <p className="mt-1 text-sm text-gray-500">
              Optional instructions for the store or courier.
            </p>

            <textarea
              id="customer-note"
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              maxLength={CUSTOMER_NOTE_MAX_LENGTH}
              rows={5}
              disabled={isSubmitting}
              placeholder="Example: Please call me before delivery."
              className="mt-5 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-100"
            />

            <p className="mt-2 text-right text-xs text-gray-500">
              {customerNote.length}/{CUSTOMER_NOTE_MAX_LENGTH}
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-gray-950">Order summary</h2>

          <div className="mt-6 space-y-4 border-b border-gray-200 pb-6">
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Items ({summary?.totalQuantity ?? 0})</span>

              <span className="font-semibold text-gray-950">
                ${summary?.subtotal ?? "0.00"}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-gray-600">
              <span>Delivery fee</span>

              <span className="font-semibold text-gray-950">
                ${summary?.deliveryFee ?? "0.00"}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-gray-600">
              <span>Discount</span>

              <span className="font-semibold text-gray-950">
                -${summary?.discountAmount ?? "0.00"}
              </span>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-6">
            <span className="text-lg font-bold text-gray-950">Total</span>

            <span className="text-2xl font-bold text-gray-950">
              ${summary?.totalAmount ?? "0.00"}
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <PaymentOutlinedIcon className="text-gray-600" />

              <div>
                <p className="font-semibold text-gray-950">Cash on delivery</p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Pay when your order is delivered.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handlePlaceOrder()}
            disabled={!canSubmit}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
          >
            <LockOutlinedIcon fontSize="small" />

            {isSubmitting ? "Placing order..." : "Place order"}
          </button>

          {!selectedAddressId && (
            <p className="mt-3 text-center text-xs leading-5 text-red-600">
              Select a delivery address before placing your order.
            </p>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Product prices and inventory are checked again before the order is
            confirmed.
          </p>

          <Link
            to="/cart"
            className="mt-5 block text-center text-sm font-semibold text-gray-700 hover:text-gray-950"
          >
            Return to cart
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
