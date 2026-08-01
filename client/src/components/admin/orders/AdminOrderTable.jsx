import { Link } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AdminOrderStatusBadge from "./AdminOrderStatusBadge.jsx";
import AdminPaymentStatusBadge from "./AdminPaymentStatusBadge.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminOrderTable({ orders }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Order
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Payment
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Total
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Placed
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-bold text-gray-950">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">
                      {order.customer.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.customer.email}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {order.customer.phone}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <AdminOrderStatusBadge status={order.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <AdminPaymentStatusBadge status={order.paymentStatus} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-bold text-gray-950">
                    ${order.totalAmount}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-gray-950">{order.orderNumber}</p>

                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <p className="text-lg font-bold text-gray-950">
                ${order.totalAmount}
              </p>
            </div>

            <div className="mt-4">
              <p className="font-semibold text-gray-900">
                {order.customer.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {order.customer.email}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <AdminOrderStatusBadge status={order.status} />

              <AdminPaymentStatusBadge status={order.paymentStatus} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </p>

              <Link
                to={`/admin/orders/${order.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <VisibilityOutlinedIcon fontSize="small" />
                View order
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default AdminOrderTable;
