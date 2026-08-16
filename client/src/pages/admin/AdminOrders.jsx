import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// MUI Icons
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

// Components
import AdminOrderTable from "../../components/admin/orders/AdminOrderTable.jsx";

// Services
import { fetchAdminOrders } from "../../services/adminOrderApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

import {
  ADMIN_ORDER_SORT_OPTIONS,
  ADMIN_ORDER_STATUS_OPTIONS,
  ADMIN_PAYMENT_STATUS_OPTIONS,
  formatOrderStatus,
} from "../../utils/adminOrderWorkflow.js";

/* =========================================================
   HELPERS
========================================================= */

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

/* =========================================================
   PAGE
========================================================= */

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

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

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

  /* =======================================================
     FILTER HELPERS
  ======================================================= */

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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[100rem]
        space-y-5

        sm:space-y-6
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-end
          sm:justify-between
          sm:gap-6
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.13em]
              text-gray-400
            "
          >
            Order management
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.035em]
              text-gray-950

              sm:text-3xl
            "
          >
            Customer orders
          </h1>

          <p
            className="
              mt-1.5
              max-w-2xl
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            Review orders, manage fulfillment, update payments, and coordinate
            delivery.
          </p>
        </div>

        {orderState.pagination && (
          <div
            className="
              inline-flex
              w-fit
              shrink-0
              items-center
              gap-2
              rounded-full
              bg-gray-100
              px-3.5
              py-2
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-gray-950
              "
            />

            <span
              className="
                text-xs
                font-bold
                text-gray-700
              "
            >
              {orderState.pagination.totalItems}{" "}
              {orderState.pagination.totalItems === 1 ? "order" : "orders"}
            </span>
          </div>
        )}
      </header>

      {/* =====================================================
          FILTERS
      ===================================================== */}
      <section
        className="
          overflow-hidden
          rounded-[1.4rem]
          border
          border-gray-200/80
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.04)]
        "
      >
        {/* FILTER HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-5

            lg:px-6
          "
        >
          <div>
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Search & filter
            </p>

            <h2
              className="
                mt-1
                text-base
                font-bold
                text-gray-950

                sm:text-lg
              "
            >
              Find orders
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                px-3
                py-2
                text-[0.68rem]
                font-bold
                text-gray-500
                transition-colors

                hover:bg-gray-100
                hover:text-gray-950

                sm:text-xs
              "
            >
              <FilterAltOffOutlinedIcon
                sx={{
                  fontSize: 15,
                }}
              />
              Clear
            </button>
          )}
        </div>

        <div
          className="
            p-4

            sm:p-5

            lg:p-6
          "
        >
          {/* SEARCH */}
          <form
            onSubmit={handleSearchSubmit}
            className="
              flex
              flex-col
              gap-2

              sm:flex-row
            "
          >
            <div
              className="
                relative
                flex-1
              "
            >
              <SearchRoundedIcon
                sx={{
                  fontSize: 19,
                }}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                key={search}
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Order number, customer, email or phone"
                className="
                  min-h-11
                  w-full
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  py-2
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition

                  placeholder:text-gray-400

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]
                "
              />
            </div>

            <button
              type="submit"
              className="
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center
                rounded-full
                bg-gray-950
                px-5
                text-sm
                font-bold
                text-white
                transition-colors

                hover:bg-gray-800

                sm:w-auto
                sm:min-w-24
              "
            >
              Search
            </button>
          </form>

          {/* FILTER GRID */}
          <div
            className="
              mt-4
              grid
              gap-3

              sm:grid-cols-2

              lg:grid-cols-3
            "
          >
            {/* ORDER STATUS */}
            <div>
              <label
                htmlFor="orders-status"
                className="
                  text-[0.65rem]
                  font-bold
                  text-gray-600

                  sm:text-xs
                "
              >
                Order status
              </label>

              <div className="relative mt-1.5">
                <select
                  id="orders-status"
                  value={status}
                  onChange={(event) =>
                    updateFilters({
                      status: event.target.value,

                      page: 1,
                    })
                  }
                  className="
                    min-h-11
                    w-full
                    appearance-none
                    rounded-[0.95rem]
                    border
                    border-gray-200
                    bg-white
                    px-3.5
                    pr-9
                    text-sm
                    font-semibold
                    text-gray-700
                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]
                  "
                >
                  {ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option || "all"} value={option}>
                      {formatOrderStatus(option)}
                    </option>
                  ))}
                </select>

                <KeyboardArrowDownRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />
              </div>
            </div>

            {/* PAYMENT STATUS */}
            <div>
              <label
                htmlFor="orders-payment-status"
                className="
                  text-[0.65rem]
                  font-bold
                  text-gray-600

                  sm:text-xs
                "
              >
                Payment status
              </label>

              <div className="relative mt-1.5">
                <select
                  id="orders-payment-status"
                  value={paymentStatus}
                  onChange={(event) =>
                    updateFilters({
                      paymentStatus: event.target.value,

                      page: 1,
                    })
                  }
                  className="
                    min-h-11
                    w-full
                    appearance-none
                    rounded-[0.95rem]
                    border
                    border-gray-200
                    bg-white
                    px-3.5
                    pr-9
                    text-sm
                    font-semibold
                    text-gray-700
                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]
                  "
                >
                  {ADMIN_PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option || "all"} value={option}>
                      {option ? formatOrderStatus(option) : "All payments"}
                    </option>
                  ))}
                </select>

                <KeyboardArrowDownRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />
              </div>
            </div>

            {/* SORT */}
            <div
              className="
                sm:col-span-2

                lg:col-span-1
              "
            >
              <label
                htmlFor="orders-sort"
                className="
                  text-[0.65rem]
                  font-bold
                  text-gray-600

                  sm:text-xs
                "
              >
                Sort
              </label>

              <div className="relative mt-1.5">
                <select
                  id="orders-sort"
                  value={sort}
                  onChange={(event) =>
                    updateFilters({
                      sort: event.target.value,

                      page: 1,
                    })
                  }
                  className="
                    min-h-11
                    w-full
                    appearance-none
                    rounded-[0.95rem]
                    border
                    border-gray-200
                    bg-white
                    px-3.5
                    pr-9
                    text-sm
                    font-semibold
                    text-gray-700
                    outline-none

                    focus:border-gray-400
                    focus:ring-4
                    focus:ring-gray-950/[0.035]
                  "
                >
                  {ADMIN_ORDER_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <KeyboardArrowDownRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOADING
      ===================================================== */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-40
                animate-pulse
                rounded-[1.2rem]
                bg-gray-100

                lg:h-20
              "
            />
          ))}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}
      {!isLoading && orderState.error && (
        <div
          className="
              rounded-[1.4rem]
              border
              border-red-200
              bg-white
              px-5
              py-10
              text-center
              shadow-[0_8px_24px_rgba(15,23,42,0.04)]

              sm:px-8
              sm:py-12
            "
        >
          <span
            className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-600
                ring-1
                ring-red-100
              "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 26,
              }}
            />
          </span>

          <p
            className="
                mt-5
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-red-500
              "
          >
            Loading error
          </p>

          <h2
            className="
                mt-1.5
                text-xl
                font-bold
                tracking-[-0.025em]
                text-gray-950
              "
          >
            Orders could not be loaded
          </h2>

          <p
            className="
                mx-auto
                mt-2
                max-w-md
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
          >
            {getApiErrorMessage(
              orderState.error,
              "Unable to load admin orders.",
            )}
          </p>

          <button
            type="button"
            onClick={() => setReloadToken((currentValue) => currentValue + 1)}
            className="
                mt-5
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gray-950
                px-5
                text-sm
                font-bold
                text-white
                transition-colors

                hover:bg-gray-800
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
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}
      {!isLoading && !orderState.error && orderState.orders.length === 0 && (
        <div
          className="
              rounded-[1.4rem]
              border
              border-gray-200/80
              bg-white
              px-5
              py-10
              text-center
              shadow-[0_8px_24px_rgba(15,23,42,0.04)]

              sm:px-8
              sm:py-14
            "
        >
          <span
            className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-gray-400
                ring-1
                ring-gray-200
              "
          >
            <ReceiptLongOutlinedIcon
              sx={{
                fontSize: 25,
              }}
            />
          </span>

          <p
            className="
                mt-5
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
          >
            Orders
          </p>

          <h2
            className="
                mt-1.5
                text-xl
                font-bold
                text-gray-950

                sm:text-2xl
              "
          >
            No orders found
          </h2>

          <p
            className="
                mx-auto
                mt-2
                max-w-md
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
          >
            {hasFilters
              ? "No customer orders match the selected filters."
              : "Customer orders will appear here once they are placed."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-5
                  text-sm
                  font-bold
                  text-gray-700
                  transition-colors

                  hover:bg-gray-100
                "
            >
              <FilterAltOffOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* =====================================================
          ORDERS
      ===================================================== */}
      {!isLoading && !orderState.error && orderState.orders.length > 0 && (
        <AdminOrderTable orders={orderState.orders} />
      )}

      {/* =====================================================
          PAGINATION
      ===================================================== */}
      {!isLoading &&
        orderState.pagination &&
        orderState.pagination.totalPages > 1 && (
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              rounded-[1.1rem]
              border
              border-gray-200
              bg-white
              p-2
              shadow-[0_4px_14px_rgba(15,23,42,0.025)]

              sm:mx-auto
              sm:w-fit
            "
          >
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  page: page - 1,
                })
              }
              disabled={!orderState.pagination.hasPreviousPage}
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                bg-white
                px-3.5
                text-xs
                font-bold
                text-gray-700
                transition-colors

                hover:bg-gray-100

                disabled:cursor-not-allowed
                disabled:opacity-30

                sm:px-4
              "
            >
              Previous
            </button>

            <span
              className="
                whitespace-nowrap
                px-1
                text-[0.68rem]
                font-semibold
                text-gray-500

                sm:px-3
                sm:text-xs
              "
            >
              {page} / {orderState.pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFilters({
                  page: page + 1,
                })
              }
              disabled={!orderState.pagination.hasNextPage}
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                rounded-full
                bg-gray-950
                px-3.5
                text-xs
                font-bold
                text-white
                transition-colors

                hover:bg-gray-800

                disabled:cursor-not-allowed
                disabled:bg-gray-200
                disabled:text-gray-400

                sm:px-4
              "
            >
              Next
            </button>
          </div>
        )}
    </section>
  );
}

export default AdminOrders;
