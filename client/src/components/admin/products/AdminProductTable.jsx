import { Link } from "react-router-dom";

//MUI Icons
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

//Components
import ProductStatusBadge from "./ProductStatusBadge.jsx";

function AdminProductTable({ products }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Variants</th>
              <th className="px-5 py-4 text-center">Stock</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    {product.image?.imageUrl ? (
                      <img
                        src={product.image.imageUrl}
                        alt={product.image.altText || product.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                        <ImageNotSupportedOutlinedIcon />
                      </span>
                    )}

                    <div>
                      <p className="font-bold text-gray-950">{product.name}</p>

                      <p className="mt-1 text-xs text-gray-500">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-gray-700">
                  {product.category?.name}
                </td>

                <td className="px-5 py-4">
                  <ProductStatusBadge
                    status={product.status}
                    archivedAt={product.archivedAt}
                  />
                </td>

                <td className="px-5 py-4 text-center font-semibold">
                  {product.activeVariantCount}/{product.variantCount}
                </td>

                <td className="px-5 py-4 text-center font-semibold">
                  {product.totalStock}
                </td>

                <td className="px-5 py-4 font-bold text-gray-950">
                  {product.minimumPrice ? `$${product.minimumPrice}` : "—"}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-950"
                  >
                    <EditRoundedIcon fontSize="small" />
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProductTable;
