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

/* =========================================================
   OPTIONS
========================================================= */

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
   NOTIFICATIONS
========================================================= */

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

  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

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

  /* =======================================================
     FILTERS
  ======================================================= */

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

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  /* =======================================================
     RELOAD
  ======================================================= */

  function reloadNotifications() {
    setReloadToken((currentValue) => currentValue + 1);
  }

  /* =======================================================
     MARK READ
  ======================================================= */

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

  /* =======================================================
     MARK ALL READ
  ======================================================= */

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

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(notification) {
    try {
      const response = await removeNotification(notification.id);

      toast.success(response.message ?? "Notification deleted.");

      reloadNotifications();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete notification."));
    }
  }

  /* =======================================================
     CLEAR READ
  ======================================================= */

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

  /* =======================================================
     OPEN ORDER
  ======================================================= */

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
        {/* ==================================================
            PAGE HEADER
        ================================================== */}

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
                min-h-9

                items-center
                justify-center

                gap-1

                rounded-full

                px-2

                text-xs
                font-semibold

                text-brand-text-muted

                transition-colors

                hover:text-brand-text
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
              Notifications
            </h1>

            <div
              className="
                mt-4

                flex
                flex-wrap

                items-center

                gap-3
              "
            >
              <span
                className="
                  inline-flex
                  min-h-7

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  px-3

                  text-xs
                  font-semibold

                  text-brand-accent-text
                "
              >
                {unreadCount} unread
              </span>

              <p
                className="
                  text-sm

                  text-brand-text-muted
                "
              >
                Keep up with your orders and account updates.
              </p>
            </div>
          </div>

          {/* ==============================================
              ACTIONS
          ============================================== */}

          <div
            className="
              flex
              flex-wrap

              gap-2
            "
          >
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0 || Boolean(mutationKey)}
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                gap-2

                rounded-full

                border
                border-brand-border

                bg-brand-surface

                px-4

                text-xs
                font-semibold

                text-brand-text

                transition-all
                duration-200

                hover:border-brand-accent-fill/40
                hover:bg-brand-surface-soft

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <DoneAllRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />

              {mutationKey === "read-all" ? "Updating..." : "Mark all read"}
            </button>

            <button
              type="button"
              onClick={() => setClearDialogOpen(true)}
              disabled={Boolean(mutationKey)}
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                rounded-full

                px-4

                text-xs
                font-semibold

                text-brand-text-muted

                transition-all
                duration-200

                hover:bg-brand-error/5
                hover:text-brand-error

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Clear read
            </button>
          </div>
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
              <TuneRoundedIcon
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
                Find an update
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
                {NOTIFICATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {/* TYPE */}

            <label>
              <span
                className="
                  text-[0.68rem]
                  font-semibold

                  text-brand-text
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
                {NOTIFICATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              mt-6

              space-y-3
            "
          >
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

                  bg-brand-surface-soft
                "
              />
            ))}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

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

                  text-brand-text
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

                  text-brand-text-muted
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
            EMPTY STATE
        ================================================== */}

        {!isLoading &&
          !notificationState.error &&
          notificationState.notifications.length === 0 && (
            <div
              className="
                relative

                mt-6

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
                  <NotificationsNoneRoundedIcon
                    sx={{
                      fontSize: 31,
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
                  All caught up
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
                  No notifications found.
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
                  Order confirmations, delivery updates, and important account
                  messages will appear here.
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

                      px-5

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
                    to="/orders"
                    className="
                      mt-7

                      inline-flex
                      min-h-11

                      items-center
                      justify-center

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
                    View my orders
                  </Link>
                )}
              </div>
            </div>
          )}

        {/* ==================================================
            NOTIFICATION LIST
        ================================================== */}

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
                      text-[0.6rem]
                      font-bold
                      uppercase

                      tracking-[0.18em]

                      text-brand-accent-text
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

                      text-brand-text

                      sm:text-3xl
                    "
                  >
                    Your updates
                  </h2>
                </div>

                {notificationState.pagination?.total !== undefined && (
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

        {/* ==================================================
            PAGINATION
        ================================================== */}

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

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          )}

        {/* ==================================================
            CLEAR READ DIALOG
        ================================================== */}

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
