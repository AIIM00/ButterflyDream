import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { Link } from "react-router-dom";
import formatCurrency from "../../../utils/formatCurrency.js";

function DashboardTopProducts({ products, currency }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-950">Top products</h2>

        <p className="mt-1 text-sm text-gray-500">
          Ranked by units sold from paid orders.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-500">
          There is not enough paid-order data yet.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {products.map((product, index) => (
            <Link
              key={product.productId}
              to={`/admin/products/${product.productId}`}
              className="flex items-center gap-4 rounded-xl p-2 transition hover:bg-gray-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white">
                {index + 1}
              </span>

              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {product.image?.imageUrl ? (
                  <img
                    src={product.image.imageUrl}
                    alt={product.image.altText || product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-gray-400">
                    <ImageNotSupportedOutlinedIcon fontSize="small" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-gray-950">
                  {product.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {product.unitsSold}{" "}
                  {product.unitsSold === 1 ? "unit" : "units"} sold
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold text-gray-950">
                {formatCurrency(product.revenue, currency)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardTopProducts;
