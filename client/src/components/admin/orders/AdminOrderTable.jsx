import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { Link } from "react-router-dom";

import AdminOrderStatusBadge from "./AdminOrderStatusBadge.jsx";
import AdminPaymentStatusBadge from "./AdminPaymentStatusBadge.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminOrderTable({ orders = [] }) {
  return (
    <>
      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}
      <div
        className="
          hidden
          overflow-hidden
          rounded-[1.4rem]
          border
          border-gray-200/80
          bg-white

          shadow-[0_8px_24px_rgba(15,23,42,0.04)]

          lg:block
        "
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* TABLE HEADER */}
            <thead>
              <tr
                className="
                  border-b
                  border-gray-100
                  bg-gray-50/70
                "
              >
                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400

                    xl:px-6
                  "
                >
                  Order
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-left
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400
                  "
                >
                  Customer
                </th>

                <th
                  className="
                    px-4
                    py-3.5
                    text-left
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400
                  "
                >
                  Status
                </th>

                <th
                  className="
                    px-4
                    py-3.5
                    text-left
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400
                  "
                >
                  Payment
                </th>

                <th
                  className="
                    px-4
                    py-3.5
                    text-left
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400
                  "
                >
                  Total
                </th>

                <th
                  className="
                    px-4
                    py-3.5
                    text-left
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400
                  "
                >
                  Placed
                </th>

                <th
                  className="
                    px-5
                    py-3.5
                    text-right
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400

                    xl:px-6
                  "
                >
                  Action
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="
                    transition-colors
                    hover:bg-gray-50/70
                  "
                >
                  {/* ORDER */}
                  <td
                    className="
                      whitespace-nowrap
                      px-5
                      py-4

                      xl:px-6
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-bold
                        text-gray-950
                      "
                    >
                      {order.orderNumber}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-400
                      "
                    >
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </td>

                  {/* CUSTOMER */}
                  <td className="px-5 py-4">
                    <p
                      className="
                        max-w-[14rem]
                        truncate
                        text-sm
                        font-semibold
                        text-gray-900
                      "
                    >
                      {order.customer?.name || "Customer"}
                    </p>

                    {order.customer?.email && (
                      <p
                        className="
                          mt-1
                          max-w-[14rem]
                          truncate
                          text-xs
                          text-gray-400
                        "
                      >
                        {order.customer.email}
                      </p>
                    )}

                    {order.customer?.phone && (
                      <p
                        className="
                          mt-1
                          text-[0.68rem]
                          text-gray-400
                        "
                      >
                        {order.customer.phone}
                      </p>
                    )}
                  </td>

                  {/* ORDER STATUS */}
                  <td className="whitespace-nowrap px-4 py-4">
                    <AdminOrderStatusBadge status={order.status} />
                  </td>

                  {/* PAYMENT STATUS */}
                  <td className="whitespace-nowrap px-4 py-4">
                    <AdminPaymentStatusBadge status={order.paymentStatus} />
                  </td>

                  {/* TOTAL */}
                  <td
                    className="
                      whitespace-nowrap
                      px-4
                      py-4
                      text-sm
                      font-bold
                      tracking-[-0.02em]
                      text-gray-950
                    "
                  >
                    ${order.totalAmount}
                  </td>

                  {/* DATE */}
                  <td
                    className="
                      whitespace-nowrap
                      px-4
                      py-4
                      text-xs
                      leading-5
                      text-gray-500
                    "
                  >
                    {formatDate(order.createdAt)}
                  </td>

                  {/* ACTION */}
                  <td
                    className="
                      whitespace-nowrap
                      px-5
                      py-4
                      text-right

                      xl:px-6
                    "
                  >
                    <Link
                      to={`/admin/orders/${order.id}`}
                      aria-label={`View order ${order.orderNumber}`}
                      className="
                        inline-flex
                        h-10
                        w-10
                        items-center
                        justify-center

                        rounded-xl

                        border
                        border-gray-200

                        bg-white
                        text-gray-500

                        transition-all

                        hover:border-gray-950
                        hover:bg-gray-950
                        hover:text-white
                      "
                    >
                      <VisibilityOutlinedIcon
                        sx={{
                          fontSize: 18,
                        }}
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MOBILE + TABLET
      ===================================================== */}
      <div
        className="
          space-y-3

          lg:hidden
        "
      >
        {orders.map((order) => (
          <article
            key={order.id}
            className="
              overflow-hidden
              rounded-[1.3rem]

              border
              border-gray-200/80

              bg-white

              shadow-[0_6px_20px_rgba(15,23,42,0.04)]
            "
          >
            {/* ===============================================
                MAIN ORDER INFORMATION
            =============================================== */}
            <div
              className="
                px-4
                py-4

                sm:px-5
                sm:py-5
              "
            >
              {/* ORDER NUMBER + TOTAL */}
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-bold
                      tracking-[-0.015em]
                      text-gray-950

                      sm:text-base
                    "
                  >
                    {order.orderNumber}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[0.67rem]
                      text-gray-400

                      sm:text-xs
                    "
                  >
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <p
                  className="
                    shrink-0
                    text-lg
                    font-bold
                    tracking-[-0.035em]
                    text-gray-950

                    sm:text-xl
                  "
                >
                  ${order.totalAmount}
                </p>
              </div>

              {/* =============================================
                  CUSTOMER
              ============================================= */}
              <div
                className="
                  mt-4
                  rounded-xl
                  bg-gray-50
                  px-3.5
                  py-3
                "
              >
                <p
                  className="
                    text-[0.6rem]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-gray-400
                  "
                >
                  Customer
                </p>

                <div
                  className="
                    mt-1
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-xs
                        font-semibold
                        text-gray-850

                        sm:text-sm
                      "
                    >
                      {order.customer?.name || "Customer"}
                    </p>

                    {order.customer?.email && (
                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[0.67rem]
                          text-gray-400

                          sm:text-xs
                        "
                      >
                        {order.customer.email}
                      </p>
                    )}

                    {order.customer?.phone && (
                      <p
                        className="
                          mt-0.5
                          text-[0.65rem]
                          text-gray-400

                          sm:text-xs
                        "
                      >
                        {order.customer.phone}
                      </p>
                    )}
                  </div>

                  {/* ITEM COUNT */}
                  <div
                    className="
                      shrink-0
                      text-right
                    "
                  >
                    <p
                      className="
                        text-[0.6rem]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-gray-400
                      "
                    >
                      Items
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-bold
                        text-gray-800
                      "
                    >
                      {order.itemCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* =============================================
                  STATUS
              ============================================= */}
              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <AdminOrderStatusBadge status={order.status} />

                <AdminPaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            {/* ===============================================
                ACTION
            =============================================== */}
            <Link
              to={`/admin/orders/${order.id}`}
              className="
                group
                flex
                min-h-12
                w-full
                items-center
                justify-between
                gap-3

                border-t
                border-gray-100

                bg-gray-50/60

                px-4

                text-xs
                font-bold
                text-gray-800

                transition-colors

                hover:bg-gray-950
                hover:text-white

                sm:px-5
              "
            >
              <span>View order details</span>

              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: 16,
                }}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}

export default AdminOrderTable;
