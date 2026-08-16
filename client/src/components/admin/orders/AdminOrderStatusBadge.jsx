import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

const statusClasses = {
  PENDING: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200/80",
    dot: "bg-amber-500",
  },

  CONFIRMED: {
    badge: "bg-blue-50 text-blue-700 ring-blue-200/80",
    dot: "bg-blue-500",
  },

  PROCESSING: {
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200/80",
    dot: "bg-indigo-500",
  },

  READY_FOR_DELIVERY: {
    badge: "bg-purple-50 text-purple-700 ring-purple-200/80",
    dot: "bg-purple-500",
  },

  OUT_FOR_DELIVERY: {
    badge: "bg-cyan-50 text-cyan-700 ring-cyan-200/80",
    dot: "bg-cyan-500",
  },

  DELIVERED: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },

  CANCELLED: {
    badge: "bg-red-50 text-red-700 ring-red-200/80",
    dot: "bg-red-500",
  },

  RETURNED: {
    badge: "bg-gray-100 text-gray-700 ring-gray-200",
    dot: "bg-gray-500",
  },
};

const fallbackClasses = {
  badge: "bg-gray-50 text-gray-600 ring-gray-200",
  dot: "bg-gray-400",
};

function AdminOrderStatusBadge({ status }) {
  const classes = statusClasses[status] ?? fallbackClasses;

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

          sm:px-3
          sm:py-1.5
          sm:text-[0.68rem]
        `,
        classes.badge,
      ].join(" ")}
    >
      <span
        className={[
          `
            h-1.5
            w-1.5
            shrink-0
            rounded-full

            sm:h-2
            sm:w-2
          `,
          classes.dot,
        ].join(" ")}
      />

      <span className="truncate">{formatOrderStatus(status)}</span>
    </span>
  );
}

export default AdminOrderStatusBadge;
