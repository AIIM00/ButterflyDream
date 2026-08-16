// MUI Materials
import { Switch } from "@mui/material";

// MUI Icons
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

// Components
import CategoryImagePreview from "./CategoryImagePreview.jsx";

function AdminCategoryTable({
  categories = [],
  isUpdatingStatus,
  orderChanged,
  isSavingOrder,
  onEdit,
  onStatusRequest,
  onMove,
  onSaveOrder,
  onResetOrder,
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
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.13em]
                text-gray-400
              "
            >
              Catalog
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
              Categories
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
              Manage storefront categories, visibility, and display order.
            </p>
          </div>

          {/* ORDER ACTIONS */}
          {orderChanged && (
            <div
              className="
                grid
                grid-cols-2
                gap-2

                sm:flex
                sm:shrink-0
              "
            >
              <button
                type="button"
                onClick={onResetOrder}
                disabled={isSavingOrder}
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-1.5
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-3.5
                  text-xs
                  font-bold
                  text-gray-700
                  transition-all

                  hover:border-gray-300
                  hover:bg-gray-100
                  hover:text-gray-950

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:min-h-11
                  sm:px-4
                "
              >
                <RestartAltRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
                Reset
              </button>

              <button
                type="button"
                onClick={onSaveOrder}
                disabled={isSavingOrder}
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-1.5
                  rounded-full
                  bg-gray-950
                  px-3.5
                  text-xs
                  font-bold
                  text-white
                  transition-colors

                  hover:bg-gray-800

                  disabled:cursor-not-allowed
                  disabled:bg-gray-200
                  disabled:text-gray-400

                  sm:min-h-11
                  sm:px-4
                "
              >
                <SaveOutlinedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />

                {isSavingOrder ? "Saving..." : "Save order"}
              </button>
            </div>
          )}
        </div>

        {/* UNSAVED NOTICE */}
        {orderChanged && (
          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              rounded-xl
              bg-amber-50
              px-3
              py-2.5
              text-[0.68rem]
              font-medium
              text-amber-700

              sm:text-xs
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                bg-amber-500
              "
            />
            Category order has unsaved changes.
          </div>
        )}
      </div>

      {/* =====================================================
          MOBILE + TABLET CATEGORY CARDS
      ===================================================== */}
      <div
        className="
          space-y-3
          p-4

          sm:p-5

          lg:hidden
        "
      >
        {categories.map((category, index) => (
          <article
            key={category.id}
            className="
              overflow-hidden
              rounded-[1.2rem]
              border
              border-gray-200
              bg-white
              shadow-[0_4px_16px_rgba(15,23,42,0.035)]
            "
          >
            {/* MAIN CATEGORY */}
            <div className="p-4">
              <div
                className="
                  flex
                  items-start
                  gap-3.5
                "
              >
                {/* CATEGORY IMAGE */}
                <div className="shrink-0">
                  <CategoryImagePreview
                    imageUrl={category.imageUrl}
                    categoryName={category.name}
                    compact
                  />
                </div>

                {/* CATEGORY INFO */}
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
                          truncate
                          text-sm
                          font-bold
                          tracking-[-0.015em]
                          text-gray-950

                          sm:text-base
                        "
                      >
                        {category.name}
                      </p>

                      <p
                        className="
                          mt-1
                          line-clamp-2
                          text-[0.68rem]
                          leading-5
                          text-gray-500

                          sm:text-xs
                        "
                      >
                        {category.description || "No description"}
                      </p>
                    </div>

                    {/* ACTIVE STATUS */}
                    <div className="shrink-0">
                      <Switch
                        size="small"
                        checked={category.isActive}
                        onChange={() => onStatusRequest(category)}
                        disabled={isUpdatingStatus}
                        inputProps={{
                          "aria-label": `${category.name} active status`,
                        }}
                      />
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className={[
                        `
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                        `,
                        category.isActive ? "bg-emerald-500" : "bg-gray-300",
                      ].join(" ")}
                    />

                    <span
                      className={[
                        `
                          text-[0.62rem]
                          font-medium
                        `,
                        category.isActive
                          ? "text-emerald-700"
                          : "text-gray-400",
                      ].join(" ")}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CATEGORY DETAILS */}
              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  divide-x
                  divide-gray-200
                  rounded-xl
                  bg-gray-50
                  py-3
                "
              >
                {/* SLUG */}
                <div className="min-w-0 px-3">
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-gray-400
                    "
                  >
                    Slug
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      font-semibold
                      text-gray-700
                    "
                  >
                    /{category.slug}
                  </p>
                </div>

                {/* PRODUCTS */}
                <div className="px-3 text-right">
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-gray-400
                    "
                  >
                    Products
                  </p>

                  <p
                    className="
                      mt-1
                      inline-flex
                      items-center
                      justify-end
                      gap-1.5
                      text-xs
                      font-bold
                      text-gray-800
                    "
                  >
                    <Inventory2OutlinedIcon
                      sx={{
                        fontSize: 14,
                      }}
                    />

                    {category.productCount}
                  </p>
                </div>
              </div>

              {/* DISPLAY ORDER */}
              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-gray-400
                    "
                  >
                    Display order
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-gray-950
                    "
                  >
                    #{index + 1}
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0 || isSavingOrder}
                    aria-label={`Move ${category.name} up`}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-gray-200
                      bg-white
                      text-gray-600
                      transition-all

                      hover:border-gray-300
                      hover:bg-gray-100
                      hover:text-gray-950

                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <ArrowUpwardRoundedIcon
                      sx={{
                        fontSize: 17,
                      }}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === categories.length - 1 || isSavingOrder}
                    aria-label={`Move ${category.name} down`}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-gray-200
                      bg-white
                      text-gray-600
                      transition-all

                      hover:border-gray-300
                      hover:bg-gray-100
                      hover:text-gray-950

                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <ArrowDownwardRoundedIcon
                      sx={{
                        fontSize: 17,
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* EDIT ACTION */}
            <button
              type="button"
              onClick={() => onEdit(category)}
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
              "
            >
              <span className="inline-flex items-center gap-2">
                <EditRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
                Edit category
              </span>

              <span
                className="
                  text-gray-400
                  transition-colors
                  group-hover:text-white
                "
              >
                #{index + 1}
              </span>
            </button>
          </article>
        ))}
      </div>

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}
      <div
        className="
          hidden
          overflow-x-auto

          lg:block
        "
      >
        <table className="w-full min-w-[900px]">
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
                Slug
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
                Products
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
                Active
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
                Actions
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-gray-100">
            {categories.map((category, index) => (
              <tr
                key={category.id}
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
                  <div
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <button
                      type="button"
                      onClick={() => onMove(index, -1)}
                      disabled={index === 0 || isSavingOrder}
                      aria-label={`Move ${category.name} up`}
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        text-gray-500
                        transition-colors

                        hover:bg-gray-100
                        hover:text-gray-950

                        disabled:cursor-not-allowed
                        disabled:opacity-25
                      "
                    >
                      <ArrowUpwardRoundedIcon
                        sx={{
                          fontSize: 17,
                        }}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => onMove(index, 1)}
                      disabled={
                        index === categories.length - 1 || isSavingOrder
                      }
                      aria-label={`Move ${category.name} down`}
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        text-gray-500
                        transition-colors

                        hover:bg-gray-100
                        hover:text-gray-950

                        disabled:cursor-not-allowed
                        disabled:opacity-25
                      "
                    >
                      <ArrowDownwardRoundedIcon
                        sx={{
                          fontSize: 17,
                        }}
                      />
                    </button>

                    <span
                      className="
                        ml-1.5
                        text-xs
                        font-bold
                        text-gray-400
                      "
                    >
                      {index + 1}
                    </span>
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-5 py-4">
                  <div
                    className="
                      flex
                      items-center
                      gap-3.5
                    "
                  >
                    <CategoryImagePreview
                      imageUrl={category.imageUrl}
                      categoryName={category.name}
                      compact
                    />

                    <div className="min-w-0">
                      <p
                        className="
                          max-w-[14rem]
                          truncate
                          text-sm
                          font-bold
                          text-gray-950
                        "
                      >
                        {category.name}
                      </p>

                      <p
                        className="
                          mt-1
                          max-w-[14rem]
                          truncate
                          text-xs
                          text-gray-400
                        "
                      >
                        {category.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* SLUG */}
                <td className="px-4 py-4">
                  <code
                    className="
                      inline-flex
                      max-w-[12rem]
                      truncate
                      rounded-lg
                      bg-gray-100
                      px-2.5
                      py-1.5
                      text-[0.68rem]
                      font-semibold
                      text-gray-600
                    "
                  >
                    {category.slug}
                  </code>
                </td>

                {/* PRODUCTS */}
                <td className="px-4 py-4 text-center">
                  <span
                    className="
                      inline-flex
                      min-w-12
                      items-center
                      justify-center
                      gap-1.5
                      rounded-full
                      bg-gray-100
                      px-2.5
                      py-1.5
                      text-xs
                      font-bold
                      text-gray-700
                    "
                  >
                    <Inventory2OutlinedIcon
                      sx={{
                        fontSize: 15,
                      }}
                    />

                    {category.productCount}
                  </span>
                </td>

                {/* ACTIVE */}
                <td className="px-4 py-4 text-center">
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                    "
                  >
                    <Switch
                      size="small"
                      checked={category.isActive}
                      onChange={() => onStatusRequest(category)}
                      disabled={isUpdatingStatus}
                      inputProps={{
                        "aria-label": `${category.name} active status`,
                      }}
                    />

                    <span
                      className={[
                        `
                          text-[0.65rem]
                          font-semibold
                        `,
                        category.isActive
                          ? "text-emerald-700"
                          : "text-gray-400",
                      ].join(" ")}
                    >
                      {category.isActive ? "Active" : "Off"}
                    </span>
                  </div>
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
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label={`Edit ${category.name}`}
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
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminCategoryTable;
