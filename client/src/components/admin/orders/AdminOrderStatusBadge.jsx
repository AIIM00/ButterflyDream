import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

const statusClasses = {
  PENDING: "bg-amber-100 text-amber-800",

  CONFIRMED: "bg-blue-100 text-blue-800",

  PROCESSING: "bg-indigo-100 text-indigo-800",

  READY_FOR_DELIVERY: "bg-purple-100 text-purple-800",

  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",

  DELIVERED: "bg-green-100 text-green-800",

  CANCELLED: "bg-red-100 text-red-800",

  RETURNED: "bg-gray-200 text-gray-800",
};

function AdminOrderStatusBadge({ status }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-bold",
        statusClasses[status] ?? "bg-gray-100 text-gray-700",
      ].join(" ")}
    >
      {formatOrderStatus(status)}
    </span>
  );
}

export default AdminOrderStatusBadge;
