import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import AdminOrderStatusBadge from "../orders/AdminOrderStatusBadge.jsx";
import AdminPaymentStatusBadge from "../orders/AdminPaymentStatusBadge.jsx";
import formatCurrency from "../../../utils/formatCurrency.js";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DashboardRecentOrders({ orders }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-gray-950">Recent orders</h2>

          <p className="mt-1 text-sm text-gray-500">
            The latest customer orders.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="text-sm font-semibold text-gray-700 hover:text-gray-950"
        >
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No orders have been placed yet.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Total
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-950">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {order.customer.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.customer.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <AdminOrderStatusBadge status={order.status} />
                    </td>

                    <td className="px-5 py-4">
                      <AdminPaymentStatusBadge status={order.paymentStatus} />
                    </td>

                    <td className="px-5 py-4 font-bold text-gray-950">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        aria-label={`View order ${order.orderNumber}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-gray-600 hover:border-gray-950 hover:text-gray-950"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-gray-100 lg:hidden">
            {orders.map((order) => (
              <article key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-950">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.customer.name}
                    </p>
                  </div>

                  <p className="font-bold text-gray-950">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminOrderStatusBadge status={order.status} />

                  <AdminPaymentStatusBadge status={order.paymentStatus} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>

                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-sm font-semibold text-gray-950"
                  >
                    View order
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardRecentOrders;
