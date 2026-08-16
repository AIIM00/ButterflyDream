import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

// Components
import CatalogPagination from "../../components/catalog/CatalogPagination.jsx";

// Services
import { fetchInStoreSales } from "../../services/adminInStoreSaleApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   FORMATTERS
========================================================= */

function formatMoney(value, currency = "USD") {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericValue);
}

function formatSaleDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   BADGES
========================================================= */

function SaleStatusBadge({ status }) {
  const configurations = {
    COMPLETED: {
      label: "Completed",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
      dot: "bg-emerald-500",
    },

    CANCELLED: {
      label: "Cancelled",
      badge: "bg-red-50 text-red-700 ring-red-200/80",
      dot: "bg-red-500",
    },

    REFUNDED: {
      label: "Refunded",
      badge: "bg-amber-50 text-amber-700 ring-amber-200/80",
      dot: "bg-amber-500",
    },
  };

  const configuration = configurations[status] ?? {
    label: status ?? "Unknown",
    badge: "bg-gray-100 text-gray-600 ring-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={[
        `
          inline-flex
          max-w-full
          items-center
          gap-1.5
          rounded-full
          px-2.5
          py-1
          text-[0.62rem]
          font-bold
          leading-4
          ring-1
          ring-inset

          sm:text-[0.68rem]
        `,
        configuration.badge,
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 shrink-0 rounded-full",
          configuration.dot,
        ].join(" ")}
      />

      {configuration.label}
    </span>
  );
}

function PaymentBadge({ method }) {
  const configurations = {
    CASH: {
      label: "Cash",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
      dot: "bg-emerald-500",
    },

    CARD: {
      label: "Card",
      badge: "bg-blue-50 text-blue-700 ring-blue-200/80",
      dot: "bg-blue-500",
    },

    OTHER: {
      label: "Other",
      badge: "bg-gray-100 text-gray-700 ring-gray-200",
      dot: "bg-gray-500",
    },
  };

  const configuration = configurations[method] ?? {
    label: method ?? "—",
    badge: "bg-gray-100 text-gray-600 ring-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={[
        `
          inline-flex
          items-center
          gap-1.5
          rounded-full
          px-2.5
          py-1
          text-[0.62rem]
          font-bold
          ring-1
          ring-inset

          sm:text-[0.68rem]
        `,
        configuration.badge,
      ].join(" ")}
    >
      <span
        className={["h-1.5 w-1.5 rounded-full", configuration.dot].join(" ")}
      />

      {configuration.label}
    </span>
  );
}

/* =========================================================
   MOBILE SALE CARD
========================================================= */

