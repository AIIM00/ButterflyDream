import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

// Components
import CatalogPagination from "../../components/catalog/CatalogPagination.jsx";

// Services
import { fetchInStoreSales } from "../../services/adminInStoreSaleApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

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

function SaleStatusBadge({ status }) {
  const styles = {
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    REFUNDED: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={[
        `
          inline-flex items-center
          rounded-full border
          px-3 py-1
          text-xs font-bold
        `,
        styles[status] ?? "border-gray-200 bg-gray-50 text-gray-600",
      ].join(" ")}
    >
      {status ?? "UNKNOWN"}
    </span>
  );
}

function PaymentBadge({ method }) {
  const label = {
    CASH: "Cash",
    CARD: "Card",
    OTHER: "Other",
  }[method];

  return (
    <span
      className="
        inline-flex
        rounded-full
        bg-[var(--color-soft-ivory)]
        px-3 py-1
        text-xs font-bold
        text-[var(--color-deep-espresso)]
      "
    >
      {label ?? method ?? "—"}
    </span>
  );
}

function AdminInStoreSalesHistory() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.toString();

  const [requestState, setRequestState] = useState({
    requestKey: null,
    data: null,
    error: null,
  });

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

  return (
    <section className="space-y-7">
      {/* HEADER */}

      <header
        className="
          flex flex-col gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm font-semibold
              uppercase tracking-widest
              text-[var(--color-warm-gray)]
            "
          >
            Physical store
          </p>

          <h2
            className="
              mt-2
              text-3xl font-bold
              tracking-tight
              text-[var(--color-deep-espresso)]
            "
          >
            In-Store Sales History
          </h2>

          <p
            className="
              mt-3 max-w-2xl
              text-sm leading-6
              text-[var(--color-warm-gray)]
            "
          >
            Review physical-store transactions, payment methods, customers,
            discounts, and sale status.
          </p>
        </div>

        <Link
          to="/admin/in-store-sales"
          className="
            inline-flex min-h-12
            items-center justify-center
            gap-2 rounded-full
            bg-[var(--color-deep-espresso)]
            px-5
            font-semibold text-white
            transition
            hover:opacity-90
          "
        >
          <AddRoundedIcon />
          New sale
        </Link>
      </header>

      {/* FILTERS */}

      <section
        className="
          grid gap-4
          rounded-2xl
          border border-[var(--color-warm-light-gray)]
          bg-white p-5
          shadow-sm
          lg:grid-cols-2
          xl:grid-cols-[minmax(15rem,1fr)_repeat(4,minmax(9rem,auto))]
        "
      >
        {/* SEARCH */}

        <label className="relative">
          <SearchRoundedIcon
            className="
              absolute left-4 top-1/2
              -translate-y-1/2
              text-[var(--color-warm-gray)]
            "
          />

          <input
            key={searchParams.get("search") ?? "empty-search"}
            defaultValue={searchParams.get("search") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParameter("search", event.currentTarget.value.trim());
              }
            }}
            placeholder="Sale, customer, product or SKU"
            className="
              min-h-12 w-full
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              py-3 pl-12 pr-4
              text-sm
              outline-none
              transition
              focus:border-[var(--color-deep-bronze)]
            "
          />
        </label>

        {/* STATUS */}

        <select
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateParameter("status", event.target.value)}
          className="
            min-h-12
            rounded-full
            border
            border-[var(--color-warm-light-gray)]
            bg-white
            px-4
            text-sm font-semibold
            text-[var(--color-deep-espresso)]
            outline-none
          "
        >
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        {/* PAYMENT */}

        <select
          value={searchParams.get("paymentMethod") ?? ""}
          onChange={(event) =>
            updateParameter("paymentMethod", event.target.value)
          }
          className="
            min-h-12
            rounded-full
            border
            border-[var(--color-warm-light-gray)]
            bg-white
            px-4
            text-sm font-semibold
            text-[var(--color-deep-espresso)]
            outline-none
          "
        >
          <option value="">All payments</option>

          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other</option>
        </select>

        {/* DATE FROM */}

        <label>
          <span className="sr-only">From date</span>

          <input
            type="date"
            value={searchParams.get("dateFrom") ?? ""}
            onChange={(event) =>
              updateParameter("dateFrom", event.target.value)
            }
            className="
              min-h-12
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-4
              text-sm font-semibold
              text-[var(--color-deep-espresso)]
              outline-none
            "
          />
        </label>

        {/* DATE TO */}

        <label>
          <span className="sr-only">To date</span>

          <input
            type="date"
            value={searchParams.get("dateTo") ?? ""}
            onChange={(event) => updateParameter("dateTo", event.target.value)}
            className="
              min-h-12
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-4
              text-sm font-semibold
              text-[var(--color-deep-espresso)]
              outline-none
            "
          />
        </label>
      </section>

      {/* FILTER ACTION */}

      {hasFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-5 py-2.5
              text-sm font-semibold
              text-[var(--color-deep-espresso)]
              transition
              hover:border-[var(--color-deep-bronze)]
            "
          >
            Clear filters
          </button>
        </div>
      )}

      {/* COUNT */}

      {!isLoading && !error && (
        <section
          className="
            rounded-2xl
            border
            border-[var(--color-warm-light-gray)]
            bg-white p-5
            shadow-sm
          "
        >
          <p
            className="
              text-sm font-semibold
              text-[var(--color-warm-gray)]
            "
          >
            Sales found
          </p>

          <p
            className="
              mt-2 text-3xl font-bold
              text-[var(--color-deep-espresso)]
            "
          >
            {pagination.totalItems}
          </p>
        </section>
      )}

      {/* LOADING */}

      {isLoading && (
        <div
          className="
            h-80 animate-pulse
            rounded-2xl
            bg-[var(--color-soft-ivory)]
          "
        />
      )}

      {/* ERROR */}

      {!isLoading && error && (
        <div
          className="
            rounded-2xl
            border border-red-200
            bg-red-50
            px-6 py-14
            text-center
          "
        >
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{ fontSize: 56 }}
          />

          <p
            className="
              mt-4 font-bold
              text-red-800
            "
          >
            {getApiErrorMessage(error, "Unable to load in-store sales.")}
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!isLoading && !error && sales.length === 0 && (
        <div
          className="
              rounded-2xl
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-6 py-16
              text-center
            "
        >
          <PointOfSaleRoundedIcon
            className="
                text-[var(--color-warm-light-gray)]
              "
            sx={{ fontSize: 64 }}
          />

          <h3
            className="
                mt-4 text-2xl font-bold
                text-[var(--color-deep-espresso)]
              "
          >
            No physical sales found
          </h3>

          <p
            className="
                mx-auto mt-2
                max-w-md
                text-sm leading-6
                text-[var(--color-warm-gray)]
              "
          >
            Recorded in-store transactions will appear here.
          </p>

          <Link
            to="/admin/in-store-sales"
            className="
                mt-6 inline-flex
                min-h-11
                items-center justify-center
                gap-2 rounded-full
                bg-[var(--color-deep-espresso)]
                px-5
                font-semibold text-white
              "
          >
            <AddRoundedIcon />
            Record first sale
          </Link>
        </div>
      )}

      {/* SALES TABLE */}

      {!isLoading && !error && sales.length > 0 && (
        <>
          <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-[var(--color-warm-light-gray)]
                bg-white
                shadow-sm
              "
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead
                  className="
                      bg-[var(--color-soft-ivory)]
                      text-left
                      text-xs font-bold
                      uppercase
                      tracking-wider
                      text-[var(--color-warm-gray)]
                    "
                >
                  <tr>
                    <th className="px-5 py-4">Sale</th>

                    <th className="px-5 py-4">Date</th>

                    <th className="px-5 py-4">Customer</th>

                    <th className="px-5 py-4 text-center">Items</th>

                    <th className="px-5 py-4">Payment</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4 text-right">Discount</th>

                    <th className="px-5 py-4 text-right">Total</th>
                  </tr>
                </thead>

                <tbody
                  className="
                      divide-y
                      divide-[var(--color-warm-light-gray)]
                    "
                >
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="
                          transition-colors
                          hover:bg-[var(--color-soft-ivory)]
                        "
                    >
                      {/* SALE */}

                      <td className="px-5 py-4">
                        <p
                          className="
                              font-bold
                              text-[var(--color-deep-espresso)]
                            "
                        >
                          {sale.saleNumber}
                        </p>

                        <p
                          className="
                              mt-1 text-xs
                              text-[var(--color-warm-gray)]
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
                            px-5 py-4
                            text-sm
                            text-[var(--color-warm-gray)]
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
                                  text-sm font-semibold
                                  text-[var(--color-deep-espresso)]
                                "
                            >
                              {sale.customerName || "Walk-in customer"}
                            </p>

                            {sale.customerPhone && (
                              <p
                                className="
                                    mt-1 text-xs
                                    text-[var(--color-warm-gray)]
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
                                text-[var(--color-warm-gray)]
                              "
                          >
                            Walk-in
                          </span>
                        )}
                      </td>

                      {/* ITEMS */}

                      <td
                        className="
                            px-5 py-4
                            text-center
                            font-bold
                            text-[var(--color-deep-espresso)]
                          "
                      >
                        {sale.itemCount}
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
                            px-5 py-4
                            text-right
                            text-sm font-semibold
                            text-[var(--color-warm-gray)]
                          "
                      >
                        {Number(sale.discountAmount) > 0
                          ? `-${formatMoney(
                              sale.discountAmount,
                              sale.currency,
                            )}`
                          : "—"}
                      </td>

                      {/* TOTAL */}

                      <td
                        className="
                            px-5 py-4
                            text-right
                            text-base font-bold
                            text-[var(--color-deep-espresso)]
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
