import { Link, useLocation, useParams } from "react-router-dom";

// MUI Icons
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

/* =========================================================
   HELPERS
========================================================= */

function formatStatus(status) {
  if (!status) {
    return "Confirmed";
  }

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* =========================================================
   ORDER SUCCESS
========================================================= */

function OrderSuccess() {
  const { orderId } = useParams();

  const location = useLocation();

  const order = location.state?.order ?? null;

  const orderNumber = order?.orderNumber ?? orderId;

  return (
    <section
      className="
        min-h-screen

        bg-brand-page

        px-4
        py-10

        text-brand-text

        sm:px-6
        sm:py-14

        lg:py-20
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
        "
      >
        {/* ==================================================
            SUCCESS HERO
        ================================================== */}

        <div
          className="
            relative

            overflow-hidden

            rounded-[2rem]

            bg-brand-dark-surface

            px-5
            py-9

            text-center

            text-brand-surface

            shadow-[0_20px_60px_rgba(0,0,0,0.10)]

            sm:px-8
            sm:py-12
          "
        >
          {/* DECORATIVE RINGS */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -right-20
              -top-20

              h-52
              w-52

              rounded-full

              border
              border-brand-accent-fill/20
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -bottom-24
              -left-20

              h-56
              w-56

              rounded-full

              border
              border-brand-accent-fill/10
            "
          />

          <div className="relative z-10">
            {/* SUCCESS ICON */}

            <span
              className="
                mx-auto

                inline-flex
                h-20
                w-20

                items-center
                justify-center

                rounded-full

                border
                border-brand-success/25

                bg-brand-success/10

                text-brand-success
              "
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 46,
                }}
              />
            </span>

            <p
              className="
                mt-6

                text-[0.6rem]
                font-bold
                uppercase

                tracking-[0.22em]

                text-brand-accent-fill
              "
            >
              Order confirmed
            </p>

            <h1
              className="
                mx-auto
                mt-3
                max-w-xl

                font-display

                text-[2.5rem]
                font-medium

                leading-[0.95]

                tracking-[-0.045em]

                text-brand-surface

                sm:text-5xl
              "
            >
              Thank you
              <span
                className="
                  block
                  italic
                "
              >
                for your order.
              </span>
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl

                text-sm
                leading-7

                text-brand-surface/65

                sm:text-base
              "
            >
              Your Butterfly Dream order was placed successfully. We’ll review
              it and prepare your pieces for delivery.
            </p>

            {/* ORDER NUMBER */}

            <div
              className="
                mx-auto
                mt-8
                max-w-md

                rounded-[1.25rem]

                border
                border-brand-surface/10

                bg-brand-surface/5

                px-5
                py-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-center

                  gap-2
                "
              >
                <ReceiptLongOutlinedIcon
                  className="
                    text-brand-accent-fill
                  "
                  sx={{
                    fontSize: 18,
                  }}
                />

                <p
                  className="
                    text-[0.6rem]
                    font-bold
                    uppercase

                    tracking-[0.16em]

                    text-brand-surface/50
                  "
                >
                  Order number
                </p>
              </div>

              <p
                className="
                  mt-2

                  break-all

                  font-display

                  text-xl
                  font-medium

                  tracking-[-0.02em]

                  text-brand-surface

                  sm:text-2xl
                "
              >
                {orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ORDER INFORMATION
        ================================================== */}

        {order && (
          <div
            className="
              mt-5

              grid

              gap-4

              sm:grid-cols-2
            "
          >
            {/* PAYMENT */}

            <section
              className="
                rounded-[1.5rem]

                border
                border-brand-border

                bg-brand-surface

                p-5
              "
            >
              <div
                className="
                  flex
                  items-center

                  gap-3
                "
              >
                <span
                  className="
                    inline-flex
                    h-11
                    w-11
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-accent-soft

                    text-brand-accent-text
                  "
                >
                  <PaymentOutlinedIcon
                    sx={{
                      fontSize: 20,
                    }}
                  />
                </span>

                <div>
                  <p
                    className="
                      text-[0.56rem]
                      font-bold
                      uppercase

                      tracking-[0.15em]

                      text-brand-accent-text
                    "
                  >
                    Payment
                  </p>

                  <p
                    className="
                      mt-1

                      font-display

                      text-lg
                      font-medium

                      text-brand-text
                    "
                  >
                    Cash on delivery
                  </p>
                </div>
              </div>
            </section>

            {/* STATUS */}

            <section
              className="
                rounded-[1.5rem]

                border
                border-brand-border

                bg-brand-surface

                p-5
              "
            >
              <div
                className="
                  flex
                  items-center

                  gap-3
                "
              >
                <span
                  className="
                    inline-flex
                    h-11
                    w-11
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-success/10

                    text-brand-success
                  "
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      fontSize: 20,
                    }}
                  />
                </span>

                <div>
                  <p
                    className="
                      text-[0.56rem]
                      font-bold
                      uppercase

                      tracking-[0.15em]

                      text-brand-accent-text
                    "
                  >
                    Order status
                  </p>

                  <p
                    className="
                      mt-1

                      font-display

                      text-lg
                      font-medium

                      text-brand-text
                    "
                  >
                    {formatStatus(order.status)}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================
            DELIVERY
        ================================================== */}

        {order && (
          <section
            className="
              mt-4

              rounded-[1.5rem]

              border
              border-brand-border

              bg-brand-surface

              p-5

              sm:p-6
            "
          >
            <div
              className="
                flex
                items-center

                gap-3
              "
            >
              <span
                className="
                  inline-flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  text-brand-accent-text
                "
              >
                <LocalShippingOutlinedIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </span>

              <div>
                <p
                  className="
                    text-[0.56rem]
                    font-bold
                    uppercase

                    tracking-[0.15em]

                    text-brand-accent-text
                  "
                >
                  Delivery
                </p>

                <h2
                  className="
                    mt-0.5

                    font-display

                    text-xl
                    font-medium

                    tracking-[-0.02em]

                    text-brand-text
                  "
                >
                  Delivery details
                </h2>
              </div>
            </div>

            <div
              className="
                mt-5

                rounded-[1.1rem]

                bg-brand-surface-soft

                px-4
                py-4
              "
            >
              <p
                className="
                  font-semibold

                  text-brand-text
                "
              >
                {order.deliveryRecipientName}
              </p>

              <p
                className="
                  mt-1

                  text-sm

                  text-brand-text-muted
                "
              >
                {order.deliveryPhone}
              </p>

              <p
                className="
                  mt-4

                  text-sm
                  leading-6

                  text-brand-text-muted
                "
              >
                {order.deliveryStreet}
                {order.deliveryBuilding ? `, ${order.deliveryBuilding}` : ""}
                {order.deliveryFloor ? `, Floor ${order.deliveryFloor}` : ""}
                <br />
                {order.deliveryCity}, {order.deliveryGovernorate}
              </p>
            </div>
          </section>
        )}

        {/* ==================================================
            TOTAL
        ================================================== */}

        {order && (
          <section
            className="
              mt-4

              flex
              items-end
              justify-between

              gap-5

              rounded-[1.5rem]

              border
              border-brand-border

              bg-brand-surface-soft

              px-5
              py-5

              sm:px-6
            "
          >
            <div>
              <p
                className="
                  text-[0.58rem]
                  font-bold
                  uppercase

                  tracking-[0.15em]

                  text-brand-accent-text
                "
              >
                Order total
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-brand-text-muted
                "
              >
                Payable on delivery
              </p>
            </div>

            <span
              className="
                shrink-0

                font-display

                text-3xl
                font-medium

                tracking-[-0.04em]

                text-brand-text

                sm:text-4xl
              "
            >
              ${order.totalAmount}
            </span>
          </section>
        )}

        {/* ==================================================
            NEXT STEP
        ================================================== */}

        <div
          className="
            mt-5

            rounded-[1.5rem]

            border
            border-brand-border

            bg-brand-surface

            px-5
            py-5

            text-center

            sm:px-6
          "
        >
          <p
            className="
              text-[0.58rem]
              font-bold
              uppercase

              tracking-[0.18em]

              text-brand-accent-text
            "
          >
            What happens next?
          </p>

          <p
            className="
              mx-auto
              mt-2
              max-w-lg

              text-sm
              leading-6

              text-brand-text-muted
            "
          >
            You can follow your order status anytime from My Orders while your
            pieces are prepared for delivery.
          </p>
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            mt-6

            flex
            flex-col

            gap-3

            sm:flex-row
            sm:justify-center
          "
        >
          <Link
            to="/orders"
            className="
              group

              inline-flex
              min-h-12

              items-center
              justify-center

              gap-2

              rounded-full

              bg-brand-primary

              px-6

              text-sm
              font-semibold

              text-brand-surface

              transition-all
              duration-200

              hover:bg-brand-primary-hover

              active:scale-[0.98]
            "
          >
            View my orders
            <ArrowForwardRoundedIcon
              className="
                transition-transform

                group-hover:translate-x-0.5
              "
              sx={{
                fontSize: 18,
              }}
            />
          </Link>

          <Link
            to="/products"
            className="
              inline-flex
              min-h-12

              items-center
              justify-center

              rounded-full

              border
              border-brand-border

              bg-brand-surface

              px-6

              text-sm
              font-semibold

              text-brand-text

              transition-all
              duration-200

              hover:border-brand-accent-fill/50
              hover:bg-brand-surface-soft

              active:scale-[0.98]
            "
          >
            Continue shopping
          </Link>
        </div>

        {/* ==================================================
            BRAND NOTE
        ================================================== */}

        <p
          className="
            mt-8

            text-center

            font-display

            text-sm
            italic

            text-brand-accent-text
          "
        >
          Jewelry made part of your story
        </p>
      </div>
    </section>
  );
}

export default OrderSuccess;
