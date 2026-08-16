import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

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

function DashboardRecentOrders({ orders = [] }) {
  return (
    <section
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white
        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.65rem]
              font-bold
              uppercase
              tracking-[0.14em]
              text-gray-400
            "
          >
            Orders
          </p>

          <h2
            className="
              mt-1
              text-lg
              font-bold
              tracking-[-0.025em]
              text-gray-950

              sm:text-xl
            "
          >
            Recent orders
          </h2>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
            "
          >
            The latest customer orders.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="
            inline-flex
            min-h-9
            shrink-0
            items-center
            justify-center
            gap-1
            rounded-full
            border
            border-gray-200
            bg-white
            px-3
            text-[0.68rem]
            font-bold
            text-gray-700

            transition-all

            hover:border-gray-950
            hover:bg-gray-950
            hover:text-white

            sm:min-h-10
            sm:px-4
            sm:text-xs
          "
        >
          View all
          <ArrowForwardRoundedIcon
            sx={{
              fontSize: 14,
            }}
          />
        </Link>
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}
      {orders.length === 0 ? (
        <div className="p-4 sm:p-5 lg:p-6">
          <div
            className="
              flex
              min-h-[12rem]
              flex-col
              items-center
              justify-center
              rounded-[1.1rem]
              border
              border-dashed
              border-gray-200
              bg-gray-50/60
              px-5
              py-8
              text-center
            "
          >
            <span
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-white
                text-gray-500
                shadow-sm
                ring-1
                ring-gray-200
              "
            >
              <ReceiptLongOutlinedIcon
                sx={{
                  fontSize: 22,
                }}
              />
            </span>

            <p
              className="
                mt-4
                text-sm
                font-bold
                text-gray-900

                sm:text-base
              "
            >
              No orders yet
            </p>

            <p
              className="
                mt-1
                max-w-sm
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              Customer orders will appear here once they start coming in.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* =================================================
              MOBILE + TABLET CARDS
          ================================================= */}
          <div
            className="
              divide-y
              divide-gray-100

              lg:hidden
            "
          >
            {orders.map((order) => (
              <article
                key={order.id}
                className="
                  px-4
                  py-4

                  transition-colors

                  hover:bg-gray-50/50

                  sm:px-5
                  sm:py-5
                "
              >
                {/* ORDER + TOTAL */}
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
                        text-[0.68rem]
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
                      text-base
                      font-bold
                      tracking-[-0.025em]
                      text-gray-950

                      sm:text-lg
                    "
                  >
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                </div>

                {/* CUSTOMER */}
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

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      font-semibold
                      text-gray-800

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
                        text-[0.68rem]
                        text-gray-400

                        sm:text-xs
                      "
                    >
                      {order.customer.email}
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <AdminOrderStatusBadge status={order.status} />

                  <AdminPaymentStatusBadge status={order.paymentStatus} />
                </div>

                {/* ACTION */}
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="
                    mt-4
                    inline-flex
                    min-h-10
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    rounded-full

                    border
                    border-gray-200

                    bg-white

                    px-4

                    text-xs
                    font-bold
                    text-gray-800

                    transition-all

                    hover:border-gray-950
                    hover:bg-gray-950
                    hover:text-white
                  "
                >
                  View order
                  <ArrowForwardRoundedIcon
                    sx={{
                      fontSize: 15,
                    }}
                  />
                </Link>
              </article>
            ))}
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}
          <div
            className="
              hidden
              overflow-x-auto

              lg:block
            "
          >
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
                        px-5
                        py-4

                        xl:px-6
                      "
                    >
                      <p
                        className="
                          whitespace-nowrap
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
                          whitespace-nowrap
                          text-xs
                          text-gray-400
                        "
                      >
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-5 py-4">
                      <p
                        className="
                          max-w-[13rem]
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
                            max-w-[13rem]
                            truncate
                            text-xs
                            text-gray-400
                          "
                        >
                          {order.customer.email}
                        </p>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <AdminOrderStatusBadge status={order.status} />
                    </td>

                    {/* PAYMENT */}
                    <td className="px-4 py-4">
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
                        text-gray-950
                      "
                    >
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>

                    {/* ACTION */}
                    <td
                      className="
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
        </>
      )}
    </section>
  );
}

export default DashboardRecentOrders;
