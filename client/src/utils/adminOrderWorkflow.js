const ORDER_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED"],

  CONFIRMED: ["PROCESSING"],

  PROCESSING: ["READY_FOR_DELIVERY"],

  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],

  OUT_FOR_DELIVERY: ["DELIVERED"],

  DELIVERED: ["RETURNED"],

  CANCELLED: [],
  RETURNED: [],
};

const PAYMENT_STATUS_TRANSITIONS = {
  UNPAID: ["PAID", "FAILED"],

  FAILED: ["UNPAID", "PAID"],

  PAID: ["REFUNDED"],

  REFUNDED: [],
};

const CANCELLABLE_ORDER_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
]);

export const ADMIN_ORDER_STATUS_OPTIONS = [
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

export const ADMIN_PAYMENT_STATUS_OPTIONS = [
  "",
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export const ADMIN_ORDER_SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "total_desc",
    label: "Highest total",
  },
  {
    value: "total_asc",
    label: "Lowest total",
  },
];

export function formatOrderStatus(status) {
  if (!status) {
    return "All statuses";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getNextOrderStatuses(status) {
  return ORDER_STATUS_TRANSITIONS[status] ?? [];
}

export function getNextPaymentStatuses(status) {
  return PAYMENT_STATUS_TRANSITIONS[status] ?? [];
}

export function canCancelOrder(status) {
  return CANCELLABLE_ORDER_STATUSES.has(status);
}
