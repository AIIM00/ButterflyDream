import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import { Link } from "react-router-dom";

import formatCurrency from "../../../utils/formatCurrency.js";

function DashboardTopProducts({ products = [], currency }) {
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
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <p
          className="
            text-[0.65rem]
            font-bold
            uppercase
            tracking-[0.14em]
            text-gray-400
          "
        >
          Performance
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
          Top products
        </h2>

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-gray-500

            sm:text-sm
            sm:leading-6
          "
        >
          Ranked by units sold from paid orders.
        </p>
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}
      {products.length === 0 ? (
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
              <TrendingUpRoundedIcon
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
              No product ranking yet
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
              Product performance will appear once paid-order data becomes
              available.
            </p>
          </div>
        </div>
      ) : (
        /* ===================================================
           PRODUCT LIST
        =================================================== */
        <div className="divide-y divide-gray-100">
          {products.map((product, index) => (
            <Link
              key={product.productId}
              to={`/admin/products/${product.productId}`}
              className="
                group
                flex
                items-center
                gap-3

                px-4
                py-4

                transition-colors

                hover:bg-gray-50/70

                sm:gap-4
                sm:px-5
                sm:py-5

                lg:px-6
              "
            >
              {/* =============================================
                  IMAGE + RANK
              ============================================= */}
              <div className="relative shrink-0">
                <div
                  className="
                    h-16
                    w-16
                    overflow-hidden
                    rounded-[1rem]
                    bg-gray-100

                    ring-1
                    ring-gray-200/70

                    sm:h-[4.5rem]
                    sm:w-[4.5rem]
                  "
                >
                  {product.image?.imageUrl ? (
                    <img
                      src={product.image.imageUrl}
                      alt={product.image.altText || product.name}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover

                        transition-transform
                        duration-300

                        group-hover:scale-[1.04]
                      "
                    />
                  ) : (
                    <span
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        text-gray-400
                      "
                    >
                      <ImageNotSupportedOutlinedIcon
                        sx={{
                          fontSize: 21,
                        }}
                      />
                    </span>
                  )}
                </div>

                {/* RANK BADGE */}
                <span
                  className="
                    absolute
                    -left-1.5
                    -top-1.5

                    flex
                    h-6
                    min-w-6
                    items-center
                    justify-center

                    rounded-full

                    border-2
                    border-white

                    bg-gray-950

                    px-1

                    text-[0.65rem]
                    font-bold
                    text-white

                    shadow-sm
                  "
                >
                  {index + 1}
                </span>
              </div>

              {/* =============================================
                  PRODUCT INFORMATION
              ============================================= */}
              <div className="min-w-0 flex-1">
                <p
                  className="
                    line-clamp-2
                    text-sm
                    font-bold
                    leading-5
                    tracking-[-0.015em]
                    text-gray-950

                    sm:text-[0.95rem]
                  "
                >
                  {product.name}
                </p>

                <div
                  className="
                    mt-1.5
                    flex
                    flex-wrap
                    items-center
                    gap-x-2
                    gap-y-1
                  "
                >
                  <span
                    className="
                      text-[0.68rem]
                      font-medium
                      text-gray-500

                      sm:text-xs
                    "
                  >
                    {product.unitsSold}{" "}
                    {product.unitsSold === 1 ? "unit sold" : "units sold"}
                  </span>

                  <span
                    className="
                      hidden
                      h-1
                      w-1
                      rounded-full
                      bg-gray-300

                      sm:block
                    "
                  />

                  <span
                    className="
                      hidden
                      text-xs
                      text-gray-400

                      sm:inline
                    "
                  >
                    Paid orders
                  </span>
                </div>
              </div>

              {/* =============================================
                  REVENUE + ACTION
              ============================================= */}
              <div
                className="
                  flex
                  shrink-0
                  flex-col
                  items-end
                  justify-center
                  gap-1
                "
              >
                <p
                  className="
                    whitespace-nowrap
                    text-sm
                    font-bold
                    tracking-[-0.02em]
                    text-gray-950

                    sm:text-base
                  "
                >
                  {formatCurrency(product.revenue, currency)}
                </p>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-0.5

                    text-[0.62rem]
                    font-bold
                    text-gray-400

                    transition-colors

                    group-hover:text-gray-950

                    sm:text-[0.68rem]
                  "
                >
                  Manage
                  <ArrowForwardRoundedIcon
                    sx={{
                      fontSize: 13,
                    }}
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardTopProducts;
