//MUI Materials
import { Switch } from "@mui/material";

//MUI Icons
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

//Components
import CategoryImagePreview from "./CategoryImagePreview.jsx";

function AdminCategoryTable({
  categories,
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
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Categories</h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage storefront categories and display order.
          </p>
        </div>

        {orderChanged && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onResetOrder}
              disabled={isSavingOrder}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
            >
              Reset order
            </button>

            <button
              type="button"
              onClick={onSaveOrder}
              disabled={isSavingOrder}
              className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSavingOrder ? "Saving..." : "Save order"}
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-4">Order</th>

              <th className="px-5 py-4">Category</th>

              <th className="px-5 py-4">Slug</th>

              <th className="px-5 py-4 text-center">Products</th>

              <th className="px-5 py-4 text-center">Active</th>

              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category.id} className="transition hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMove(index, -1)}
                      disabled={index === 0 || isSavingOrder}
                      aria-label={`Move ${category.name} up`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onMove(index, 1)}
                      disabled={
                        index === categories.length - 1 || isSavingOrder
                      }
                      aria-label={`Move ${category.name} down`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    </button>

                    <span className="ml-2 text-sm font-semibold text-gray-500">
                      {index + 1}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <CategoryImagePreview
                      imageUrl={category.imageUrl}
                      categoryName={category.name}
                      compact
                    />

                    <div>
                      <p className="font-bold text-gray-950">{category.name}</p>

                      <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                        {category.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <code className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700">
                    {category.slug}
                  </code>
                </td>

                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                    <Inventory2OutlinedIcon fontSize="small" />

                    {category.productCount}
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <Switch
                    checked={category.isActive}
                    onChange={() => onStatusRequest(category)}
                    disabled={isUpdatingStatus}
                    inputProps={{
                      "aria-label": `${category.name} active status`,
                    }}
                  />
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                  >
                    <EditRoundedIcon fontSize="small" />
                    Edit
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
