import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge.jsx";
import { fetchCustomerOrders } from "../../services/customerApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

const ORDER_STATUS_OPTIONS = [
  "",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatusLabel(status) {
  if (!status) {
    return "All statuses";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const status = searchParams.get("status") ?? "";

  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        page,
        status,
        sort,
      }),
    [page, status, sort],
  );

  const [orderState, setOrderState] = useState({
    requestKey: null,
    orders: [],
    pagination: null,
    error: null,
  });

  const isLoading = orderState.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        const response = await fetchCustomerOrders(
          {
            page,
            limit: 10,
            status: status || undefined,
            sort,
          },
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setOrderState({
          requestKey,
          orders: response.orders ?? [],
          pagination: response.pagination ?? null,
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
          orders: [],
          pagination: null,
          error,
        });
      }
    }

    void loadOrders();

    return () => {
      controller.abort();
    };
  }, [
    location.pathname,
    location.search,
    navigate,
    page,
    requestKey,
    sort,
    status,
  ]);

  function updateFilters(updates) {
    const nextParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    }

    setSearchParams(nextParams);
  }

  function handleStatusChange(event) {
    updateFilters({
      status: event.target.value,
      page: 1,
    });
  }

  function handleSortChange(event) {
    updateFilters({
      sort: event.target.value,
      page: 1,
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Customer account
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          My orders
        </h1>

        <p className="mt-3 text-gray-600">
          Review your previous and current orders.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row">
        <label className="flex-1">
          <span className="text-sm font-semibold text-gray-700">Status</span>

          <select
            value={status}
            onChange={handleStatusChange}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {formatStatusLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="text-sm font-semibold text-gray-700">Sort</span>

          <select
            value={sort}
            onChange={handleSortChange}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
          >
            <option value="newest">Newest first</option>

            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      {isLoading && (
        <div className="mt-8 space-y-5">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {!isLoading && orderState.error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{
              fontSize: 52,
            }}
          />

          <h2 className="mt-4 text-xl font-bold text-red-900">
            Orders could not be loaded
          </h2>

          <p className="mt-2 text-red-700">
            {getApiErrorMessage(orderState.error, "Unable to load orders.")}
          </p>

          <button
            type="button"
            onClick={() =>
              setOrderState((currentState) => ({
                ...currentState,
                requestKey: null,
              }))
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white"
          >
            <RefreshRoundedIcon />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !orderState.error && orderState.orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Inventory2OutlinedIcon
            className="text-gray-400"
            sx={{
              fontSize: 56,
            }}
          />

          <h2 className="mt-4 text-2xl font-bold text-gray-950">
            No orders found
          </h2>

          <p className="mt-2 text-gray-600">
            Your matching orders will appear here.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white"
          >
            Start shopping
          </Link>
        </div>
      )}

      {!isLoading && !orderState.error && orderState.orders.length > 0 && (
        <div className="mt-8 space-y-5">
          {orderState.orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order</p>

                  <h2 className="mt-1 text-lg font-bold text-gray-950">
                    {order.orderNumber}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <OrderStatusBadge status={order.status} />

                  <span className="text-xl font-bold text-gray-950">
                    ${order.totalAmount}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto border-y border-gray-100 py-5">
                {order.previewItems.map((item) => (
                  <div
                    key={item.id}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                  >
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
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  <p>
                    {order.itemCount}{" "}
                    {order.itemCount === 1 ? "product" : "products"}
                  </p>

                  <p className="mt-1">
                    Delivery to {order.deliveryLocation.city},{" "}
                    {order.deliveryLocation.governorate}
                  </p>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="rounded-xl bg-gray-950 px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  View order
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading &&
        orderState.pagination &&
        orderState.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  page: page - 1,
                })
              }
              disabled={!orderState.pagination.hasPreviousPage}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-gray-600">
              Page {page} of {orderState.pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFilters({
                  page: page + 1,
                })
              }
              disabled={!orderState.pagination.hasNextPage}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
    </section>
  );
}

export default Orders;
