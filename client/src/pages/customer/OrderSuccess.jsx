import { Link, useLocation, useParams } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";

function OrderSuccess() {
  const { orderId } = useParams();

  const location = useLocation();

  const order = location.state?.order ?? null;

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      <div className="rounded-3xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <CheckCircleRoundedIcon
          className="text-green-600"
          sx={{
            fontSize: 80,
          }}
        />

        <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
          Order confirmed
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          Thank you for your order
        </h1>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
          Your order was placed successfully. The store will review it and
          prepare it for delivery.
        </p>

        <div className="mt-8 rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">Order number</p>

          <p className="mt-2 break-all text-xl font-bold text-gray-950">
            {order?.orderNumber ?? orderId}
          </p>
        </div>

        {order && (
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <PaymentOutlinedIcon className="text-gray-600" />

                <div>
                  <p className="text-sm text-gray-500">Payment</p>

                  <p className="mt-1 font-bold text-gray-950">
                    Cash on delivery
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <LocalShippingOutlinedIcon className="text-gray-600" />

                <div>
                  <p className="text-sm text-gray-500">Order status</p>

                  <p className="mt-1 font-bold text-gray-950">{order.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {order && (
          <div className="mt-6 rounded-2xl border border-gray-200 p-5 text-left">
            <h2 className="font-bold text-gray-950">Delivery details</h2>

            <p className="mt-3 font-semibold text-gray-800">
              {order.deliveryRecipientName}
            </p>

            <p className="mt-1 text-sm text-gray-600">{order.deliveryPhone}</p>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {order.deliveryStreet}
              {order.deliveryBuilding ? `, ${order.deliveryBuilding}` : ""}
              {order.deliveryFloor ? `, Floor ${order.deliveryFloor}` : ""}
              <br />
              {order.deliveryCity}, {order.deliveryGovernorate}
            </p>
          </div>
        )}

        {order && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
            <span className="text-lg font-bold text-gray-950">Order total</span>

            <span className="text-2xl font-bold text-gray-950">
              ${order.totalAmount}
            </span>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            View my orders
          </Link>

          <Link
            to="/products"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-950"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;
