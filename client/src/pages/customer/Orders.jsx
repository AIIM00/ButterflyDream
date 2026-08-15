import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

// MUI Icons
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

// Components
import OrderStatusBadge from "../../components/orders/OrderStatusBadge.jsx";

// Services
import { fetchCustomerOrders } from "../../services/customerApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   ORDER STATUS OPTIONS
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   ORDERS
========================================================= */

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

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

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

  /* =======================================================
     FILTERS
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

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function retryOrders() {
    setOrderState((currentState) => ({
      ...currentState,

      requestKey: null,
    }));
  }

  const hasFilters = Boolean(status) || sort === "oldest";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
      "
    >
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
        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <header className="max-w-2xl">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase

              tracking-[0.2em]

              text-brand-accent-text
            "
          >
            Your Butterfly Dream
          </p>

          <h1
            className="
              mt-3

              font-display

              text-[2.65rem]
              font-medium

              leading-[0.95]

              tracking-[-0.045em]

              text-brand-text

              sm:text-5xl

              lg:text-6xl
            "
          >
            My orders
          </h1>

          <p
            className="
              mt-4
              max-w-xl

              text-sm
              leading-7

              text-brand-text-muted

              sm:text-base
            "
          >
            Follow your current orders and revisit the pieces that have already
            become part of your story.
          </p>
        </header>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <section
          className="
            mt-8

            overflow-hidden

            rounded-[1.75rem]

            border
            border-brand-border

            bg-brand-surface
          "
        >
          {/* FILTER HEADER */}

          <div
            className="
              flex
              items-center

              gap-3

              border-b
              border-brand-border

              px-5
              py-4

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

                bg-brand-accent-soft

                text-brand-accent-text
              "
            >
              <FilterAltOutlinedIcon
                sx={{
                  fontSize: 19,
                }}
              />
            </span>

            <div>
              <p
                className="
                  text-[0.56rem]
                  font-bold
                  uppercase

                  tracking-[0.18em]

                  text-brand-accent-text
                "
              >
                Refine
              </p>

              <h2
                className="
                  font-display

                  text-xl
                  font-medium

                  tracking-[-0.025em]

                  text-brand-text
                "
              >
                Find an order
              </h2>
            </div>
          </div>

          {/* FILTER CONTROLS */}

          <div
            className="
              grid

              gap-4

              p-5

              sm:grid-cols-2
              sm:p-6

              lg:grid-cols-[1fr_1fr_auto]
            "
          >
            {/* STATUS */}

            <label>
              <span
                className="
                  text-[0.68rem]
                  font-semibold

                  text-brand-text
                "
              >
                Status
              </span>

              <select
                value={status}
                onChange={handleStatusChange}
                className="
                  mt-2

                  min-h-12
                  w-full

                  rounded-[1rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft

                  px-4

                  text-sm

                  text-brand-text

                  outline-none

                  transition-all
                  duration-200

                  hover:border-brand-text/20

                  focus:border-brand-accent-fill
                  focus:bg-brand-surface
                  focus:ring-2
                  focus:ring-brand-accent-fill/15
                "
              >
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option || "all"} value={option}>
                    {formatStatusLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            {/* SORT */}

            <label>
              <span
                className="
                  text-[0.68rem]
                  font-semibold

                  text-brand-text
                "
              >
                Sort
              </span>

              <select
                value={sort}
                onChange={handleSortChange}
                className="
                  mt-2

                  min-h-12
                  w-full

                  rounded-[1rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft

                  px-4

                  text-sm

                  text-brand-text

                  outline-none

                  transition-all
                  duration-200

                  hover:border-brand-text/20

                  focus:border-brand-accent-fill
                  focus:bg-brand-surface
                  focus:ring-2
                  focus:ring-brand-accent-fill/15
                "
              >
                <option value="newest">Newest first</option>

                <option value="oldest">Oldest first</option>
              </select>
            </label>

            {/* CLEAR */}

            <div
              className="
                flex
                items-end
              "
            >
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="
                  inline-flex
                  min-h-12
                  w-full

                  items-center
                  justify-center

                  gap-2

                  rounded-full

                  border
                  border-brand-border

                  bg-brand-surface

                  px-4

                  text-sm
                  font-semibold

                  text-brand-text-muted

                  transition-all

                  hover:border-brand-accent-fill/40
                  hover:bg-brand-surface-soft
                  hover:text-brand-text

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-35

                  lg:w-auto
                "
              >
                <FilterAltOffOutlinedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
                Clear filters
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================
            LOADING
        ================================================== */}

        {isLoading && (
          <div
            className="
              mt-7

              space-y-4
            "
          >
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-64

                  animate-pulse

                  rounded-[1.75rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft
                "
              />
            ))}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {!isLoading && orderState.error && (
          <div
            className="
                mt-7

                rounded-[1.75rem]

                border
                border-brand-error/20

                bg-brand-surface

                px-6
                py-12

                text-center
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

            <h2
              className="
                  mt-5

                  font-display

                  text-3xl
                  font-medium

                  tracking-[-0.035em]

                  text-brand-text
                "
            >
              Orders could not be loaded.
            </h2>

            <p
              className="
                  mx-auto
                  mt-3
                  max-w-lg

                  text-sm
                  leading-7

                  text-brand-text-muted
                "
            >
              {getApiErrorMessage(orderState.error, "Unable to load orders.")}
            </p>

            <button
              type="button"
              onClick={retryOrders}
              className="
                  mt-6

                  inline-flex
                  min-h-11

                  items-center
                  justify-center

                  gap-2

                  rounded-full

                  bg-brand-primary

                  px-5

                  text-sm
                  font-semibold

                  text-brand-surface

                  transition-all

                  hover:bg-brand-primary-hover

                  active:scale-[0.98]
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

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!isLoading && !orderState.error && orderState.orders.length === 0 && (
          <div
            className="
                relative

                mt-7

                overflow-hidden

                rounded-[1.75rem]

                border
                border-dashed
                border-brand-border

                bg-brand-surface-soft

                px-6
                py-14

                text-center

                sm:py-16
              "
          >
            <span
              aria-hidden="true"
              className="
                  pointer-events-none

                  absolute
                  -right-16
                  -top-16

                  h-44
                  w-44

                  rounded-full

                  border
                  border-brand-accent-fill/20
                "
            />

            <div className="relative z-10">
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

                    text-brand-accent-text

                    shadow-sm
                  "
              >
                <Inventory2OutlinedIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </span>

              <p
                className="
                    mt-6

                    text-[0.6rem]
                    font-bold
                    uppercase

                    tracking-[0.2em]

                    text-brand-accent-text
                  "
              >
                Your orders
              </p>

              <h2
                className="
                    mt-2

                    font-display

                    text-3xl
                    font-medium

                    tracking-[-0.035em]

                    text-brand-text

                    sm:text-4xl
                  "
              >
                No orders found.
              </h2>

              <p
                className="
                    mx-auto
                    mt-3
                    max-w-lg

                    text-sm
                    leading-7

                    text-brand-text-muted
                  "
              >
                {hasFilters
                  ? "No orders match the filters you selected."
                  : "When you place your first Butterfly Dream order, it will appear here."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                      mt-7

                      inline-flex
                      min-h-11

                      items-center
                      justify-center

                      gap-2

                      rounded-full

                      border
                      border-brand-primary

                      px-6

                      text-sm
                      font-semibold

                      text-brand-primary

                      transition-all

                      hover:bg-brand-primary
                      hover:text-brand-surface

                      active:scale-[0.98]
                    "
                >
                  <FilterAltOffOutlinedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/products"
                  className="
                      group

                      mt-7

                      inline-flex
                      min-h-11

                      items-center
                      justify-center

                      gap-2

                      rounded-full

                      bg-brand-primary

                      px-6

                      text-sm
                      font-semibold

                      text-brand-surface

                      transition-all

                      hover:bg-brand-primary-hover

                      active:scale-[0.98]
                    "
                >
                  Start shopping
                  <ArrowForwardRoundedIcon
                    className="
                        transition-transform

                        group-hover:translate-x-0.5
                      "
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            ORDERS
        ================================================== */}

        {!isLoading && !orderState.error && orderState.orders.length > 0 && (
          <section className="mt-8">
            {/* LIST HEADER */}

            <div
              className="
                  mb-4

                  flex
                  items-end
                  justify-between

                  gap-4
                "
            >
              <div>
                <p
                  className="
                      text-[0.6rem]
                      font-bold
                      uppercase

                      tracking-[0.18em]

                      text-brand-accent-text
                    "
                >
                  Order history
                </p>

                <h2
                  className="
                      mt-1

                      font-display

                      text-2xl
                      font-medium

                      tracking-[-0.03em]

                      text-brand-text

                      sm:text-3xl
                    "
                >
                  Your purchases
                </h2>
              </div>

              {orderState.pagination?.total !== undefined && (
                <span
                  className="
                      inline-flex
                      shrink-0

                      items-center
                      justify-center

                      rounded-full

                      bg-brand-accent-soft

                      px-3
                      py-1.5

                      text-[0.6rem]
                      font-bold
                      uppercase

                      tracking-[0.12em]

                      text-brand-accent-text
                    "
                >
                  {orderState.pagination.total}{" "}
                  {orderState.pagination.total === 1 ? "order" : "orders"}
                </span>
              )}
            </div>

            {/* ============================================
                  ORDER CARDS
              ============================================ */}

            <div className="space-y-4">
              {orderState.orders.map((order) => (
                <article
                  key={order.id}
                  className="
                        group/order

                        overflow-hidden

                        rounded-[1.75rem]

                        border
                        border-brand-border

                        bg-brand-surface

                        transition-all
                        duration-200

                        hover:border-brand-accent-fill/45

                        hover:shadow-[0_12px_36px_rgba(0,0,0,0.045)]
                      "
                >
                  {/* ====================================
                          TOP
                      ==================================== */}

                  <div
                    className="
                          flex
                          flex-col

                          gap-5

                          px-5
                          py-5

                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                          sm:px-6
                        "
                  >
                    <div>
                      <p
                        className="
                              text-[0.58rem]
                              font-bold
                              uppercase

                              tracking-[0.17em]

                              text-brand-accent-text
                            "
                      >
                        Order
                      </p>

                      <h3
                        className="
                              mt-1

                              font-display

                              text-2xl
                              font-medium

                              tracking-[-0.03em]

                              text-brand-text
                            "
                      >
                        {order.orderNumber}
                      </h3>

                      <p
                        className="
                              mt-2

                              text-xs

                              text-brand-text-muted
                            "
                      >
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div
                      className="
                            flex
                            flex-wrap

                            items-center

                            gap-3

                            sm:justify-end
                          "
                    >
                      <OrderStatusBadge status={order.status} />

                      <span
                        className="
                              font-display

                              text-2xl
                              font-medium

                              tracking-[-0.03em]

                              text-brand-text
                            "
                      >
                        ${order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* ====================================
                          PRODUCT PREVIEW
                      ==================================== */}

                  <div
                    className="
                          border-y
                          border-brand-border

                          bg-brand-surface-soft/60

                          px-5
                          py-4

                          sm:px-6
                        "
                  >
                    <div
                      className="
                            flex

                            gap-3

                            overflow-x-auto

                            pb-1
                          "
                    >
                      {order.previewItems.map((item) => (
                        <div
                          key={item.id}
                          className="
                                  h-20
                                  w-20
                                  shrink-0

                                  rounded-[1rem]

                                  bg-brand-surface-soft

                                  p-1

                                  sm:h-24
                                  sm:w-24
                                "
                        >
                          <div
                            className="
                                    h-full
                                    w-full

                                    overflow-hidden

                                    rounded-[0.8rem]

                                    bg-brand-surface

                                    shadow-[inset_0_3px_10px_rgba(0,0,0,0.055)]
                                  "
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="
                                        h-full
                                        w-full

                                        object-contain

                                        p-2
                                      "
                              />
                            ) : (
                              <span
                                className="
                                        flex
                                        h-full
                                        w-full

                                        items-center
                                        justify-center

                                        text-brand-text-muted/40
                                      "
                              >
                                <ImageNotSupportedOutlinedIcon
                                  sx={{
                                    fontSize: 20,
                                  }}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ====================================
                          FOOTER
                      ==================================== */}

                  <div
                    className="
                          flex
                          flex-col

                          gap-5

                          px-5
                          py-5

                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          sm:px-6
                        "
                  >
                    <div
                      className="
                            space-y-2

                            text-sm

                            text-brand-text-muted
                          "
                    >
                      <p>
                        <span
                          className="
                                font-semibold

                                text-brand-text
                              "
                        >
                          {order.itemCount}
                        </span>{" "}
                        {order.itemCount === 1 ? "piece" : "pieces"}
                      </p>

                      <div
                        className="
                              flex
                              items-start

                              gap-2
                            "
                      >
                        <LocalShippingOutlinedIcon
                          sx={{
                            fontSize: 17,

                            marginTop: "2px",
                          }}
                          className="
                                shrink-0

                                text-brand-accent-text
                              "
                        />

                        <p>
                          Delivery to{" "}
                          <span
                            className="
                                  font-medium

                                  text-brand-text
                                "
                          >
                            {order.deliveryLocation.city},{" "}
                            {order.deliveryLocation.governorate}
                          </span>
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="
                            group/view-order

                            inline-flex
                            min-h-11
                            w-fit

                            items-center
                            justify-center

                            gap-2

                            rounded-full

                            bg-brand-primary

                            px-5

                            text-sm
                            font-semibold

                            text-brand-surface

                            transition-all

                            hover:bg-brand-primary-hover

                            active:scale-[0.98]
                          "
                    >
                      View order
                      <ArrowForwardRoundedIcon
                        className="
                              transition-transform

                              group-hover/view-order:translate-x-0.5
                            "
                        sx={{
                          fontSize: 18,
                        }}
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
            PAGINATION
        ================================================== */}

        {!isLoading &&
          orderState.pagination &&
          orderState.pagination.totalPages > 1 && (
            <div
              className="
                mt-8

                flex
                flex-wrap

                items-center
                justify-center

                gap-3
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
                  border-brand-border

                  bg-brand-surface

                  px-5

                  text-sm
                  font-semibold

                  text-brand-text

                  transition-all

                  hover:border-brand-accent-fill/40
                  hover:bg-brand-surface-soft

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              <span
                className="
                  inline-flex
                  min-h-10

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  px-4

                  text-xs
                  font-semibold

                  text-brand-accent-text
                "
              >
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
                className="
                  inline-flex
                  min-h-10

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-brand-border

                  bg-brand-surface

                  px-5

                  text-sm
                  font-semibold

                  text-brand-text

                  transition-all

                  hover:border-brand-accent-fill/40
                  hover:bg-brand-surface-soft

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          )}
      </div>
    </section>
  );
}

export default Orders;
