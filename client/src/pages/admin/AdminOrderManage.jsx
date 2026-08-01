import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SyncAltRoundedIcon from "@mui/icons-material/SyncAltRounded";
import { toast } from "react-toastify";
import AdminOrderNoteEditor from "../../components/admin/orders/AdminOrderNoteEditor.jsx";
import AdminOrderStatusBadge from "../../components/admin/orders/AdminOrderStatusBadge.jsx";
import AdminPaymentStatusBadge from "../../components/admin/orders/AdminPaymentStatusBadge.jsx";
import CancelOrderDialog from "../../components/admin/orders/CancelOrderDialog.jsx";
import OrderStatusDialog from "../../components/admin/orders/OrderStatusDialog.jsx";
import PaymentStatusDialog from "../../components/admin/orders/PaymentStatusDialog.jsx";
import {
  cancelAdminOrder,
  fetchAdminOrder,
  updateAdminOrderNote,
  updateAdminOrderPayment,
  updateAdminOrderStatus,
} from "../../services/adminOrderApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import {
  canCancelOrder,
  formatOrderStatus,
  getNextOrderStatuses,
  getNextPaymentStatuses,
} from "../../utils/adminOrderWorkflow.js";

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

  async function handleNoteSubmit(adminNote) {
    await runMutation(
      "note",
      () => updateAdminOrderNote(orderId, adminNote),
      "Admin note updated.",
    );
  }

  if (isLoading) {
    return (
      <section>
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="h-[42rem] animate-pulse rounded-2xl bg-gray-100" />

          <div className="h-[34rem] animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </section>
    );
  }

  if (orderState.error) {
    const notFound = orderState.error?.response?.status === 404;

    return (
      <section className="py-16 text-center">
        <ErrorOutlineRoundedIcon
          className={notFound ? "text-gray-400" : "text-red-500"}
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          {notFound ? "Order not found" : "Order could not be loaded"}
        </h1>

        <p className="mt-3 text-gray-600">
          {getApiErrorMessage(
            orderState.error,
            notFound
              ? "The requested order does not exist."
              : "Unable to load this order.",
          )}
        </p>

        <div className="mt-7 flex justify-center gap-3">
          {!notFound && (
            <button
              type="button"
              onClick={() => setReloadToken((currentValue) => currentValue + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white"
            >
              <RefreshRoundedIcon />
              Try again
            </button>
          )}

          <Link
            to="/admin/orders"
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
          >
            Back to orders
          </Link>
        </div>
      </section>
    );
  }

  const order = orderState.order;

  const nextStatuses = getNextOrderStatuses(order.status);

  const nextPaymentStatuses = getNextPaymentStatuses(order.paymentStatus);

  const orderCanBeCancelled = canCancelOrder(order.status);

  return (
    <section>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        Back to orders
      </Link>

      <header className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-gray-500">Order number</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-gray-600">
            Placed on {formatDate(order.createdAt)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <AdminOrderStatusBadge status={order.status} />

            <AdminPaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {nextStatuses.length > 0 && (
            <button
              type="button"
              onClick={openStatusDialog}
              disabled={Boolean(mutationKey)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              <SyncAltRoundedIcon />
              Update status
            </button>
          )}

          {orderCanBeCancelled && (
            <button
              type="button"
              onClick={openCancelDialog}
              disabled={Boolean(mutationKey)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <CancelOutlinedIcon />
              Cancel order
            </button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
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

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
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
                      <span className="mt-2 h-full min-h-14 w-px bg-gray-300" />
                    )}
                  </div>

                  <div className="pb-3">
                    <p className="font-bold text-gray-950">
                      {formatOrderStatus(historyItem.toStatus)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(historyItem.createdAt)}
                    </p>

                    {historyItem.changedBy && (
                      <p className="mt-1 text-xs text-gray-500">
                        Updated by {historyItem.changedBy.fullName}
                      </p>
                    )}

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

          <AdminOrderNoteEditor
            key={order.updatedAt}
            initialNote={order.adminNote}
            isSubmitting={mutationKey === "note"}
            onSubmit={handleNoteSubmit}
          />
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
                  -$
                  {order.discountAmount}
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

            <div className="mt-3">
              <AdminPaymentStatusBadge status={order.paymentStatus} />
            </div>

            {nextPaymentStatuses.length > 0 && (
              <button
                type="button"
                onClick={openPaymentDialog}
                disabled={Boolean(mutationKey)}
                className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
              >
                Update payment
              </button>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <PersonOutlineRoundedIcon className="text-gray-600" />

              <h2 className="font-bold text-gray-950">Customer</h2>
            </div>

            <p className="mt-4 font-semibold text-gray-800">
              {order.customerName}
            </p>

            <p className="mt-1 break-all text-sm text-gray-600">
              {order.customerEmail}
            </p>

            <p className="mt-1 text-sm text-gray-600">{order.customerPhone}</p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LocalShippingOutlinedIcon className="text-gray-600" />

              <h2 className="font-bold text-gray-950">Delivery</h2>
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
                Address notes: {order.deliveryNotes}
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

              <p className="mt-3 text-xs text-red-600">
                Cancelled on {formatDate(order.cancelledAt)}
              </p>
            </section>
          )}
        </aside>
      </div>

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
