import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

// Components
import OrderStatusBadge from "../../components/orders/OrderStatusBadge.jsx";

// Services
import { fetchCustomerOrder } from "../../services/customerApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function OrderDetails() {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const requestKey = useMemo(() => orderId, [orderId]);

  const [orderState, setOrderState] = useState({
    requestKey: null,
    order: null,
    error: null,
  });

  const isLoading = orderState.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      try {
        const response = await fetchCustomerOrder(orderId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setOrderState({
          requestKey,
          order: response.order,
          error: null,
        });
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

        setOrderState({
          requestKey,
          order: null,
          error,
        });
      }
    }

    void loadOrder();

    return () => {
      controller.abort();
    };
  }, [location.pathname, location.search, navigate, orderId, requestKey]);

  if (isLoading) {
    return (
      <section className="min-h-screen bg-brand-ivory">
        <div
          className="
            mx-auto
            max-w-6xl
            px-4
            py-8

            sm:px-6
            sm:py-10

            lg:px-8
            lg:py-14
          "
        >
          <div className="max-w-xl">
            <div className="h-3 w-28 animate-pulse rounded-full bg-brand-pale-champagne" />

            <div className="mt-4 h-11 w-72 animate-pulse rounded-xl bg-brand-cream" />

            <div className="mt-3 h-5 w-52 animate-pulse rounded-lg bg-brand-cream" />
          </div>

          <div
            className="
              mt-8
              grid
              gap-7

              lg:grid-cols-[minmax(0,1fr)_22rem]
            "
          >
            <div className="space-y-5">
              <div className="h-[28rem] animate-pulse rounded-[1.75rem] bg-brand-cream" />

              <div className="h-80 animate-pulse rounded-[1.75rem] bg-brand-cream" />
            </div>

            <div className="h-[30rem] animate-pulse rounded-[1.75rem] bg-brand-cream" />
          </div>
        </div>
      </section>
    );
  }

  if (orderState.error) {
    const notFound = orderState.error?.response?.status === 404;

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
            bg-brand-surface
            px-6
            py-12
            text-center

            sm:px-10
          "
        >
          <span
            className={[
              "mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full",

              notFound
                ? "bg-brand-pale-champagne text-brand-bronze"
                : "bg-brand-error/10 text-brand-error",
            ].join(" ")}
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
            My orders
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
            {notFound ? "Order not found." : "Order could not be loaded."}
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
              orderState.error,
              notFound
                ? "This order does not exist or does not belong to your account."
                : "Unable to load this order.",
            )}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!notFound && (
              <button
                type="button"
                onClick={() =>
                  setOrderState((currentState) => ({
                    ...currentState,

                    requestKey: null,
                  }))
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-brand-espresso
                  px-5
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
            )}

            <Link
              to="/orders"
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-brand-espresso
                px-5
                py-3
                text-sm
                font-semibold
                text-brand-espresso
                transition
                hover:bg-brand-espresso
                hover:text-white
              "
            >
              My orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const order = orderState.order;

  return (
    <section className="min-h-screen bg-brand-ivory">
      <div
        className="
          mx-auto
          max-w-6xl
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
        {/* BACK */}
        <Link
          to="/orders"
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
          Back to orders
        </Link>

        {/* HEADER */}
        <header
          className="
            mt-6
            flex
            flex-col
            gap-5

            sm:flex-row
            sm:items-start
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
              Order details
            </p>

            <h1
              className="
                mt-3
                font-display
                text-[2.55rem]
                font-medium
                leading-[0.95]
                tracking-[-0.045em]
                text-brand-espresso

                sm:text-5xl
              "
            >
              {order.orderNumber}
            </h1>

            <p
              className="
                mt-4
                text-sm
                leading-6
                text-brand-muted
              "
            >
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="w-fit">
            <OrderStatusBadge status={order.status} />
          </div>
        </header>

        {/* CONTENT */}
        <div
          className="
            mt-9
            grid
            gap-7

            lg:grid-cols-[minmax(0,1fr)_22rem]

            xl:gap-10
          "
        >
          {/* LEFT */}
          <div className="space-y-6">
            {/* PRODUCTS */}
            <section
              className="
                overflow-hidden
                rounded-[1.75rem]
                border
                border-brand-border
                bg-brand-surface
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
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
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <ReceiptLongOutlinedIcon fontSize="small" />
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
                    Your pieces
                  </p>

                  <h2
                    className="
                      font-display
                      text-2xl
                      font-medium
                      tracking-[-0.03em]
                      text-brand-espresso
                    "
                  >
                    Ordered products
                  </h2>
                </div>
              </div>

              <div
                className="
                  divide-y
                  divide-brand-border
                  px-5

                  sm:px-6
                "
              >
                {order.items.map((item) => (
                  <article
                    key={item.id}
                    className="
                        flex
                        gap-4
                        py-5

                        sm:gap-5
                      "
                  >
                    <div
                      className="
                          h-24
                          w-24
                          shrink-0
                          overflow-hidden
                          rounded-[1.25rem]
                          bg-brand-cream

                          sm:h-28
                          sm:w-28
                        "
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="
                              flex
                              h-full
                              items-center
                              justify-center
                              text-brand-muted/50
                            "
                        >
                          <ImageNotSupportedOutlinedIcon />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="
                            flex
                            flex-col
                            gap-2

                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                          "
                      >
                        <div className="min-w-0">
                          <h3
                            className="
                                font-display
                                text-xl
                                font-medium
                                tracking-[-0.02em]
                                text-brand-espresso
                              "
                          >
                            {item.productName}
                          </h3>

                          <p
                            className="
                                mt-1
                                text-sm
                                font-medium
                                text-brand-muted
                              "
                          >
                            {item.variantName}
                          </p>

                          <p
                            className="
                                mt-1
                                text-[0.68rem]
                                uppercase
                                tracking-[0.08em]
                                text-brand-muted/70
                              "
                          >
                            SKU: {item.sku}
                          </p>
                        </div>

                        <p
                          className="
                              shrink-0
                              font-display
                              text-xl
                              font-medium
                              text-brand-espresso
                            "
                        >
                          ${item.lineTotal}
                        </p>
                      </div>

                      <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            gap-2
                            text-xs
                          "
                      >
                        <span
                          className="
                              rounded-full
                              bg-brand-pale-champagne
                              px-3
                              py-1.5
                              font-semibold
                              text-brand-bronze
                            "
                        >
                          Qty {item.quantity}
                        </span>

                        <span
                          className="
                              rounded-full
                              bg-brand-cream
                              px-3
                              py-1.5
                              font-semibold
                              text-brand-muted
                            "
                        >
                          ${item.unitPrice} each
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* STATUS HISTORY */}
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
              <div className="flex items-center gap-3">
                <span
                  className="
                    inline-flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <HistoryRoundedIcon fontSize="small" />
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
                    Journey
                  </p>

                  <h2
                    className="
                      font-display
                      text-2xl
                      font-medium
                      tracking-[-0.03em]
                      text-brand-espresso
                    "
                  >
                    Status history
                  </h2>
                </div>
              </div>

              <div className="mt-7 space-y-1">
                {order.statusHistory.map((historyItem, index) => (
                  <div key={historyItem.id} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className="
                            mt-1
                            h-3.5
                            w-3.5
                            rounded-full
                            border-[3px]
                            border-brand-pale-champagne
                            bg-brand-bronze
                          "
                      />

                      {index < order.statusHistory.length - 1 && (
                        <span
                          className="
                              mt-1
                              h-full
                              min-h-14
                              w-px
                              bg-brand-border
                            "
                        />
                      )}
                    </div>

                    <div className="pb-5">
                      <p
                        className="
                            font-semibold
                            text-brand-espresso
                          "
                      >
                        {formatStatus(historyItem.toStatus)}
                      </p>

                      <p
                        className="
                            mt-1
                            text-xs
                            text-brand-muted
                          "
                      >
                        {formatDate(historyItem.createdAt)}
                      </p>

                      {historyItem.note && (
                        <p
                          className="
                              mt-2
                              max-w-xl
                              text-sm
                              leading-6
                              text-brand-muted
                            "
                        >
                          {historyItem.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-5">
            {/* SUMMARY */}
            <section
              className="
                overflow-hidden
                rounded-[1.75rem]
                bg-brand-espresso
                text-brand-cream

                lg:sticky
                lg:top-24
              "
            >
              <div className="px-5 pb-6 pt-6">
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
                  Your order
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
                    <span>Subtotal</span>

                    <span className="font-semibold text-brand-cream">
                      ${order.subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-brand-cream/65">
                    <span>Delivery</span>

                    <span className="font-semibold text-brand-cream">
                      ${order.deliveryFee}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-brand-cream/65">
                    <span>Discount</span>

                    <span className="font-semibold text-brand-cream">
                      -$
                      {order.discountAmount}
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
                      text-4xl
                      font-medium
                      tracking-[-0.04em]
                    "
                  >
                    ${order.totalAmount}
                  </span>
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section
              className="
                rounded-[1.5rem]
                border
                border-brand-border
                bg-brand-surface
                p-5
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className="
                    inline-flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <PaymentOutlinedIcon fontSize="small" />
                </span>

                <div>
                  <p
                    className="
                      text-[0.6rem]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-brand-bronze
                    "
                  >
                    Payment
                  </p>

                  <h2
                    className="
                      font-display
                      text-xl
                      font-medium
                      text-brand-espresso
                    "
                  >
                    Cash on delivery
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm text-brand-muted">
                Status:{" "}
                <span className="font-semibold text-brand-espresso">
                  {formatStatus(order.paymentStatus)}
                </span>
              </p>
            </section>

            {/* DELIVERY */}
            <section
              className="
                rounded-[1.5rem]
                border
                border-brand-border
                bg-brand-surface
                p-5
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className="
                    inline-flex
                    h-10
                    w-10
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
                      tracking-[0.15em]
                      text-brand-bronze
                    "
                  >
                    Delivery
                  </p>

                  <h2
                    className="
                      font-display
                      text-xl
                      font-medium
                      text-brand-espresso
                    "
                  >
                    Address
                  </h2>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-semibold text-brand-espresso">
                  {order.deliveryRecipientName}
                </p>

                <p className="mt-1 text-sm text-brand-muted">
                  {order.deliveryPhone}
                </p>

                <p className="mt-4 text-sm leading-6 text-brand-muted">
                  {order.deliveryStreet}
                  {order.deliveryBuilding ? `, ${order.deliveryBuilding}` : ""}
                  {order.deliveryFloor ? `, Floor ${order.deliveryFloor}` : ""}
                  <br />
                  {order.deliveryCity}, {order.deliveryGovernorate}
                </p>

                {order.deliveryLandmark && (
                  <p className="mt-3 text-xs leading-5 text-brand-muted">
                    <span className="font-semibold text-brand-espresso">
                      Landmark:
                    </span>{" "}
                    {order.deliveryLandmark}
                  </p>
                )}

                {order.deliveryNotes && (
                  <p className="mt-2 text-xs leading-5 text-brand-muted">
                    <span className="font-semibold text-brand-espresso">
                      Notes:
                    </span>{" "}
                    {order.deliveryNotes}
                  </p>
                )}
              </div>
            </section>

            {/* CUSTOMER NOTE */}
            {order.customerNote && (
              <section
                className="
                  rounded-[1.5rem]
                  border
                  border-brand-border
                  bg-brand-cream
                  p-5
                "
              >
                <div className="flex items-center gap-3">
                  <NotesRoundedIcon
                    fontSize="small"
                    className="text-brand-bronze"
                  />

                  <h2
                    className="
                      font-display
                      text-xl
                      font-medium
                      text-brand-espresso
                    "
                  >
                    Your note
                  </h2>
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-6
                    text-brand-muted
                  "
                >
                  {order.customerNote}
                </p>
              </section>
            )}

            {/* CANCELLATION */}
            {order.cancellationReason && (
              <section
                className="
                  rounded-[1.5rem]
                  border
                  border-brand-error/20
                  bg-brand-error/5
                  p-5
                "
              >
                <h2 className="font-semibold text-brand-error">
                  Cancellation reason
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-brand-muted
                  "
                >
                  {order.cancellationReason}
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

export default OrderDetails;
