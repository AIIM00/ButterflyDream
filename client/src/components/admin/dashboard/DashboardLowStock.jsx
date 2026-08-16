import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Link } from "react-router-dom";

function DashboardLowStock({
  items = [],
  lowStockCount = 0,
  outOfStockCount = 0,
}) {
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
        <div
          className="
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-start
            sm:justify-between
            sm:gap-6
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
              Inventory
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
              Inventory alerts
            </h2>

            <p
              className="
                mt-1.5
                max-w-xl
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
            >
              Variants that have reached or fallen below their low-stock
              threshold.
            </p>
          </div>

          {/* STATUS COUNTS */}
          <div className="flex flex-wrap gap-2">
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-amber-50
                px-3
                py-1.5
                text-[0.68rem]
                font-bold
                text-amber-700
                ring-1
                ring-inset
                ring-amber-200/70

                sm:text-xs
              "
            >
              <WarningAmberRoundedIcon
                sx={{
                  fontSize: 14,
                }}
              />
              {lowStockCount} low stock
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-red-50
                px-3
                py-1.5
                text-[0.68rem]
                font-bold
                text-red-700
                ring-1
                ring-inset
                ring-red-200/70

                sm:text-xs
              "
            >
              <ErrorOutlineOutlinedIcon
                sx={{
                  fontSize: 14,
                }}
              />
              {outOfStockCount} out of stock
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          HEALTHY INVENTORY
      ===================================================== */}
      {items.length === 0 ? (
        <div className="p-4 sm:p-5 lg:p-6">
          <div
            className="
              flex
              min-h-[11rem]
              flex-col
              items-center
              justify-center
              rounded-[1.1rem]
              border
              border-emerald-100
              bg-emerald-50/60
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
                text-emerald-600
                shadow-sm
                ring-1
                ring-emerald-100
              "
            >
              <Inventory2OutlinedIcon
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
                text-emerald-900

                sm:text-base
              "
            >
              Inventory levels look healthy
            </p>

            <p
              className="
                mt-1
                max-w-sm
                text-xs
                leading-5
                text-emerald-700/80

                sm:text-sm
              "
            >
              No product variants currently require your attention.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* =================================================
              MOBILE INVENTORY CARDS
          ================================================= */}
          <div
            className="
              space-y-3
              p-4

              sm:p-5

              md:hidden
            "
          >
            {items.map((item) => {
              const isOutOfStock = Number(item.stockQuantity ?? 0) === 0;

              return (
                <article
                  key={item.id}
                  className="
                    rounded-[1.1rem]
                    border
                    border-gray-200
                    bg-white
                    p-4
                    shadow-[0_4px_16px_rgba(15,23,42,0.035)]
                  "
                >
                  {/* PRODUCT + STOCK */}
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <div className="min-w-0">
                      <p
                        className="
                          line-clamp-2
                          text-sm
                          font-bold
                          leading-5
                          text-gray-950
                        "
                      >
                        {item.product.name}
                      </p>

                      {item.product.category?.name && (
                        <p
                          className="
                            mt-1
                            truncate
                            text-[0.68rem]
                            font-medium
                            text-gray-400
                          "
                        >
                          {item.product.category.name}
                        </p>
                      )}
                    </div>

                    <span
                      className={[
                        `
                          inline-flex
                          shrink-0
                          items-center
                          rounded-full
                          px-2.5
                          py-1
                          text-[0.65rem]
                          font-bold
                          ring-1
                          ring-inset
                        `,
                        isOutOfStock
                          ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200",
                      ].join(" ")}
                    >
                      {isOutOfStock
                        ? "Out of stock"
                        : `${item.stockQuantity} left`}
                    </span>
                  </div>

                  {/* VARIANT */}
                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-3
                      rounded-xl
                      bg-gray-50
                      p-3
                    "
                  >
                    <div className="min-w-0">
                      <p
                        className="
                          text-[0.6rem]
                          font-bold
                          uppercase
                          tracking-[0.1em]
                          text-gray-400
                        "
                      >
                        Variant
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-xs
                          font-semibold
                          text-gray-800
                        "
                      >
                        {item.variant.displayName}
                      </p>

                      {item.variant.sku && (
                        <p
                          className="
                            mt-0.5
                            truncate
                            text-[0.65rem]
                            text-gray-400
                          "
                        >
                          {item.variant.sku}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p
                        className="
                          text-[0.6rem]
                          font-bold
                          uppercase
                          tracking-[0.1em]
                          text-gray-400
                        "
                      >
                        Threshold
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          font-semibold
                          text-gray-800
                        "
                      >
                        {item.lowStockThreshold}
                      </p>
                    </div>
                  </div>

                  {/* ACTION */}
                  <Link
                    to={`/admin/products/${item.product.id}`}
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
                    Manage product
                    <ArrowForwardRoundedIcon
                      sx={{
                        fontSize: 15,
                      }}
                    />
                  </Link>
                </article>
              );
            })}
          </div>

          {/* =================================================
              DESKTOP / TABLET TABLE
          ================================================= */}
          <div
            className="
              hidden
              overflow-x-auto

              md:block
            "
          >
            <table className="min-w-full">
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

                      lg:px-6
                    "
                  >
                    Product
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
                    Variant
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
                    Stock
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
                    Threshold
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

                      lg:px-6
                    "
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isOutOfStock = Number(item.stockQuantity ?? 0) === 0;

                  return (
                    <tr
                      key={item.id}
                      className="
                        transition-colors
                        hover:bg-gray-50/70
                      "
                    >
                      {/* PRODUCT */}
                      <td
                        className="
                          px-5
                          py-4

                          lg:px-6
                        "
                      >
                        <p
                          className="
                            max-w-[15rem]
                            truncate
                            text-sm
                            font-bold
                            text-gray-950
                          "
                        >
                          {item.product.name}
                        </p>

                        {item.product.category?.name && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-400
                            "
                          >
                            {item.product.category.name}
                          </p>
                        )}
                      </td>

                      {/* VARIANT */}
                      <td className="px-4 py-4">
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-gray-800
                          "
                        >
                          {item.variant.displayName}
                        </p>

                        {item.variant.sku && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-400
                            "
                          >
                            {item.variant.sku}
                          </p>
                        )}
                      </td>

                      {/* STOCK */}
                      <td className="px-4 py-4">
                        <span
                          className={[
                            `
                              inline-flex
                              min-w-[4.5rem]
                              items-center
                              justify-center
                              rounded-full
                              px-2.5
                              py-1.5
                              text-xs
                              font-bold
                              ring-1
                              ring-inset
                            `,
                            isOutOfStock
                              ? "bg-red-50 text-red-700 ring-red-200"
                              : "bg-amber-50 text-amber-700 ring-amber-200",
                          ].join(" ")}
                        >
                          {isOutOfStock ? "Out" : item.stockQuantity}
                        </span>
                      </td>

                      {/* THRESHOLD */}
                      <td
                        className="
                          px-4
                          py-4
                          text-sm
                          font-medium
                          text-gray-600
                        "
                      >
                        {item.lowStockThreshold}
                      </td>

                      {/* MANAGE */}
                      <td
                        className="
                          px-5
                          py-4
                          text-right

                          lg:px-6
                        "
                      >
                        <Link
                          to={`/admin/products/${item.product.id}`}
                          className="
                            inline-flex
                            items-center
                            gap-1
                            text-sm
                            font-bold
                            text-gray-700
                            transition-colors

                            hover:text-gray-950
                          "
                        >
                          Manage
                          <ArrowForwardRoundedIcon
                            sx={{
                              fontSize: 15,
                            }}
                          />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardLowStock;
