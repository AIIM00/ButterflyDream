import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Link } from "react-router-dom";

function DashboardLowStock({ items, lowStockCount, outOfStockCount }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-950">Inventory alerts</h2>

          <p className="mt-1 text-sm text-gray-500">
            Variants at or below their low-stock threshold.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {lowStockCount} low stock
          </span>

          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
            {outOfStockCount} out of stock
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl bg-green-50 p-6 text-center">
          <Inventory2OutlinedIcon className="text-green-600" />

          <p className="mt-3 font-semibold text-green-800">
            Inventory levels look healthy.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Variant
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Stock
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Threshold
                </th>

                <th className="py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-semibold text-gray-950">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.product.category?.name}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.variant.displayName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.variant.sku}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                        item.stockQuantity === 0
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800",
                      ].join(" ")}
                    >
                      {item.stockQuantity}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {item.lowStockThreshold}
                  </td>

                  <td className="py-4 text-right">
                    <Link
                      to={`/admin/products/${item.product.id}`}
                      className="text-sm font-semibold text-gray-700 hover:text-gray-950"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DashboardLowStock;
