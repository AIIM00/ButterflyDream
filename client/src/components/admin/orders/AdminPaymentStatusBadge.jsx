import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

const statusClasses = {
  UNPAID: "bg-amber-100 text-amber-800",

  PAID: "bg-green-100 text-green-800",

  FAILED: "bg-red-100 text-red-800",

  REFUNDED: "bg-gray-200 text-gray-800",
};

function AdminPaymentStatusBadge({ status }) {
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

export default AdminPaymentStatusBadge;
