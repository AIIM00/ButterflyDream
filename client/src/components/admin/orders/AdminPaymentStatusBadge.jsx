import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

const statusClasses = {
  UNPAID: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200/80",
    dot: "bg-amber-500",
  },

  PAID: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },

  FAILED: {
    badge: "bg-red-50 text-red-700 ring-red-200/80",
    dot: "bg-red-500",
  },

  REFUNDED: {
    badge: "bg-gray-100 text-gray-700 ring-gray-200",
    dot: "bg-gray-500",
  },
};

const fallbackClasses = {
  badge: "bg-gray-50 text-gray-600 ring-gray-200",
  dot: "bg-gray-400",
};

function AdminPaymentStatusBadge({ status }) {
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

export default AdminPaymentStatusBadge;
