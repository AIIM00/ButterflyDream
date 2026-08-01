import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AdminOrderTable from "../../components/admin/orders/AdminOrderTable.jsx";
import { fetchAdminOrders } from "../../services/adminOrderApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import {
  ADMIN_ORDER_SORT_OPTIONS,
  ADMIN_ORDER_STATUS_OPTIONS,
  ADMIN_PAYMENT_STATUS_OPTIONS,
  formatOrderStatus,
} from "../../utils/adminOrderWorkflow.js";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function AdminOrders() {
  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [reloadToken, setReloadToken] = useState(0);

  const page = Number(searchParams.get("page")) || 1;

  const search = searchParams.get("search") ?? "";

  const status = searchParams.get("status") ?? "";

  const paymentStatus = searchParams.get("paymentStatus") ?? "";

  const sort = searchParams.get("sort") ?? "newest";

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        page,
        search,
        status,
        paymentStatus,
        sort,
        reloadToken,
      }),
    [page, search, status, paymentStatus, sort, reloadToken],
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
        const response = await fetchAdminOrders(
          {
            page,
            limit: 15,
            search: search || undefined,

            status: status || undefined,

            paymentStatus: paymentStatus || undefined,

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
          navigate("/admin/login", {
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
    paymentStatus,
    requestKey,
    search,
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

  function handleSearchSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    updateFilters({
      search: String(formData.get("search") ?? "").trim(),

      page: 1,
    });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(paymentStatus) ||
    sort !== "newest";

  return (
    <section>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Order management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Customer orders
          </h1>

          <p className="mt-2 text-gray-600">
            Review orders, update statuses, manage payments, and coordinate
            delivery.
          </p>
        </div>

        {orderState.pagination && (
          <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
            {orderState.pagination.totalItems} total orders
          </div>
        )}
      </header>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              key={search}
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search order number, customer, email, or phone"
              className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-gray-950"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
          >
            Search
          </button>
        </form>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="text-sm font-semibold text-gray-700">
              Order status
            </span>

            <select
              value={status}
              onChange={(event) =>
                updateFilters({
                  status: event.target.value,
                  page: 1,
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            >
              {ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option || "all"} value={option}>
                  {formatOrderStatus(option)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-gray-700">
              Payment status
            </span>

            <select
              value={paymentStatus}
              onChange={(event) =>
                updateFilters({
                  paymentStatus: event.target.value,
                  page: 1,
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            >
              {ADMIN_PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? formatOrderStatus(option) : "All payments"}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-gray-700">Sort</span>

            <select
              value={sort}
              onChange={(event) =>
                updateFilters({
                  sort: event.target.value,
                  page: 1,
                })
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            >
              {ADMIN_ORDER_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilterAltOffOutlinedIcon />
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 space-y-4">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {!isLoading && orderState.error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{
              fontSize: 54,
            }}
          />

          <h2 className="mt-4 text-xl font-bold text-red-900">
            Orders could not be loaded
          </h2>

          <p className="mt-2 text-red-700">
            {getApiErrorMessage(
              orderState.error,
              "Unable to load admin orders.",
            )}
          </p>

          <button
            type="button"
            onClick={() => setReloadToken((currentValue) => currentValue + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white"
          >
            <RefreshRoundedIcon />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !orderState.error && orderState.orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <ReceiptLongOutlinedIcon
            className="text-gray-400"
            sx={{
              fontSize: 58,
            }}
          />

          <h2 className="mt-4 text-2xl font-bold text-gray-950">
            No orders found
          </h2>

          <p className="mt-2 text-gray-600">
            No orders match the selected filters.
          </p>
        </div>
      )}

      {!isLoading && !orderState.error && orderState.orders.length > 0 && (
        <div className="mt-8">
          <AdminOrderTable orders={orderState.orders} />
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

export default AdminOrders;
