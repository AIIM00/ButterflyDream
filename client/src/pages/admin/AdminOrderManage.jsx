import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SyncAltRoundedIcon from "@mui/icons-material/SyncAltRounded";

// Toast
import { toast } from "react-toastify";

// Components
import AdminOrderNoteEditor from "../../components/admin/orders/AdminOrderNoteEditor.jsx";
import AdminOrderStatusBadge from "../../components/admin/orders/AdminOrderStatusBadge.jsx";
import AdminPaymentStatusBadge from "../../components/admin/orders/AdminPaymentStatusBadge.jsx";
import CancelOrderDialog from "../../components/admin/orders/CancelOrderDialog.jsx";
import OrderStatusDialog from "../../components/admin/orders/OrderStatusDialog.jsx";
import PaymentStatusDialog from "../../components/admin/orders/PaymentStatusDialog.jsx";

// Services
import {
  cancelAdminOrder,
  fetchAdminOrder,
  updateAdminOrderNote,
  updateAdminOrderPayment,
  updateAdminOrderStatus,
} from "../../services/adminOrderApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

import {
  canCancelOrder,
  formatOrderStatus,
  getNextOrderStatuses,
  getNextPaymentStatuses,
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

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/* =========================================================
   ORDER PRODUCT
========================================================= */

function OrderProductItem({ item }) {
  return (
    <article
      className="
        flex
        items-start
        gap-3.5
        py-4

        sm:gap-4
        sm:py-5
      "
    >
      {/* IMAGE */}
      <div
        className="
          h-[4.5rem]
          w-[4.5rem]
          shrink-0
          overflow-hidden
          rounded-[1rem]
          bg-gray-100
          ring-1
          ring-gray-200/70

          sm:h-24
          sm:w-24
        "
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <span
            className="
              flex
              h-full
              items-center
              justify-center
              text-gray-400
            "
          >
            <ImageNotSupportedOutlinedIcon
              sx={{
                fontSize: 22,
              }}
            />
          </span>
        )}
      </div>

      {/* INFO */}
      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            <h3
              className="
                line-clamp-2
                text-sm
                font-bold
                leading-5
                text-gray-950

                sm:text-base
              "
            >
              {item.productName}
            </h3>

            <p
              className="
                mt-1
                truncate
                text-[0.68rem]
                font-medium
                text-gray-500

                sm:text-sm
              "
            >
              {item.variantName}
            </p>

            <p
              className="
                mt-1
                truncate
                text-[0.58rem]
                font-medium
                uppercase
                tracking-[0.07em]
                text-gray-400

                sm:text-xs
              "
            >
              SKU: {item.sku}
            </p>
          </div>

          <p
            className="
              shrink-0
              text-sm
              font-bold
              text-gray-950

              sm:text-base
            "
          >
            ${item.lineTotal}
          </p>
        </div>

        {/* DETAILS */}
        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >
          <span
            className="
              rounded-full
              bg-gray-100
              px-2.5
              py-1
              text-[0.62rem]
              font-semibold
              text-gray-600

              sm:text-xs
            "
          >
            Qty {item.quantity}
          </span>

          <span
            className="
              rounded-full
              bg-gray-100
              px-2.5
              py-1
              text-[0.62rem]
              font-semibold
              text-gray-600

              sm:text-xs
            "
          >
            ${item.unitPrice} each
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFORMATION CARD
========================================================= */

function InfoCard({ icon: Icon, eyebrow, title, children }) {
  return (
    <section
      className="
        overflow-hidden
        rounded-[1.3rem]
        border
        border-gray-200/80
        bg-white
        shadow-[0_6px_20px_rgba(15,23,42,0.035)]
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
        "
      >
        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gray-100
            text-gray-600
          "
        >
          <Icon
            sx={{
              fontSize: 18,
            }}
          />
        </span>

        <div>
          {eyebrow && (
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              {eyebrow}
            </p>
          )}

          <h2
            className="
              mt-0.5
              text-sm
              font-bold
              text-gray-950

              sm:text-base
            "
          >
            {title}
          </h2>
        </div>
      </div>

      <div
        className="
          px-4
          py-4

          sm:px-5
        "
      >
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

function AdminOrderManage() {
  const { orderId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [reloadToken, setReloadToken] = useState(0);

  const requestKey = useMemo(
    () => `${orderId}:${reloadToken}`,
    [orderId, reloadToken],
  );

  const [orderState, setOrderState] = useState({
    requestKey: null,
    order: null,
    error: null,
  });

  const [mutationKey, setMutationKey] = useState(null);

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    key: 0,
  });

  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    key: 0,
  });

  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    key: 0,
  });

  const isLoading = orderState.requestKey !== requestKey;

  /* =======================================================
     LOAD ORDER
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      try {
        const response = await fetchAdminOrder(orderId, {
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

  /* =======================================================
     MUTATION
  ======================================================= */

  async function runMutation(key, operation, successMessage) {
    setMutationKey(key);

    try {
      const response = await operation();

      setOrderState((currentState) => ({
        ...currentState,
        order: response.order,
        error: null,
      }));

      toast.success(response.message ?? successMessage);

      return response;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update order."));

      return null;
    } finally {
      setMutationKey(null);
    }
  }

  /* =======================================================
     DIALOGS
  ======================================================= */

  function openStatusDialog() {
    setStatusDialog((currentState) => ({
      open: true,
      key: currentState.key + 1,
    }));
  }

  function openPaymentDialog() {
    setPaymentDialog((currentState) => ({
      open: true,
      key: currentState.key + 1,
    }));
  }

  function openCancelDialog() {
    setCancelDialog((currentState) => ({
      open: true,
      key: currentState.key + 1,
    }));
  }

  /* =======================================================
     STATUS
  ======================================================= */

  async function handleStatusSubmit(payload) {
    const response = await runMutation(
      "status",

      () => updateAdminOrderStatus(orderId, payload),

      payload.status === "RETURNED"
        ? "Order marked as returned and inventory restored."
        : "Order status updated.",
    );

    if (response) {
      setStatusDialog((currentState) => ({
        ...currentState,
        open: false,
      }));
    }
  }

  /* =======================================================
     PAYMENT
  ======================================================= */

  async function handlePaymentSubmit(payload) {
    const response = await runMutation(
      "payment",

      () => updateAdminOrderPayment(orderId, payload),

      "Payment status updated.",
    );

    if (response) {
      setPaymentDialog((currentState) => ({
        ...currentState,
        open: false,
      }));
    }
  }

  /* =======================================================
     CANCEL
  ======================================================= */

  async function handleCancelSubmit(payload) {
    const response = await runMutation(
      "cancel",

      () => cancelAdminOrder(orderId, payload),

      "Order cancelled and inventory restored.",
    );

    if (response) {
      setCancelDialog((currentState) => ({
        ...currentState,
        open: false,
      }));
    }
  }

  /* =======================================================
     NOTE
  ======================================================= */

  async function handleNoteSubmit(adminNote) {
    await runMutation(
      "note",

      () => updateAdminOrderNote(orderId, adminNote),

      "Admin note updated.",
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section
        className="
          mx-auto
          w-full
          max-w-[100rem]
        "
      >
        <div className="h-7 w-28 animate-pulse rounded bg-gray-100" />

        <div
          className="
            mt-4
            h-40
            animate-pulse
            rounded-[1.4rem]
            bg-gray-100
          "
        />

        <div
          className="
            mt-5
            grid
            gap-4

            sm:mt-6

            xl:grid-cols-[minmax(0,1fr)_23rem]
          "
        >
          <div className="space-y-4">
            <div className="h-[28rem] animate-pulse rounded-[1.4rem] bg-gray-100" />

            <div className="h-80 animate-pulse rounded-[1.4rem] bg-gray-100" />
          </div>

          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-[1.4rem] bg-gray-100" />

            <div className="h-56 animate-pulse rounded-[1.4rem] bg-gray-100" />
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (orderState.error) {
    const notFound = orderState.error?.response?.status === 404;

    return (
      <section
        className="
          mx-auto
          flex
          min-h-[60vh]
          w-full
          max-w-xl
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full
            rounded-[1.4rem]
            border
            border-gray-200
            bg-white
            p-5
            text-center
            shadow-[0_8px_24px_rgba(15,23,42,0.04)]

            sm:p-8
          "
        >
          <span
            className={[
              `
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                ring-1
              `,
              notFound
                ? "bg-gray-100 text-gray-400 ring-gray-200"
                : "bg-red-50 text-red-600 ring-red-100",
            ].join(" ")}
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
              text-gray-400
            "
          >
            {notFound ? "Order unavailable" : "Loading error"}
          </p>

          <h1
            className="
              mt-1.5
              text-xl
              font-bold
              tracking-[-0.025em]
              text-gray-950

              sm:text-2xl
            "
          >
            {notFound ? "Order not found" : "Order could not be loaded"}
          </h1>

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

              notFound
                ? "The requested order does not exist."
                : "Unable to load this order.",
            )}
          </p>

          <div
            className="
              mt-5
              flex
              flex-col
              gap-2.5

              sm:flex-row
              sm:justify-center
            "
          >
            {!notFound && (
              <button
                type="button"
                onClick={() =>
                  setReloadToken((currentValue) => currentValue + 1)
                }
                className="
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
            )}

            <Link
              to="/admin/orders"
              className="
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
              "
            >
              Back to orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     ORDER DATA
  ========================================================= */

  const order = orderState.order;

  const nextStatuses = getNextOrderStatuses(order.status);

  const nextPaymentStatuses = getNextPaymentStatuses(order.paymentStatus);

  const orderCanBeCancelled = canCancelOrder(order.status);

  /* =========================================================
     PAGE
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
          BACK
      ===================================================== */}
      <Link
        to="/admin/orders"
        className="
          inline-flex
          min-h-8
          items-center
          gap-1.5
          text-xs
          font-bold
          text-gray-500
          transition-colors

          hover:text-gray-950

          sm:text-sm
        "
      >
        <ArrowBackRoundedIcon
          sx={{
            fontSize: 17,
          }}
        />
        Back to orders
      </Link>

      {/* =====================================================
          ORDER HEADER
      ===================================================== */}
      <header
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
            p-4

            sm:p-5

            lg:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5

              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >
            {/* ORDER INFO */}
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
                Order number
              </p>

              <h1
                className="
                  mt-1
                  break-words
                  text-2xl
                  font-bold
                  tracking-[-0.04em]
                  text-gray-950

                  sm:text-3xl
                "
              >
                {order.orderNumber}
              </h1>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  text-gray-500

                  sm:text-sm
                "
              >
                <ScheduleRoundedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />

                <span>Placed {formatDate(order.createdAt)}</span>
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <AdminOrderStatusBadge status={order.status} />

                <AdminPaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            {/* ACTIONS */}
            <div
              className="
                grid
                w-full
                gap-2

                sm:grid-cols-2

                lg:w-auto
              "
            >
              {nextStatuses.length > 0 && (
                <button
                  type="button"
                  onClick={openStatusDialog}
                  disabled={Boolean(mutationKey)}
                  className="
                    inline-flex
                    min-h-11
                    w-full
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

                    disabled:cursor-not-allowed
                    disabled:bg-gray-200
                    disabled:text-gray-400
                  "
                >
                  <SyncAltRoundedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                  Update status
                </button>
              )}

              {orderCanBeCancelled && (
                <button
                  type="button"
                  onClick={openCancelDialog}
                  disabled={Boolean(mutationKey)}
                  className="
                    inline-flex
                    min-h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-red-200
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-red-600
                    transition-colors

                    hover:bg-red-50
                    hover:text-red-700

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <CancelOutlinedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                  Cancel order
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}
      <div
        className="
          grid
          items-start
          gap-4

          sm:gap-5

          xl:grid-cols-[minmax(0,1fr)_23rem]
        "
      >
        {/* ===================================================
            MAIN CONTENT
        =================================================== */}
        <div className="space-y-4 sm:space-y-5">
          {/* ===============================================
              PRODUCTS
          =============================================== */}
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
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gray-100
                    text-gray-600
                  "
                >
                  <ReceiptLongOutlinedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </span>

                <div>
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-gray-400
                    "
                  >
                    Order contents
                  </p>

                  <h2
                    className="
                      mt-0.5
                      text-base
                      font-bold
                      text-gray-950

                      sm:text-lg
                    "
                  >
                    Ordered products
                  </h2>
                </div>
              </div>

              <span
                className="
                  rounded-full
                  bg-gray-100
                  px-2.5
                  py-1.5
                  text-xs
                  font-bold
                  text-gray-600
                "
              >
                {order.items.length}
              </span>
            </div>

            <div
              className="
                divide-y
                divide-gray-100
                px-4

                sm:px-5

                lg:px-6
              "
            >
              {order.items.map((item) => (
                <OrderProductItem key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* ===============================================
              STATUS HISTORY
          =============================================== */}
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
              <p
                className="
                  text-[0.58rem]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-gray-400
                "
              >
                Timeline
              </p>

              <h2
                className="
                  mt-0.5
                  text-base
                  font-bold
                  text-gray-950

                  sm:text-lg
                "
              >
                Status history
              </h2>
            </div>

            <div
              className="
                px-4
                py-5

                sm:px-5

                lg:px-6
              "
            >
              <div className="space-y-1">
                {order.statusHistory.map((historyItem, index) => (
                  <div
                    key={historyItem.id}
                    className="
                        relative
                        flex
                        gap-3.5

                        sm:gap-4
                      "
                  >
                    {/* TIMELINE */}
                    <div
                      className="
                          flex
                          shrink-0
                          flex-col
                          items-center
                        "
                    >
                      <span
                        className="
                            mt-1
                            h-3
                            w-3
                            rounded-full
                            bg-gray-950
                            ring-4
                            ring-gray-100
                          "
                      />

                      {index < order.statusHistory.length - 1 && (
                        <span
                          className="
                              mt-2
                              min-h-16
                              w-px
                              flex-1
                              bg-gray-200
                            "
                        />
                      )}
                    </div>

                    {/* EVENT */}
                    <div
                      className="
                          min-w-0
                          flex-1
                          pb-5
                        "
                    >
                      <p
                        className="
                            text-sm
                            font-bold
                            text-gray-950
                          "
                      >
                        {formatOrderStatus(historyItem.toStatus)}
                      </p>

                      <p
                        className="
                            mt-1
                            text-[0.65rem]
                            text-gray-400

                            sm:text-xs
                          "
                      >
                        {formatDate(historyItem.createdAt)}
                      </p>

                      {historyItem.changedBy && (
                        <p
                          className="
                              mt-1
                              text-[0.65rem]
                              font-medium
                              text-gray-500

                              sm:text-xs
                            "
                        >
                          Updated by {historyItem.changedBy.fullName}
                        </p>
                      )}

                      {historyItem.note && (
                        <div
                          className="
                              mt-3
                              rounded-xl
                              bg-gray-50
                              px-3
                              py-2.5
                            "
                        >
                          <p
                            className="
                                text-xs
                                leading-5
                                text-gray-600

                                sm:text-sm
                              "
                          >
                            {historyItem.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ADMIN NOTE */}
          <AdminOrderNoteEditor
            key={order.updatedAt}
            initialNote={order.adminNote}
            isSubmitting={mutationKey === "note"}
            onSubmit={handleNoteSubmit}
          />
        </div>

        {/* ===================================================
            SIDEBAR
        =================================================== */}
        <aside
          className="
            space-y-4

            sm:space-y-5

            xl:sticky
            xl:top-24
          "
        >
          {/* ===============================================
              SUMMARY
          =============================================== */}
          <section
            className="
              overflow-hidden
              rounded-[1.3rem]
              border
              border-gray-200/80
              bg-white
              shadow-[0_6px_20px_rgba(15,23,42,0.035)]
            "
          >
            <div
              className="
                border-b
                border-gray-100
                px-4
                py-4

                sm:px-5
              "
            >
              <p
                className="
                  text-[0.58rem]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-gray-400
                "
              >
                Financials
              </p>

              <h2
                className="
                  mt-0.5
                  text-base
                  font-bold
                  text-gray-950
                "
              >
                Order summary
              </h2>
            </div>

            <div
              className="
                px-4
                py-4

                sm:px-5
              "
            >
              <div className="space-y-3">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    text-xs

                    sm:text-sm
                  "
                >
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-bold text-gray-900">
                    ${order.subtotal}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    text-xs

                    sm:text-sm
                  "
                >
                  <span className="text-gray-500">Delivery</span>

                  <span className="font-bold text-gray-900">
                    ${order.deliveryFee}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    text-xs

                    sm:text-sm
                  "
                >
                  <span className="text-gray-500">Discount</span>

                  <span
                    className={[
                      "font-bold",
                      Number(order.discountAmount) > 0
                        ? "text-emerald-700"
                        : "text-gray-900",
                    ].join(" ")}
                  >
                    -${order.discountAmount}
                  </span>
                </div>
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-end
                  justify-between
                  gap-4
                  border-t
                  border-gray-200
                  pt-4
                "
              >
                <span
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Total
                </span>

                <span
                  className="
                    text-2xl
                    font-bold
                    tracking-[-0.04em]
                    text-gray-950
                  "
                >
                  ${order.totalAmount}
                </span>
              </div>
            </div>
          </section>

          {/* ===============================================
              PAYMENT
          =============================================== */}
          <InfoCard
            icon={PaymentOutlinedIcon}
            eyebrow="Payment"
            title="Payment details"
          >
            <p
              className="
                text-sm
                font-bold
                text-gray-900
              "
            >
              Cash on delivery
            </p>

            <div className="mt-3">
              <AdminPaymentStatusBadge status={order.paymentStatus} />
            </div>

            {nextPaymentStatuses.length > 0 && (
              <button
                type="button"
                onClick={openPaymentDialog}
                disabled={Boolean(mutationKey)}
                className="
                  mt-4
                  inline-flex
                  min-h-10
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-4
                  text-xs
                  font-bold
                  text-gray-700
                  transition-all

                  hover:border-gray-950
                  hover:bg-gray-950
                  hover:text-white

                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  sm:text-sm
                "
              >
                Update payment
              </button>
            )}
          </InfoCard>

          {/* ===============================================
              CUSTOMER
          =============================================== */}
          <InfoCard
            icon={PersonOutlineRoundedIcon}
            eyebrow="Customer"
            title="Customer details"
          >
            <p
              className="
                text-sm
                font-bold
                text-gray-900
              "
            >
              {order.customerName}
            </p>

            <p
              className="
                mt-2
                break-all
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              {order.customerEmail}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-gray-500

                sm:text-sm
              "
            >
              {order.customerPhone}
            </p>
          </InfoCard>

          {/* ===============================================
              DELIVERY
          =============================================== */}
          <InfoCard
            icon={LocalShippingOutlinedIcon}
            eyebrow="Delivery"
            title="Delivery address"
          >
            <p
              className="
                text-sm
                font-bold
                text-gray-900
              "
            >
              {order.deliveryRecipientName}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-gray-500

                sm:text-sm
              "
            >
              {order.deliveryPhone}
            </p>

            <div
              className="
                mt-3
                rounded-xl
                bg-gray-50
                p-3
              "
            >
              <p
                className="
                  text-xs
                  leading-5
                  text-gray-600

                  sm:text-sm
                  sm:leading-6
                "
              >
                {order.deliveryStreet}
                {order.deliveryBuilding ? `, ${order.deliveryBuilding}` : ""}
                {order.deliveryFloor ? `, Floor ${order.deliveryFloor}` : ""}
                <br />
                {order.deliveryCity}, {order.deliveryGovernorate}
              </p>
            </div>

            {order.deliveryLandmark && (
              <div className="mt-3">
                <p
                  className="
                    text-[0.58rem]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-gray-400
                  "
                >
                  Landmark
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-gray-600

                    sm:text-sm
                  "
                >
                  {order.deliveryLandmark}
                </p>
              </div>
            )}

            {order.deliveryNotes && (
              <div className="mt-3">
                <p
                  className="
                    text-[0.58rem]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-gray-400
                  "
                >
                  Address notes
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-gray-600

                    sm:text-sm
                  "
                >
                  {order.deliveryNotes}
                </p>
              </div>
            )}
          </InfoCard>

          {/* ===============================================
              CUSTOMER NOTE
          =============================================== */}
          {order.customerNote && (
            <InfoCard
              icon={NotesOutlinedIcon}
              eyebrow="Customer message"
              title="Customer note"
            >
              <p
                className="
                  text-xs
                  leading-5
                  text-gray-600

                  sm:text-sm
                  sm:leading-6
                "
              >
                {order.customerNote}
              </p>
            </InfoCard>
          )}

          {/* ===============================================
              CANCELLATION
          =============================================== */}
          {order.cancellationReason && (
            <section
              className="
                rounded-[1.3rem]
                border
                border-red-200
                bg-red-50/70
                p-4

                sm:p-5
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-red-600
                    ring-1
                    ring-red-100
                  "
                >
                  <CancelOutlinedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </span>

                <div>
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-red-500
                    "
                  >
                    Cancelled
                  </p>

                  <h2
                    className="
                      mt-0.5
                      text-sm
                      font-bold
                      text-red-900
                    "
                  >
                    Cancellation reason
                  </h2>
                </div>
              </div>

              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-red-700

                  sm:text-sm
                  sm:leading-6
                "
              >
                {order.cancellationReason}
              </p>

              <p
                className="
                  mt-3
                  text-[0.65rem]
                  font-medium
                  text-red-500

                  sm:text-xs
                "
              >
                Cancelled on {formatDate(order.cancelledAt)}
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* =====================================================
          STATUS DIALOG
      ===================================================== */}
      {statusDialog.open && (
        <OrderStatusDialog
          key={statusDialog.key}
          open
          currentStatus={order.status}
          allowedStatuses={nextStatuses}
          isSubmitting={mutationKey === "status"}
          onClose={() =>
            setStatusDialog((currentState) => ({
              ...currentState,
              open: false,
            }))
          }
          onSubmit={handleStatusSubmit}
        />
      )}

      {/* =====================================================
          PAYMENT DIALOG
      ===================================================== */}
      {paymentDialog.open && (
        <PaymentStatusDialog
          key={paymentDialog.key}
          open
          currentStatus={order.paymentStatus}
          allowedStatuses={nextPaymentStatuses}
          isSubmitting={mutationKey === "payment"}
          onClose={() =>
            setPaymentDialog((currentState) => ({
              ...currentState,
              open: false,
            }))
          }
          onSubmit={handlePaymentSubmit}
        />
      )}

      {/* =====================================================
          CANCEL DIALOG
      ===================================================== */}
      {cancelDialog.open && (
        <CancelOrderDialog
          key={cancelDialog.key}
          open
          orderNumber={order.orderNumber}
          isSubmitting={mutationKey === "cancel"}
          onClose={() =>
            setCancelDialog((currentState) => ({
              ...currentState,
              open: false,
            }))
          }
          onSubmit={handleCancelSubmit}
        />
      )}
    </section>
  );
}

export default AdminOrderManage;