function SaleCard({ sale }) {
  const hasCustomer = Boolean(sale.customerName) || Boolean(sale.customerPhone);

  const recordedBy =
    sale.recordedBy?.fullName || sale.recordedBy?.email || "Admin";

  return (
    <article
      className="
        overflow-hidden
        rounded-[1.2rem]
        border
        border-gray-200
        bg-white
        shadow-[0_4px_16px_rgba(15,23,42,0.035)]
      "
    >
      {/* TOP */}
      <div className="p-4">
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Sale
            </p>

            <p
              className="
                mt-1
                truncate
                text-sm
                font-bold
                text-gray-950
              "
            >
              {sale.saleNumber}
            </p>

            <p
              className="
                mt-1
                truncate
                text-[0.65rem]
                text-gray-400
              "
            >
              Recorded by {recordedBy}
            </p>
          </div>

          <SaleStatusBadge status={sale.status} />
        </div>

        {/* DATE */}
        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            rounded-xl
            bg-gray-50
            px-3
            py-2.5
          "
        >
          <CalendarMonthOutlinedIcon
            sx={{
              fontSize: 15,
            }}
            className="text-gray-400"
          />

          <p
            className="
              text-[0.68rem]
              font-medium
              text-gray-600
            "
          >
            {formatSaleDate(sale.soldAt)}
          </p>
        </div>

        {/* CUSTOMER */}
        <div className="mt-4">
          <p
            className="
              text-[0.58rem]
              font-bold
              uppercase
              tracking-[0.08em]
              text-gray-400
            "
          >
            Customer
          </p>

          {hasCustomer ? (
            <div className="mt-1">
              <p
                className="
                  text-xs
                  font-bold
                  text-gray-800
                "
              >
                {sale.customerName || "Walk-in customer"}
              </p>

              {sale.customerPhone && (
                <p
                  className="
                    mt-0.5
                    text-[0.65rem]
                    text-gray-500
                  "
                >
                  {sale.customerPhone}
                </p>
              )}
            </div>
          ) : (
            <p
              className="
                mt-1
                text-xs
                font-medium
                text-gray-500
              "
            >
              Walk-in
            </p>
          )}
        </div>

        {/* METRICS */}
        <div
          className="
            mt-4
            grid
            grid-cols-3
            divide-x
            divide-gray-200
            rounded-xl
            bg-gray-50
            py-3
          "
        >
          <div className="px-2.5">
            <p
              className="
                text-[0.54rem]
                font-bold
                uppercase
                tracking-[0.06em]
                text-gray-400
              "
            >
              Items
            </p>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-gray-950
              "
            >
              {sale.itemCount}
            </p>
          </div>

          <div className="px-2.5">
            <p
              className="
                text-[0.54rem]
                font-bold
                uppercase
                tracking-[0.06em]
                text-gray-400
              "
            >
              Discount
            </p>

            <p
              className={[
                `
                  mt-1
                  truncate
                  text-xs
                  font-bold
                `,
                Number(sale.discountAmount) > 0
                  ? "text-emerald-700"
                  : "text-gray-500",
              ].join(" ")}
            >
              {Number(sale.discountAmount) > 0
                ? `-${formatMoney(sale.discountAmount, sale.currency)}`
                : "—"}
            </p>
          </div>

          <div className="px-2.5">
            <p
              className="
                text-[0.54rem]
                font-bold
                uppercase
                tracking-[0.06em]
                text-gray-400
              "
            >
              Total
            </p>

            <p
              className="
                mt-1
                truncate
                text-xs
                font-bold
                text-gray-950
              "
            >
              {formatMoney(sale.totalAmount, sale.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-gray-100
          bg-gray-50/60
          px-4
          py-3
        "
      >
        <span
          className="
            text-[0.58rem]
            font-bold
            uppercase
            tracking-[0.08em]
            text-gray-400
          "
        >
          Payment
        </span>

        <PaymentBadge method={sale.paymentMethod} />
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

function AdminInStoreSalesHistory() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.toString();

  const [requestState, setRequestState] = useState({
    requestKey: null,
    data: null,
    error: null,
  });

  /* =======================================================
     LOAD SALES
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadSales() {
      try {
        const params = new URLSearchParams(queryString);

        if (!params.has("limit")) {
          params.set("limit", "20");
        }

        const response = await fetchInStoreSales(params, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setRequestState({
          requestKey: queryString,
          data: response?.data ?? null,
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setRequestState({
          requestKey: queryString,
          data: null,
          error,
        });
      }
    }

    void loadSales();

    return () => {
      controller.abort();
    };
  }, [queryString]);

  const currentRequest = requestState.requestKey === queryString;

  const isLoading = !currentRequest;

  const data = currentRequest ? requestState.data : null;

  const error = currentRequest ? requestState.error : null;

  const sales = Array.isArray(data?.sales) ? data.sales : [];

  const pagination = data?.pagination ?? {
    page: Number(searchParams.get("page") ?? 1),

    limit: 20,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  function updateParameter(name, value, resetPage = true) {
    const nextParameters = new URLSearchParams(searchParams);

    if (value === null || value === undefined || value === "") {
      nextParameters.delete(name);
    } else {
      nextParameters.set(name, String(value));
    }

    if (resetPage) {
      nextParameters.delete("page");
    }

    setSearchParams(nextParameters);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters =
    Boolean(searchParams.get("search")) ||
    Boolean(searchParams.get("status")) ||
    Boolean(searchParams.get("paymentMethod")) ||
    Boolean(searchParams.get("dateFrom")) ||
    Boolean(searchParams.get("dateTo"));

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
            Physical store
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
            Sales history
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
            Review physical-store transactions, payments, customers, discounts,
            and sale status.
          </p>
        </div>

        <Link
          to="/admin/in-store-sales"
          className="
            inline-flex
            min-h-11
            w-full
            shrink-0
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

            sm:w-auto
          "
        >
          <AddRoundedIcon
            sx={{
              fontSize: 18,
            }}
          />
          New sale
        </Link>
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
        <div
          className="
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-5

            lg:px-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
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
                Find transactions
              </h2>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  shrink-0
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
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div
          className="
            grid
            gap-3
            p-4

            sm:grid-cols-2
            sm:p-5

            lg:grid-cols-3
            lg:p-6

            xl:grid-cols-[minmax(15rem,1.4fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_minmax(10rem,0.75fr)_minmax(10rem,0.75fr)]
          "
        >
          {/* SEARCH */}
          <div
            className="
              sm:col-span-2

              lg:col-span-3

              xl:col-span-1
            "
          >
            <label
              htmlFor="in-store-sale-search"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Search
            </label>

            <div className="relative mt-1.5">
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
                id="in-store-sale-search"
                key={searchParams.get("search") ?? "empty-search"}
                defaultValue={searchParams.get("search") ?? ""}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateParameter("search", event.currentTarget.value.trim());
                  }
                }}
                placeholder="Sale, customer, product or SKU"
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
          </div>

          {/* STATUS */}
          <div>
            <label
              htmlFor="in-store-status"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Status
            </label>

            <div className="relative mt-1.5">
              <select
                id="in-store-status"
                value={searchParams.get("status") ?? ""}
                onChange={(event) =>
                  updateParameter("status", event.target.value)
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
                <option value="">All statuses</option>

                <option value="COMPLETED">Completed</option>

                <option value="CANCELLED">Cancelled</option>

                <option value="REFUNDED">Refunded</option>
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

          {/* PAYMENT */}
          <div>
            <label
              htmlFor="in-store-payment"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              Payment
            </label>

            <div className="relative mt-1.5">
              <select
                id="in-store-payment"
                value={searchParams.get("paymentMethod") ?? ""}
                onChange={(event) =>
                  updateParameter("paymentMethod", event.target.value)
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
                <option value="">All payments</option>

                <option value="CASH">Cash</option>

                <option value="CARD">Card</option>

                <option value="OTHER">Other</option>
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

          {/* FROM */}
          <div>
            <label
              htmlFor="in-store-date-from"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              From
            </label>

            <input
              id="in-store-date-from"
              type="date"
              value={searchParams.get("dateFrom") ?? ""}
              onChange={(event) =>
                updateParameter("dateFrom", event.target.value)
              }
              className="
                mt-1.5
                min-h-11
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                font-semibold
                text-gray-700
                outline-none

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]
              "
            />
          </div>

          {/* TO */}
          <div>
            <label
              htmlFor="in-store-date-to"
              className="
                text-[0.65rem]
                font-bold
                text-gray-600

                sm:text-xs
              "
            >
              To
            </label>

            <input
              id="in-store-date-to"
              type="date"
              value={searchParams.get("dateTo") ?? ""}
              onChange={(event) =>
                updateParameter("dateTo", event.target.value)
              }
              className="
                mt-1.5
                min-h-11
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                font-semibold
                text-gray-700
                outline-none

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]
              "
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          COUNT
      ===================================================== */}
      {!isLoading && !error && (
        <section
          className="
            flex
            items-center
            justify-between
            gap-4
            rounded-[1.2rem]
            border
            border-gray-200/80
            bg-white
            px-4
            py-3.5
            shadow-[0_6px_20px_rgba(15,23,42,0.03)]

            sm:px-5
          "
        >
          <div>
            <p
              className="
                text-[0.6rem]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Sales found
            </p>

            <p
              className="
                mt-1
                text-xl
                font-bold
                tracking-[-0.03em]
                text-gray-950

                sm:text-2xl
              "
            >
              {pagination.totalItems}
            </p>
          </div>

          <span
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-gray-950
              text-white
            "
          >
            <PointOfSaleRoundedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </span>
        </section>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}
      {isLoading && (
        <>
          {/* MOBILE */}
          <div
            className="
              space-y-3

              lg:hidden
            "
          >
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-72
                  animate-pulse
                  rounded-[1.2rem]
                  bg-gray-100
                "
              />
            ))}
          </div>

          {/* DESKTOP */}
          <div
            className="
              hidden
              h-80
              animate-pulse
              rounded-[1.4rem]
              bg-gray-100

              lg:block
            "
          />
        </>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}
      {!isLoading && error && (
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
              text-gray-950
            "
          >
            Sales could not be loaded
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
            {getApiErrorMessage(error, "Unable to load in-store sales.")}
          </p>

          <button
            type="button"
            onClick={() => {
              const nextParameters = new URLSearchParams(searchParams);

              setSearchParams(nextParameters);
            }}
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
      {!isLoading && !error && sales.length === 0 && (
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
            <PointOfSaleRoundedIcon
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
            Physical sales
          </p>

          <h3
            className="
                mt-1.5
                text-xl
                font-bold
                text-gray-950

                sm:text-2xl
              "
          >
            No physical sales found
          </h3>

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
            {hasFilters
              ? "No transactions match the current filters."
              : "Recorded in-store transactions will appear here."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
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
              Clear filters
            </button>
          ) : (
            <Link
              to="/admin/in-store-sales"
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
              <AddRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />
              Record first sale
            </Link>
          )}
        </div>
      )}

      {/* =====================================================
          SALES
      ===================================================== */}
      {!isLoading && !error && sales.length > 0 && (
        <>
          {/* ===============================================
                MOBILE + TABLET
            =============================================== */}
          <div
            className="
                space-y-3

                lg:hidden
              "
          >
            {sales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} />
            ))}
          </div>

          {/* ===============================================
                DESKTOP TABLE
            =============================================== */}
          <div
            className="
                hidden
                overflow-hidden
                rounded-[1.4rem]
                border
                border-gray-200/80
                bg-white
                shadow-[0_8px_24px_rgba(15,23,42,0.04)]

                lg:block
              "
          >
            <div className="overflow-x-auto">
              <table
                className="
                    w-full
                    min-w-[1000px]
                  "
              >
                <thead>
                  <tr
                    className="
                        border-b
                        border-gray-100
                        bg-gray-50/70
                      "
                  >
                    {[
                      "Sale",
                      "Date",
                      "Customer",
                      "Items",
                      "Payment",
                      "Status",
                      "Discount",
                      "Total",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={[
                          `
                                px-5
                                py-3.5
                                text-[0.65rem]
                                font-bold
                                uppercase
                                tracking-[0.1em]
                                text-gray-400
                              `,
                          index === 3
                            ? "text-center"
                            : index >= 6
                              ? "text-right"
                              : "text-left",
                        ].join(" ")}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody
                  className="
                      divide-y
                      divide-gray-100
                    "
                >
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="
                          transition-colors
                          hover:bg-gray-50/70
                        "
                    >
                      {/* SALE */}
                      <td className="px-5 py-4">
                        <p
                          className="
                              text-sm
                              font-bold
                              text-gray-950
                            "
                        >
                          {sale.saleNumber}
                        </p>

                        <p
                          className="
                              mt-1
                              max-w-[10rem]
                              truncate
                              text-xs
                              text-gray-400
                            "
                        >
                          {sale.recordedBy?.fullName ||
                            sale.recordedBy?.email ||
                            "Admin"}
                        </p>
                      </td>

                      {/* DATE */}
                      <td
                        className="
                            px-5
                            py-4
                            text-sm
                            text-gray-500
                          "
                      >
                        {formatSaleDate(sale.soldAt)}
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        {sale.customerName || sale.customerPhone ? (
                          <>
                            <p
                              className="
                                  max-w-[11rem]
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-gray-800
                                "
                            >
                              {sale.customerName || "Walk-in customer"}
                            </p>

                            {sale.customerPhone && (
                              <p
                                className="
                                    mt-1
                                    max-w-[11rem]
                                    truncate
                                    text-xs
                                    text-gray-400
                                  "
                              >
                                {sale.customerPhone}
                              </p>
                            )}
                          </>
                        ) : (
                          <span
                            className="
                                text-sm
                                text-gray-400
                              "
                          >
                            Walk-in
                          </span>
                        )}
                      </td>

                      {/* ITEMS */}
                      <td
                        className="
                            px-5
                            py-4
                            text-center
                          "
                      >
                        <span
                          className="
                              inline-flex
                              min-w-9
                              items-center
                              justify-center
                              rounded-full
                              bg-gray-100
                              px-2.5
                              py-1.5
                              text-xs
                              font-bold
                              text-gray-700
                            "
                        >
                          {sale.itemCount}
                        </span>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-5 py-4">
                        <PaymentBadge method={sale.paymentMethod} />
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <SaleStatusBadge status={sale.status} />
                      </td>

                      {/* DISCOUNT */}
                      <td
                        className="
                            px-5
                            py-4
                            text-right
                            text-sm
                            font-semibold
                          "
                      >
                        {Number(sale.discountAmount) > 0 ? (
                          <span className="text-emerald-700">
                            -{formatMoney(sale.discountAmount, sale.currency)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* TOTAL */}
                      <td
                        className="
                            px-5
                            py-4
                            text-right
                            text-sm
                            font-bold
                            text-gray-950
                          "
                      >
                        {formatMoney(sale.totalAmount, sale.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <CatalogPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            onPageChange={(page) => updateParameter("page", page, false)}
          />
        </>
      )}
    </section>
  );
}

export default AdminInStoreSalesHistory;
