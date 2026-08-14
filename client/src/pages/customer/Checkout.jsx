import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// React Toastify
import { toast } from "react-toastify";

// Components
import CheckoutAddressCard from "../../components/checkout/CheckoutAddressCard.jsx";
import CheckoutOrderItem from "../../components/checkout/CheckoutOrderItem.jsx";

// Context
import useCart from "../../context/cart/useCart.js";

// Services
import {
  fetchCustomerCheckout,
  placeCustomerOrder,
} from "../../services/checkoutApi.js";

// Utils
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

          <div className="mt-4 h-11 w-72 animate-pulse rounded-xl bg-brand-cream" />

          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-lg bg-brand-cream" />
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="space-y-5">
            <div className="h-72 animate-pulse rounded-[1.75rem] bg-brand-cream" />

            <div className="h-80 animate-pulse rounded-[1.75rem] bg-brand-cream" />

            <div className="h-52 animate-pulse rounded-[1.75rem] bg-brand-cream" />
          </div>

          <div className="h-[30rem] animate-pulse rounded-[1.75rem] bg-brand-cream" />
        </div>
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
      // Keep the original order error visible through the toast.
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

            sm:px-10
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
            Checkout
          </p>

          <h1
            className="
              mt-2
              font-display
              text-4xl
              font-medium
              tracking-[-0.04em]
              text-brand-espresso
            "
          >
            Checkout could not be loaded.
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
            {getApiErrorMessage(
              checkoutState.error,
              "Unable to load checkout.",
            )}
          </p>

          <button
            type="button"
            onClick={() => void handleRetry()}
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
                fontSize: 31,
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
            Checkout
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
            Choose the pieces you love before continuing to checkout.
          </p>

          <Link
            to="/products"
            className="
              mt-8
              inline-flex
              items-center
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
            Browse products
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
        {/* HEADER */}
        <header className="max-w-3xl">
          <Link
            to="/cart"
            className="
              inline-flex
              items-center
              gap-1
              text-xs
              font-semibold
              text-brand-muted
              transition
              hover:text-brand-espresso
            "
          >
            <ArrowBackRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
            Back to cart
          </Link>

          <p
            className="
              mt-5
              text-[0.65rem]
              font-bold
              uppercase
              tracking-[0.22em]
              text-brand-bronze
            "
          >
            Secure checkout
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
            Complete your order.
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-brand-muted

              sm:text-base
            "
          >
            Choose where your pieces should be delivered, review your order, and
            place your cash-on-delivery request.
          </p>
        </header>

        {/* ORDERS DISABLED */}
        {!checkout.ordersEnabled && (
          <div
            className="
              mt-7
              flex
              gap-3
              rounded-[1.5rem]
              border
              border-brand-error/20
              bg-brand-error/5
              p-5
            "
          >
            <WarningAmberRoundedIcon className="shrink-0 text-brand-error" />

            <div>
              <h2 className="font-semibold text-brand-error">
                Orders are temporarily unavailable
              </h2>

              <p className="mt-1 text-sm leading-6 text-brand-muted">
                The store is not currently accepting new orders.
              </p>
            </div>
          </div>
        )}

        {/* CHECKOUT ISSUE */}
        {issueMessage && (
          <div
            className="
              mt-5
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
                  Your cart needs attention
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  {issueMessage}
                </p>
              </div>
            </div>

            <Link
              to="/cart"
              className="
                w-fit
                shrink-0
                rounded-full
                bg-amber-900
                px-5
                py-2.5
                text-center
                text-sm
                font-semibold
                text-white
              "
            >
              Review cart
            </Link>
          </div>
        )}

        <div
          className="
            mt-9
            grid
            gap-7

            lg:grid-cols-[minmax(0,1fr)_23rem]

            xl:gap-10
          "
        >
          {/* MAIN */}
          <div className="space-y-6">
            {/* ADDRESS */}
            <section
              className="
                rounded-[1.75rem]
                border
                border-brand-border
                bg-brand-surface
                p-5

                sm:p-6
              "
            >
              <div className="flex items-start gap-4">
                <span
                  className="
                    inline-flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <LocalShippingOutlinedIcon fontSize="small" />
                </span>

                <div>
                  <p
                    className="
                      text-[0.6rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-brand-bronze
                    "
                  >
                    Step 1
                  </p>

                  <h2
                    className="
                      mt-1
                      font-display
                      text-2xl
                      font-medium
                      tracking-[-0.03em]
                      text-brand-espresso

                      sm:text-3xl
                    "
                  >
                    Delivery address
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-brand-muted">
                    Select where your Butterfly Dream order should be delivered.
                  </p>
                </div>
              </div>

              {addresses.length > 0 ? (
                <div
                  className="
                    mt-6
                    grid
                    gap-4

                    md:grid-cols-2
                  "
                >
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
                <div
                  className="
                    mt-6
                    rounded-[1.25rem]
                    border
                    border-amber-200
                    bg-amber-50
                    p-5
                  "
                >
                  <h3 className="font-semibold text-amber-950">
                    No saved delivery address
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    Add an address to your account before placing your order.
                  </p>

                  <Link
                    to="/account"
                    className="
                      mt-4
                      inline-flex
                      rounded-full
                      bg-amber-900
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    Go to account
                  </Link>
                </div>
              )}
            </section>

            {/* ORDER ITEMS */}
            <section
              className="
                rounded-[1.75rem]
                border
                border-brand-border
                bg-brand-surface
                p-5

                sm:p-6
              "
            >
              <div className="flex items-start gap-4">
                <span
                  className="
                    inline-flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <ShoppingBagOutlinedIcon fontSize="small" />
                </span>

                <div>
                  <p
                    className="
                      text-[0.6rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-brand-bronze
                    "
                  >
                    Step 2
                  </p>

                  <h2
                    className="
                      mt-1
                      font-display
                      text-2xl
                      font-medium
                      tracking-[-0.03em]
                      text-brand-espresso

                      sm:text-3xl
                    "
                  >
                    Review your pieces
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-brand-muted">
                    Check your selected products and quantities before placing
                    the order.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {items.map((item) => (
                  <CheckoutOrderItem key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* DELIVERY NOTE */}
            <section
              className="
                rounded-[1.75rem]
                border
                border-brand-border
                bg-brand-surface
                p-5

                sm:p-6
              "
            >
              <div>
                <p
                  className="
                    text-[0.6rem]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-brand-bronze
                  "
                >
                  Optional
                </p>

                <label
                  htmlFor="customer-note"
                  className="
                    mt-1
                    block
                    font-display
                    text-2xl
                    font-medium
                    tracking-[-0.03em]
                    text-brand-espresso

                    sm:text-3xl
                  "
                >
                  Delivery note
                </label>

                <p className="mt-1 text-sm leading-6 text-brand-muted">
                  Add any useful instructions for the store or courier.
                </p>
              </div>

              <textarea
                id="customer-note"
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                maxLength={CUSTOMER_NOTE_MAX_LENGTH}
                rows={5}
                disabled={isSubmitting}
                placeholder="Example: Please call me before delivery."
                className="
                  mt-5
                  w-full
                  resize-y
                  rounded-[1.25rem]
                  border
                  border-brand-border
                  bg-brand-cream
                  px-4
                  py-3
                  text-sm
                  text-brand-espresso
                  outline-none
                  transition
                  placeholder:text-brand-muted/60
                  focus:border-brand-bronze
                  focus:ring-2
                  focus:ring-brand-bronze/10
                  disabled:opacity-60
                "
              />

              <p className="mt-2 text-right text-xs text-brand-muted">
                {customerNote.length}/{CUSTOMER_NOTE_MAX_LENGTH}
              </p>
            </section>
          </div>

          {/* SUMMARY */}
          <aside
            className="
              h-fit
              overflow-hidden
              rounded-[1.75rem]
              bg-brand-espresso
              text-brand-cream

              lg:sticky
              lg:top-24
            "
          >
            <div className="px-5 pb-6 pt-6 sm:px-6">
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
                Almost yours.
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
                <div className="flex justify-between gap-4 text-sm text-brand-cream/65">
                  <span>Items ({summary?.totalQuantity ?? 0})</span>

                  <span className="font-semibold text-brand-cream">
                    ${summary?.subtotal ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm text-brand-cream/65">
                  <span>Delivery</span>

                  <span className="font-semibold text-brand-cream">
                    ${summary?.deliveryFee ?? "0.00"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm text-brand-cream/65">
                  <span>Discount</span>

                  <span className="font-semibold text-brand-cream">
                    -$
                    {summary?.discountAmount ?? "0.00"}
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
                  Total
                </span>

                <span
                  className="
                    font-display
                    text-3xl
                    font-medium
                    tracking-[-0.035em]

                    sm:text-4xl
                  "
                >
                  ${summary?.totalAmount ?? "0.00"}
                </span>
              </div>

              {/* PAYMENT */}
              <div
                className="
                  mt-6
                  rounded-[1.25rem]
                  border
                  border-white/10
                  bg-white/5
                  p-4
                "
              >
                <div className="flex items-center gap-3">
                  <span
                    className="
                      inline-flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-brand-champagne/10
                      text-brand-champagne
                    "
                  >
                    <PaymentOutlinedIcon fontSize="small" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-brand-cream">
                      Cash on delivery
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-brand-cream/50">
                      Pay when your order arrives.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handlePlaceOrder()}
                disabled={!canSubmit}
                className="
                  mt-6
                  inline-flex
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
                  disabled:cursor-not-allowed
                  disabled:bg-white/10
                  disabled:text-white/35
                "
              >
                <LockOutlinedIcon fontSize="small" />

                {isSubmitting ? "Placing order..." : "Place order"}
              </button>

              {!selectedAddressId && (
                <p className="mt-3 text-center text-xs leading-5 text-red-300">
                  Select a delivery address before placing your order.
                </p>
              )}

              {!summary?.canPlaceOrder && selectedAddressId && (
                <p className="mt-3 text-center text-xs leading-5 text-red-300">
                  Resolve the cart issues before placing your order.
                </p>
              )}

              <p
                className="
                  mt-4
                  text-center
                  text-[0.65rem]
                  leading-5
                  text-brand-cream/45
                "
              >
                Product prices and inventory are checked again before your order
                is confirmed.
              </p>

              <Link
                to="/cart"
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-1
                  text-xs
                  font-semibold
                  text-brand-cream/65
                  transition
                  hover:text-brand-champagne
                "
              >
                <ArrowBackRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
                Return to cart
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
                <LockOutlinedIcon
                  sx={{
                    fontSize: 16,
                  }}
                  className="text-brand-champagne"
                />

                <span className="text-[0.62rem] font-semibold leading-4 text-brand-cream/60">
                  Secure order
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

                <span className="text-[0.62rem] font-semibold leading-4 text-brand-cream/60">
                  Delivery details
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
