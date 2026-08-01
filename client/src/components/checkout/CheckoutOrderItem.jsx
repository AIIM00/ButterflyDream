import { Link } from "react-router-dom";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

function getAvailabilityMessage(item) {
  if (item.availability?.quantityAvailable === false) {
    return `Only ${item.availability.availableStock} units are available.`;
  }

  switch (item.availability?.reason) {
    case "PRODUCT_UNAVAILABLE":
      return "This product is unavailable.";

    case "CATEGORY_UNAVAILABLE":
      return "This product category is unavailable.";

    case "VARIANT_UNAVAILABLE":
      return "This product option is unavailable.";

    case "INVENTORY_MISSING":
      return "Inventory information is unavailable.";

    case "OUT_OF_STOCK":
      return "This product option is out of stock.";

    default:
      return null;
  }
}

function CheckoutOrderItem({ item }) {
  const availabilityMessage = getAvailabilityMessage(item);

  const options =
    item.variant?.options &&
    typeof item.variant.options === "object" &&
    !Array.isArray(item.variant.options)
      ? Object.entries(item.variant.options)
      : [];

  return (
    <article className="border-b border-gray-200 py-5 last:border-b-0">
      <div className="flex gap-4">
        <Link
          to={`/products/${item.product.slug}`}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100"
        >
          {item.image?.imageUrl ? (
            <img
              src={item.image.imageUrl}
              alt={item.image.altText || item.product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-gray-400">
              <ImageNotSupportedOutlinedIcon />
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {item.product.category?.name}
              </p>

              <h3 className="mt-1 font-bold text-gray-950">
                {item.product.name}
              </h3>

              <p className="mt-1 text-sm font-medium text-gray-600">
                {item.variant.displayName}
              </p>
            </div>

            <p className="shrink-0 font-bold text-gray-950">
              ${item.lineTotal}
            </p>
          </div>

          {options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map(([name, value]) => (
                <span
                  key={name}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                >
                  <span className="capitalize">{name}</span>: {String(value)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            <span>Quantity: {item.quantity}</span>

            <span>${item.unitPrice} each</span>
          </div>

          {item.priceChanged && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Price changed from ${item.unitPriceSnapshot} to ${item.unitPrice}.
            </div>
          )}

          {availabilityMessage && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {availabilityMessage}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default CheckoutOrderItem;
