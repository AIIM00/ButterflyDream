import { Link } from "react-router-dom";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import QuantitySelector from "./QuantitySelector.jsx";

function getAvailabilityMessage(availability) {
  switch (availability?.reason) {
    case "PRODUCT_UNAVAILABLE":
      return "This product is no longer available.";

    case "CATEGORY_UNAVAILABLE":
      return "This product category is currently unavailable.";

    case "VARIANT_UNAVAILABLE":
      return "This product option is currently unavailable.";

    case "OUT_OF_STOCK":
      return "This product option is out of stock.";

    default:
      if (availability?.quantityAvailable === false) {
        return `Only ${availability.availableStock} units are currently available.`;
      }

      return null;
  }
}

function CartItemCard({
  item,
  isUpdating,
  isRemoving,
  onQuantityChange,
  onRemove,
}) {
  const options =
    item.variant?.options &&
    typeof item.variant.options === "object" &&
    !Array.isArray(item.variant.options)
      ? Object.entries(item.variant.options)
      : [];

  const availabilityMessage = getAvailabilityMessage(item.availability);

  const maximumQuantity =
    item.availability?.availableStock > 0
      ? Math.min(item.availability.availableStock, 99)
      : 99;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row">
        <Link
          to={`/products/${item.product.slug}`}
          className="block h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-32"
        >
          {item.image?.imageUrl ? (
            <img
              src={item.image.imageUrl}
              alt={item.image.altText || item.product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-gray-400">
              <ImageNotSupportedOutlinedIcon
                sx={{
                  fontSize: 40,
                }}
              />
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                {item.product.category?.name}
              </p>

              <h2 className="mt-1 text-lg font-bold text-gray-950">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="hover:underline"
                >
                  {item.product.name}
                </Link>
              </h2>

              <p className="mt-2 text-sm font-semibold text-gray-700">
                {item.variant.displayName}
              </p>

              {options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.map(([name, value]) => (
                    <span
                      key={name}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      <span className="capitalize">{name}</span>:{" "}
                      {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-lg font-bold text-gray-950">
                ${item.lineTotal}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                ${item.unitPrice} each
              </p>
            </div>
          </div>

          {item.priceChanged && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Price changed from ${item.unitPriceSnapshot} to ${item.unitPrice}.
            </div>
          )}

          {availabilityMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {availabilityMessage}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
            <QuantitySelector
              quantity={item.quantity}
              maximum={maximumQuantity}
              disabled={
                isUpdating ||
                isRemoving ||
                item.availability?.available === false
              }
              onChange={onQuantityChange}
            />

            <button
              type="button"
              onClick={onRemove}
              disabled={isUpdating || isRemoving}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <DeleteOutlineRoundedIcon fontSize="small" />

              {isRemoving ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CartItemCard;
