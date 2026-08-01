import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge.jsx";
import { fetchCustomerOrder } from "../../services/customerApi.js";
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
      <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="h-[36rem] animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </section>
    );
  }

  if (orderState.error) {
    const notFound = orderState.error?.response?.status === 404;

    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ErrorOutlineRoundedIcon
          className={notFound ? "text-gray-400" : "text-red-500"}
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          {notFound ? "Order not found" : "Order could not be loaded"}
        </h1>

        <p className="mt-4 text-gray-600">
          {getApiErrorMessage(
            orderState.error,
            notFound
              ? "This order does not exist or does not belong to your account."
              : "Unable to load this order.",
          )}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {!notFound && (
            <button
              type="button"
              onClick={() =>
                setOrderState((currentState) => ({
                  ...currentState,
                  requestKey: null,
                }))
              }
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white"
            >
              <RefreshRoundedIcon />
              Try again
            </button>
          )}

          <Link
            to="/orders"
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
          >
            My orders
          </Link>
        </div>
      </section>
    );
  }

  const order = orderState.order;

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        Back to orders
      </Link>

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Order number</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-gray-600">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ReceiptLongOutlinedIcon className="text-gray-600" />

              <h2 className="text-xl font-bold text-gray-950">
                Ordered products
              </h2>
            </div>

            <div className="mt-4 divide-y divide-gray-200">
              {order.items.map((item) => (
                <article key={item.id} className="flex gap-4 py-5">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-gray-400">
                        <ImageNotSupportedOutlinedIcon />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-950">
                          {item.productName}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-gray-600">
                          {item.variantName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {item.sku}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold text-gray-950">
                        ${item.lineTotal}
                      </p>
                    </div>

                    <div className="mt-3 flex gap-5 text-sm text-gray-500">
                      <span>Quantity: {item.quantity}</span>

                      <span>${item.unitPrice} each</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Status history</h2>

            <div className="mt-6 space-y-5">
              {order.statusHistory.map((historyItem, index) => (
                <div key={historyItem.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="h-4 w-4 rounded-full bg-gray-950" />

                    {index < order.statusHistory.length - 1 && (
                      <span className="mt-2 h-full min-h-12 w-px bg-gray-300" />
                    )}
                  </div>

                  <div className="pb-3">
                    <p className="font-bold text-gray-950">
                      {formatStatus(historyItem.toStatus)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(historyItem.createdAt)}
                    </p>

                    {historyItem.note && (
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {historyItem.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Order summary</h2>

            <div className="mt-6 space-y-4 border-b border-gray-200 pb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-950">
                  ${order.subtotal}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-semibold text-gray-950">
                  ${order.deliveryFee}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="font-semibold text-gray-950">
                  -${order.discountAmount}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <span className="text-lg font-bold text-gray-950">Total</span>

              <span className="text-2xl font-bold text-gray-950">
                ${order.totalAmount}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <PaymentOutlinedIcon className="text-gray-600" />

              <h2 className="font-bold text-gray-950">Payment</h2>
            </div>

            <p className="mt-4 font-semibold text-gray-800">Cash on delivery</p>

            <p className="mt-1 text-sm text-gray-500">
              Status: {formatStatus(order.paymentStatus)}
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LocalShippingOutlinedIcon className="text-gray-600" />

              <h2 className="font-bold text-gray-950">Delivery address</h2>
            </div>

            <p className="mt-4 font-semibold text-gray-800">
              {order.deliveryRecipientName}
            </p>

            <p className="mt-1 text-sm text-gray-600">{order.deliveryPhone}</p>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {order.deliveryStreet}
              {order.deliveryBuilding ? `, ${order.deliveryBuilding}` : ""}
              {order.deliveryFloor ? `, Floor ${order.deliveryFloor}` : ""}
              <br />
              {order.deliveryCity}, {order.deliveryGovernorate}
            </p>

            {order.deliveryLandmark && (
              <p className="mt-2 text-sm text-gray-500">
                Landmark: {order.deliveryLandmark}
              </p>
            )}

            {order.deliveryNotes && (
              <p className="mt-2 text-sm text-gray-500">
                Notes: {order.deliveryNotes}
              </p>
            )}
          </section>

          {order.customerNote && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gray-950">Customer note</h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {order.customerNote}
              </p>
            </section>
          )}

          {order.cancellationReason && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-bold text-red-900">Cancellation reason</h2>

              <p className="mt-3 text-sm leading-6 text-red-700">
                {order.cancellationReason}
              </p>
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}

export default OrderDetails;
