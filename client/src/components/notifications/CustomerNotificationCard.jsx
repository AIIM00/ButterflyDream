import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderStatus(status) {
  if (!status) {
    return "";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getNotificationStyle(type) {
  switch (type) {
    case "ORDER_PLACED":
      return {
        Icon: ReceiptLongOutlinedIcon,

        iconClassName: `
          bg-brand-accent-soft
          text-brand-accent-text
        `,
      };

    case "ORDER_CONFIRMED":
      return {
        Icon: CheckCircleOutlineRoundedIcon,

        iconClassName: `
          bg-brand-success/10
          text-brand-success
        `,
      };

    case "ORDER_DELIVERED":
      return {
        Icon: LocalShippingOutlinedIcon,

        iconClassName: `
          bg-brand-success/10
          text-brand-success
        `,
      };

    case "ORDER_CANCELLED":
      return {
        Icon: CancelOutlinedIcon,

        iconClassName: `
          bg-brand-error/10
          text-brand-error
        `,
      };

    case "SYSTEM":
      return {
        Icon: SettingsOutlinedIcon,

        iconClassName: `
          bg-brand-surface-soft
          text-brand-text-muted
        `,
      };

    case "ORDER_STATUS_CHANGED":
    default:
      return {
        Icon: NotificationsOutlinedIcon,

        iconClassName: `
          bg-brand-primary/5
          text-brand-primary
        `,
      };
  }
}

/* =========================================================
   NOTIFICATION CARD
========================================================= */

function CustomerNotificationCard({
  notification,
  mutationKey,
  onMarkRead,
  onDelete,
  onOpenOrder,
}) {
  const { Icon, iconClassName } = getNotificationStyle(notification.type);

  const isMarkingRead = mutationKey === `read:${notification.id}`;

  const isDeleting = mutationKey === `delete:${notification.id}`;

  return (
    <article
      className={`
        relative

        overflow-hidden

        rounded-[1.5rem]

        border

        p-4

        transition-all
        duration-200

        sm:p-5

        ${
          notification.isRead
            ? `
                border-brand-border
                bg-brand-surface
              `
            : `
                border-brand-accent-fill/30
                bg-brand-accent-soft/40

                shadow-[0_8px_24px_rgba(0,0,0,0.04)]
              `
        }
      `}
    >
      {/* ==================================================
          UNREAD ACCENT
      ================================================== */}

      {!notification.isRead && (
        <span
          aria-hidden="true"
          className="
            absolute
            bottom-4
            left-0
            top-4

            w-[3px]

            rounded-r-full

            bg-brand-accent-fill
          "
        />
      )}

      <div
        className="
          flex
          items-start

          gap-3.5

          sm:gap-4
        "
      >
        {/* ==================================================
            ICON
        ================================================== */}

        <span
          className={`
            inline-flex
            h-11
            w-11
            shrink-0

            items-center
            justify-center

            rounded-full

            ${iconClassName}
          `}
        >
          <Icon
            sx={{
              fontSize: 20,
            }}
          />
        </span>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-w-0 flex-1">
          {/* HEADER */}

          <div
            className="
              flex
              flex-col

              gap-2

              sm:flex-row
              sm:items-start
              sm:justify-between
              sm:gap-4
            "
          >
            <div className="min-w-0">
              <div
                className="
                  flex
                  flex-wrap
                  items-center

                  gap-2
                "
              >
                <h2
                  className="
                    font-display

                    text-[1.05rem]
                    font-medium

                    leading-tight

                    tracking-[-0.025em]

                    text-brand-text
                  "
                >
                  {notification.title}
                </h2>

                {!notification.isRead && (
                  <span
                    className="
                      inline-flex

                      items-center
                      justify-center

                      rounded-full

                      bg-brand-accent-fill

                      px-2
                      py-0.5

                      text-[0.52rem]
                      font-bold
                      uppercase

                      tracking-[0.1em]

                      text-brand-text
                    "
                  >
                    New
                  </span>
                )}
              </div>

              <p
                className="
                  mt-2

                  text-sm
                  leading-6

                  text-brand-text-muted
                "
              >
                {notification.message}
              </p>
            </div>

            {/* DATE */}

            <time
              dateTime={notification.createdAt}
              className="
                shrink-0

                text-[0.62rem]
                font-medium

                text-brand-text-muted
              "
            >
              {formatDate(notification.createdAt)}
            </time>
          </div>

          {/* ==================================================
              RELATED ORDER
          ================================================== */}

          {notification.order && (
            <div
              className="
                mt-4

                rounded-[1.15rem]

                border
                border-brand-border

                bg-brand-surface

                p-3.5

                sm:p-4
              "
            >
              <p
                className="
                  text-[0.55rem]
                  font-bold
                  uppercase

                  tracking-[0.16em]

                  text-brand-accent-text
                "
              >
                Related order
              </p>

              <div
                className="
                  mt-2.5

                  flex
                  flex-col

                  gap-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                {/* ORDER INFORMATION */}

                <div className="min-w-0">
                  <p
                    className="
                      truncate

                      font-display

                      text-[1.05rem]
                      font-medium

                      text-brand-text
                    "
                  >
                    {notification.order.orderNumber}
                  </p>

                  <div
                    className="
                      mt-1.5

                      flex
                      flex-wrap
                      items-center

                      gap-x-2
                      gap-y-1

                      text-xs

                      text-brand-text-muted
                    "
                  >
                    <span
                      className="
                        font-medium
                        text-brand-text
                      "
                    >
                      {formatOrderStatus(notification.order.status)}
                    </span>

                    <span
                      aria-hidden="true"
                      className="
                        h-1
                        w-1

                        rounded-full

                        bg-brand-border
                      "
                    />

                    <span>
                      {notification.order.currency}{" "}
                      {notification.order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* VIEW ORDER */}

                <button
                  type="button"
                  onClick={() => onOpenOrder(notification)}
                  disabled={Boolean(mutationKey)}
                  className="
                    inline-flex
                    min-h-10

                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-primary

                    px-5

                    text-xs
                    font-semibold

                    text-brand-surface

                    transition-all
                    duration-200

                    hover:bg-brand-primary-hover

                    active:scale-[0.97]

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-accent-fill/40

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  View order
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              mt-4

              flex
              flex-wrap
              items-center

              gap-2
            "
          >
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => onMarkRead(notification)}
                disabled={Boolean(mutationKey)}
                className="
                  inline-flex
                  min-h-10

                  items-center
                  justify-center

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

                  hover:border-brand-accent-fill/50
                  hover:bg-brand-surface-soft

                  active:scale-[0.97]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-accent-fill/35

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isMarkingRead ? "Updating..." : "Mark as read"}
              </button>
            )}

            {/* DELETE */}

            <button
              type="button"
              onClick={() => onDelete(notification)}
              disabled={Boolean(mutationKey)}
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                gap-1.5

                rounded-full

                px-3.5

                text-xs
                font-semibold

                text-brand-text-muted

                transition-all
                duration-200

                hover:bg-brand-error/5
                hover:text-brand-error

                active:scale-[0.97]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-error/25

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <DeleteOutlineRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />

              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CustomerNotificationCard;
