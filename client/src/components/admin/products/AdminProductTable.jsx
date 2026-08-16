import { Link } from "react-router-dom";

// MUI Icons
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

// Components
import ProductStatusBadge from "./ProductStatusBadge.jsx";

function AdminProductTable({ products = [] }) {
  return (
    <>
      {/* =====================================================
          MOBILE + TABLET PRODUCT CARDS
      ===================================================== */}
      <div className="space-y-3 lg:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="
              overflow-hidden
              rounded-[1.3rem]
              border
              border-gray-200/80
              bg-white
              shadow-[0_6px_20px_rgba(15,23,42,0.04)]
            "
          >
            {/* MAIN PRODUCT */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3.5">
                {/* IMAGE */}
                <div
                  className="
                    h-[4.5rem]
                    w-[4.5rem]
                    shrink-0
                    overflow-hidden
                    rounded-[1rem]
                    bg-gray-100
                    ring-1
                    ring-gray-200/70

                    sm:h-20
                    sm:w-20
                  "
                >
                  {product.image?.imageUrl ? (
                    <img
                      src={product.image.imageUrl}
                      alt={product.image.altText || product.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
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
                          fontSize: 22,
                        }}
                      />
                    </span>
                  )}
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="min-w-0 flex-1">
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
                          tracking-[-0.015em]
                          text-gray-950

                          sm:text-base
                        "
                      >
                        {product.name}
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-[0.67rem]
                          text-gray-400

                          sm:text-xs
                        "
                      >
                        {product.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    <ProductStatusBadge
                      status={product.status}
                      archivedAt={product.archivedAt}
                    />
                  </div>

                  {product.slug && (
                    <p
                      className="
                        mt-2
                        truncate
                        text-[0.62rem]
                        text-gray-400
                      "
                    >
                      /{product.slug}
                    </p>
                  )}
                </div>
              </div>

              {/* PRODUCT METRICS */}
              <div
                className="
                  mt-4
                  grid
                  grid-cols-3
                  divide-x
                  divide-gray-200
                  rounded-xl
                  bg-gray-50
                  px-2
                  py-3
                "
              >
                {/* VARIANTS */}
                <div className="px-2 text-center">
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-gray-400
                    "
                  >
                    Variants
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    {product.activeVariantCount}/{product.variantCount}
                  </p>
                </div>

                {/* STOCK */}
                <div className="px-2 text-center">
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-gray-400
                    "
                  >
                    Stock
                  </p>

                  <p
                    className={[
                      `
                        mt-1
                        text-sm
                        font-bold
                      `,
                      Number(product.totalStock ?? 0) === 0
                        ? "text-red-600"
                        : "text-gray-900",
                    ].join(" ")}
                  >
                    {product.totalStock}
                  </p>
                </div>

                {/* PRICE */}
                <div className="px-2 text-center">
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-gray-400
                    "
                  >
                    Price
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    {product.minimumPrice ? `$${product.minimumPrice}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* MANAGE ACTION */}
            <Link
              to={`/admin/products/${product.id}`}
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
              <span className="inline-flex items-center gap-2">
                <EditRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
                Manage product
              </span>

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
          <table className="w-full min-w-[950px]">
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
                  Product
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
                  Category
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
                    text-center
                    text-[0.65rem]
                    font-bold
                    uppercase
                    tracking-[0.11em]
                    text-gray-400
                  "
                >
                  Variants
                </th>

                <th
                  className="
                    px-4
                    py-3.5
                    text-center
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
                  Price
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
              {products.map((product) => (
                <tr
                  key={product.id}
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

                      xl:px-6
                    "
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="
                          h-14
                          w-14
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-gray-100
                          ring-1
                          ring-gray-200/70
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
                                fontSize: 20,
                              }}
                            />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            max-w-[15rem]
                            truncate
                            text-sm
                            font-bold
                            text-gray-950
                          "
                        >
                          {product.name}
                        </p>

                        <p
                          className="
                            mt-1
                            max-w-[15rem]
                            truncate
                            text-xs
                            text-gray-400
                          "
                        >
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      font-medium
                      text-gray-600
                    "
                  >
                    {product.category?.name || "—"}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-4">
                    <ProductStatusBadge
                      status={product.status}
                      archivedAt={product.archivedAt}
                    />
                  </td>

                  {/* VARIANTS */}
                  <td
                    className="
                      px-4
                      py-4
                      text-center
                      text-sm
                      font-bold
                      text-gray-800
                    "
                  >
                    {product.activeVariantCount}/{product.variantCount}
                  </td>

                  {/* STOCK */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={[
                        `
                          inline-flex
                          min-w-10
                          items-center
                          justify-center
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-bold
                        `,
                        Number(product.totalStock ?? 0) === 0
                          ? "bg-red-50 text-red-700"
                          : Number(product.totalStock ?? 0) <= 5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-700",
                      ].join(" ")}
                    >
                      {product.totalStock}
                    </span>
                  </td>

                  {/* PRICE */}
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
                    {product.minimumPrice ? `$${product.minimumPrice}` : "—"}
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
                      to={`/admin/products/${product.id}`}
                      aria-label={`Manage ${product.name}`}
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
                      <EditRoundedIcon
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
    </>
  );
}

export default AdminProductTable;
