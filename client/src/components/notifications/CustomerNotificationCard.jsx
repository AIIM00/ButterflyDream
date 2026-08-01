import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getNotificationStyle(type) {
  switch (type) {
    case "ORDER_PLACED":
      return {
        Icon: ReceiptLongOutlinedIcon,

        iconClassName: "bg-blue-100 text-blue-700",
      };

    case "ORDER_CONFIRMED":
      return {
        Icon: CheckCircleOutlineRoundedIcon,

        iconClassName: "bg-green-100 text-green-700",
      };

    case "ORDER_DELIVERED":
      return {
        Icon: LocalShippingOutlinedIcon,

        iconClassName: "bg-green-100 text-green-700",
      };

    case "ORDER_CANCELLED":
      return {
        Icon: CancelOutlinedIcon,

        iconClassName: "bg-red-100 text-red-700",
      };

    case "SYSTEM":
      return {
        Icon: SettingsOutlinedIcon,

        iconClassName: "bg-gray-100 text-gray-700",
      };

    case "ORDER_STATUS_CHANGED":
    default:
      return {
        Icon: NotificationsOutlinedIcon,

        iconClassName: "bg-purple-100 text-purple-700",
      };
  }
}

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
      className={[
        "rounded-2xl border p-5 shadow-sm transition",
        notification.isRead
          ? "border-gray-200 bg-white"
          : "border-blue-200 bg-blue-50/40",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconClassName,
          ].join(" ")}
        >
          <Icon fontSize="small" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-gray-950">
                  {notification.title}
                </h2>

                {!notification.isRead && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    New
                  </span>
                )}
              </div>

              <p className="mt-2 leading-7 text-gray-600">
                {notification.message}
              </p>
            </div>

            <time className="shrink-0 text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </time>
          </div>

          {notification.order && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Related order
              </p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-gray-950">
                    {notification.order.orderNumber}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {notification.order.status} · {notification.order.currency}{" "}
                    {notification.order.totalAmount}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenOrder(notification)}
                  disabled={Boolean(mutationKey)}
                  className="rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  View order
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => onMarkRead(notification)}
                disabled={Boolean(mutationKey)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
              >
                {isMarkingRead ? "Updating..." : "Mark as read"}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(notification)}
              disabled={Boolean(mutationKey)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <DeleteOutlineRoundedIcon fontSize="small" />

              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CustomerNotificationCard;
