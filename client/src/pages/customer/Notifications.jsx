import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

// Context and hooks
import useNotifications from "../../context/notification/useNotifications.js";

// Services
import { fetchCustomerNotifications } from "../../services/notificationApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

// React Toastify
import { toast } from "react-toastify";

// Components
import ClearReadNotificationsDialog from "../../components/notifications/ClearReadNotificationsDialog.jsx";
import CustomerNotificationCard from "../../components/notifications/CustomerNotificationCard.jsx";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

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
    <section className="min-h-screen bg-brand-ivory">
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
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
        {/* PAGE HEADER */}
        <header
          className="
            flex
            flex-col
            gap-6

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div className="max-w-2xl">
            <Link
              to="/account"
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-brand-muted
                transition
                hover:text-brand-espresso
              "
            >
              <ArrowBackRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />
              Back to account
            </Link>

            <p
              className="
                mt-5
                text-[0.65rem]
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-bronze
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
                text-brand-espresso

                sm:text-5xl

                lg:text-6xl
              "
            >
              Notifications
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span
                className="
                  inline-flex
                  min-h-7
                  items-center
                  rounded-full
                  bg-brand-pale-champagne
                  px-3
                  text-xs
                  font-semibold
                  text-brand-bronze
                "
              >
                {unreadCount} unread
              </span>

              <p className="text-sm text-brand-muted">
                Keep up with your orders and account updates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0 || Boolean(mutationKey)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-brand-border
                bg-brand-surface
                px-4
                py-2.5
                text-xs
                font-semibold
                text-brand-espresso
                transition
                hover:border-brand-espresso
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <DoneAllRoundedIcon fontSize="small" />

              {mutationKey === "read-all" ? "Updating..." : "Mark all read"}
            </button>

            <button
              type="button"
              onClick={() => setClearDialogOpen(true)}
              disabled={Boolean(mutationKey)}
              className="
                rounded-full
                border
                border-brand-error/25
                px-4
                py-2.5
                text-xs
                font-semibold
                text-brand-error
                transition
                hover:bg-brand-error/10
                disabled:opacity-40
              "
            >
              Clear read
            </button>
          </div>
        </header>

        {/* FILTERS */}
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
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-brand-pale-champagne
                text-brand-bronze
              "
            >
              <TuneRoundedIcon fontSize="small" />
            </span>

            <div>
              <p
                className="
                  text-[0.6rem]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-brand-bronze
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
                  text-brand-espresso
                "
              >
                Find an update
              </h2>
            </div>
          </div>

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
            <label>
              <span
                className="
                  text-xs
                  font-semibold
                  text-brand-espresso
                "
              >
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
                className="
                  mt-2
                  w-full
                  rounded-[1rem]
                  border
                  border-brand-border
                  bg-brand-cream
                  px-4
                  py-3
                  text-sm
                  text-brand-espresso
                  outline-none
                  transition
                  focus:border-brand-bronze
                  focus:ring-2
                  focus:ring-brand-bronze/10
                "
              >
                {NOTIFICATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span
                className="
                  text-xs
                  font-semibold
                  text-brand-espresso
                "
              >
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
                className="
                  mt-2
                  w-full
                  rounded-[1rem]
                  border
                  border-brand-border
                  bg-brand-cream
                  px-4
                  py-3
                  text-sm
                  text-brand-espresso
                  outline-none
                  transition
                  focus:border-brand-bronze
                  focus:ring-2
                  focus:ring-brand-bronze/10
                "
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
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-brand-border
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-brand-muted
                  transition
                  hover:border-brand-espresso
                  hover:text-brand-espresso
                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  lg:w-auto
                "
              >
                <FilterAltOffOutlinedIcon fontSize="small" />
                Clear filters
              </button>
            </div>
          </div>
        </section>

        {/* LOADING */}
        {isLoading && (
          <div className="mt-6 space-y-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="
                    h-44
                    animate-pulse
                    rounded-[1.5rem]
                    border
                    border-brand-border
                    bg-brand-cream
                  "
              />
            ))}
          </div>
        )}

        {/* ERROR */}
        {!isLoading && notificationState.error && (
          <div
            className="
                mt-6
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
                  text-brand-espresso
                "
            >
              Notifications could not be loaded.
            </h2>

            <p
              className="
                  mx-auto
                  mt-3
                  max-w-lg
                  text-sm
                  leading-7
                  text-brand-muted
                "
            >
              {getApiErrorMessage(
                notificationState.error,
                "Unable to load notifications.",
              )}
            </p>

            <button
              type="button"
              onClick={reloadNotifications}
              className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-brand-espresso
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-brand-emerald
                "
            >
              <RefreshRoundedIcon fontSize="small" />
              Try again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading &&
          !notificationState.error &&
          notificationState.notifications.length === 0 && (
            <div
              className="
                mt-6
                overflow-hidden
                rounded-[1.75rem]
                border
                border-dashed
                border-brand-border
                bg-brand-cream
                px-6
                py-14
                text-center

                sm:py-16
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
                  bg-brand-surface
                  text-brand-bronze
                  shadow-sm
                "
              >
                <NotificationsNoneRoundedIcon
                  sx={{
                    fontSize: 31,
                  }}
                />
              </span>

              <p
                className="
                  mt-6
                  text-[0.62rem]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-brand-bronze
                "
              >
                All caught up
              </p>

              <h2
                className="
                  mt-2
                  font-display
                  text-3xl
                  font-medium
                  tracking-[-0.035em]
                  text-brand-espresso

                  sm:text-4xl
                "
              >
                No notifications found.
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-lg
                  text-sm
                  leading-7
                  text-brand-muted
                "
              >
                Order confirmations, delivery updates, and important account
                messages will appear here.
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-brand-espresso
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-brand-espresso
                    transition
                    hover:bg-brand-espresso
                    hover:text-white
                  "
                >
                  <FilterAltOffOutlinedIcon fontSize="small" />
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/orders"
                  className="
                    mt-7
                    inline-flex
                    rounded-full
                    bg-brand-espresso
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-brand-emerald
                  "
                >
                  View my orders
                </Link>
              )}
            </div>
          )}

        {/* NOTIFICATION LIST */}
        {!isLoading &&
          !notificationState.error &&
          notificationState.notifications.length > 0 && (
            <section className="mt-7">
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
                      text-[0.62rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-brand-bronze
                    "
                  >
                    Recent activity
                  </p>

                  <h2
                    className="
                      mt-1
                      font-display
                      text-2xl
                      font-medium
                      tracking-[-0.03em]
                      text-brand-espresso

                      sm:text-3xl
                    "
                  >
                    Your updates
                  </h2>
                </div>

                {notificationState.pagination?.total !== undefined && (
                  <span
                    className="
                      rounded-full
                      bg-brand-pale-champagne
                      px-3
                      py-1.5
                      text-[0.65rem]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-brand-bronze
                    "
                  >
                    {notificationState.pagination.total} total
                  </span>
                )}
              </div>

              <div className="space-y-3">
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
            </section>
          )}

        {/* PAGINATION */}
        {!isLoading &&
          notificationState.pagination &&
          notificationState.pagination.totalPages > 1 && (
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
                disabled={!notificationState.pagination.hasPreviousPage}
                className="
                  rounded-full
                  border
                  border-brand-border
                  bg-brand-surface
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-brand-espresso
                  transition
                  hover:border-brand-espresso
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              <span
                className="
                  rounded-full
                  bg-brand-pale-champagne
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-brand-bronze
                "
              >
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
                className="
                  rounded-full
                  border
                  border-brand-border
                  bg-brand-surface
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-brand-espresso
                  transition
                  hover:border-brand-espresso
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
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
      </div>
    </section>
  );
}

export default Notifications;
