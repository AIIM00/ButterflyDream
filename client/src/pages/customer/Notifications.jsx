import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

//Context and hooks
import useNotifications from "../../context/notification/useNotifications.js";
//Services
import { fetchCustomerNotifications } from "../../services/notificationApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

//React Toastify
import { toast } from "react-toastify";

//Components
import ClearReadNotificationsDialog from "../../components/notifications/ClearReadNotificationsDialog.jsx";
import CustomerNotificationCard from "../../components/notifications/CustomerNotificationCard.jsx";

// MUI Icons
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const NOTIFICATION_STATUS_OPTIONS = [
  {
    value: "all",
    label: "All notifications",
  },
  {
    value: "unread",
    label: "Unread",
  },
  {
    value: "read",
    label: "Read",
  },
];

const NOTIFICATION_TYPE_OPTIONS = [
  {
    value: "",
    label: "All types",
  },
  {
    value: "ORDER_PLACED",
    label: "Order placed",
  },
  {
    value: "ORDER_CONFIRMED",
    label: "Order confirmed",
  },
  {
    value: "ORDER_STATUS_CHANGED",
    label: "Order updates",
  },
  {
    value: "ORDER_CANCELLED",
    label: "Cancelled orders",
  },
  {
    value: "ORDER_DELIVERED",
    label: "Delivered orders",
  },
  {
    value: "SYSTEM",
    label: "System",
  },
];

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function Notifications() {
  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    unreadCount,
    mutationKey,
    applyUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearReadNotifications,
  } = useNotifications();

  const [reloadToken, setReloadToken] = useState(0);

  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const page = Number(searchParams.get("page")) || 1;

  const status = searchParams.get("status") ?? "all";

  const type = searchParams.get("type") ?? "";

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        page,
        status,
        type,
        reloadToken,
      }),
    [page, status, type, reloadToken],
  );

  const [notificationState, setNotificationState] = useState({
    requestKey: null,
    notifications: [],
    pagination: null,
    error: null,
  });

  const isLoading = notificationState.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    async function loadNotifications() {
      try {
        const response = await fetchCustomerNotifications(
          {
            page,
            limit: 20,
            status,
            type: type || undefined,
          },
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setNotificationState({
          requestKey,
          notifications: response.notifications ?? [],
          pagination: response.pagination ?? null,
          error: null,
        });

        applyUnreadCount(response.unreadCount);
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

        setNotificationState({
          requestKey,
          notifications: [],
          pagination: null,
          error,
        });
      }
    }

    void loadNotifications();

    return () => {
      controller.abort();
    };
  }, [
    applyUnreadCount,
    location.pathname,
    location.search,
    navigate,
    page,
    requestKey,
    status,
    type,
  ]);

  function updateFilters(updates) {
    const nextParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (key === "status" && value === "all")
      ) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    }

    setSearchParams(nextParams);
  }

  function reloadNotifications() {
    setReloadToken((currentValue) => currentValue + 1);
  }

  async function handleMarkRead(notification) {
    try {
      const response = await markAsRead(notification.id);

      toast.success(response.message ?? "Notification marked as read.");

      reloadNotifications();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to mark notification as read."),
      );
    }
  }

  async function handleMarkAllRead() {
    try {
      const response = await markAllAsRead();

      toast.success(response.message ?? "All notifications marked as read.");

      reloadNotifications();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to mark notifications as read."),
      );
    }
  }

  async function handleDelete(notification) {
    try {
      const response = await removeNotification(notification.id);

      toast.success(response.message ?? "Notification deleted.");

      reloadNotifications();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete notification."));
    }
  }

  async function handleClearRead() {
    try {
      const response = await clearReadNotifications();

      toast.success(response.message ?? "Read notifications cleared.");

      setClearDialogOpen(false);

      reloadNotifications();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to clear read notifications."),
      );
    }
  }

  async function handleOpenOrder(notification) {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch {
        // Order navigation should still remain available.
      }
    }

    navigate(`/orders/${notification.order.id}`);
  }

  const hasFilters = status !== "all" || Boolean(type);

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Customer account
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            Notifications
          </h1>

          <p className="mt-3 text-gray-600">
            {unreadCount} unread{" "}
            {unreadCount === 1 ? "notification" : "notifications"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0 || Boolean(mutationKey)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <DoneAllRoundedIcon fontSize="small" />

            {mutationKey === "read-all" ? "Updating..." : "Mark all read"}
          </button>

          <button
            type="button"
            onClick={() => setClearDialogOpen(true)}
            disabled={Boolean(mutationKey)}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
          >
            Clear read
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <label>
          <span className="text-sm font-semibold text-gray-700">
            Read status
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
            {NOTIFICATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-semibold text-gray-700">
            Notification type
          </span>

          <select
            value={type}
            onChange={(event) =>
              updateFilters({
                type: event.target.value,
                page: 1,
              })
            }
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
          >
            {NOTIFICATION_TYPE_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setSearchParams(new URLSearchParams())}
            disabled={!hasFilters}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FilterAltOffOutlinedIcon />
            Clear filters
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 space-y-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {!isLoading && notificationState.error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{
              fontSize: 56,
            }}
          />

          <h2 className="mt-4 text-2xl font-bold text-red-900">
            Notifications could not be loaded
          </h2>

          <p className="mt-2 text-red-700">
            {getApiErrorMessage(
              notificationState.error,
              "Unable to load notifications.",
            )}
          </p>

          <button
            type="button"
            onClick={reloadNotifications}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white"
          >
            <RefreshRoundedIcon />
            Try again
          </button>
        </div>
      )}

      {!isLoading &&
        !notificationState.error &&
        notificationState.notifications.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
            <NotificationsNoneRoundedIcon
              className="text-gray-400"
              sx={{
                fontSize: 64,
              }}
            />

            <h2 className="mt-5 text-2xl font-bold text-gray-950">
              No notifications found
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-gray-600">
              Order confirmations, delivery updates, and other account
              notifications will appear here.
            </p>

            <Link
              to="/orders"
              className="mt-7 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
            >
              View my orders
            </Link>
          </div>
        )}

      {!isLoading &&
        !notificationState.error &&
        notificationState.notifications.length > 0 && (
          <div className="mt-8 space-y-4">
            {notificationState.notifications.map((notification) => (
              <CustomerNotificationCard
                key={notification.id}
                notification={notification}
                mutationKey={mutationKey}
                onMarkRead={(selectedNotification) =>
                  void handleMarkRead(selectedNotification)
                }
                onDelete={(selectedNotification) =>
                  void handleDelete(selectedNotification)
                }
                onOpenOrder={(selectedNotification) =>
                  void handleOpenOrder(selectedNotification)
                }
              />
            ))}
          </div>
        )}

      {!isLoading &&
        notificationState.pagination &&
        notificationState.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  page: page - 1,
                })
              }
              disabled={!notificationState.pagination.hasPreviousPage}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-gray-600">
              Page {page} of {notificationState.pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFilters({
                  page: page + 1,
                })
              }
              disabled={!notificationState.pagination.hasNextPage}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

      <ClearReadNotificationsDialog
        open={clearDialogOpen}
        isSubmitting={mutationKey === "clear-read"}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={() => void handleClearRead()}
      />
    </section>
  );
}

export default Notifications;
