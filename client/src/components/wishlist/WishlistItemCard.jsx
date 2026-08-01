import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useCart from "../../context/cart/useCart.js";
import useWishlist from "../../context/wishlist/useWishlist.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function formatProductPrice(pricing) {
  if (!pricing?.minPrice) {
    return "Unavailable";
  }

  if (pricing.hasPriceRange) {
    return `$${pricing.minPrice} – $${pricing.maxPrice}`;
  }

  return `$${pricing.minPrice}`;
}

function getAvailabilityMessage(product) {
  switch (product.availability?.reason) {
    case "PRODUCT_UNAVAILABLE":
      return "This product is no longer available.";

    case "CATEGORY_UNAVAILABLE":
      return "This product category is unavailable.";

    case "NO_ACTIVE_VARIANTS":
      return "This product currently has no available options.";

    default:
      if (!product.inStock) {
        return "Currently out of stock.";
      }

      return null;
  }
}

function WishlistItemCard({ item }) {
  const product = item.product;

  const { mutationKey: wishlistMutationKey, removeProduct } = useWishlist();

  const { mutationKey: cartMutationKey, addItem } = useCart();

  const isRemoving = wishlistMutationKey === `remove:${product.id}`;

  const canAddDirectly =
    product.availability?.available &&
    product.inStock &&
    product.variantCount === 1 &&
    product.defaultVariant &&
    product.defaultVariant.stockQuantity > 0;

  const isAdding =
    product.defaultVariant &&
    cartMutationKey === `add:${product.defaultVariant.id}`;

  const availabilityMessage = getAvailabilityMessage(product);

  async function handleRemove() {
    try {
      const response = await removeProduct(product.id);

      toast.success(response.message ?? "Product removed from wishlist.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to remove product from wishlist."),
      );
    }
  }

  async function handleAddToCart() {
    if (!product.defaultVariant) {
      return;
    }

    try {
      const response = await addItem(product.defaultVariant.id, 1);

      toast.success(response.message ?? "Product added to cart.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to add product to cart."));
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Link
        to={`/products/${product.slug}`}
        className="block aspect-square overflow-hidden bg-gray-100"
      >
        {product.image?.imageUrl ? (
          <img
            src={product.image.imageUrl}
            alt={product.image.altText || product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-gray-400">
            <ImageNotSupportedOutlinedIcon
              sx={{
                fontSize: 52,
              }}
            />
          </span>
        )}
      </Link>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {product.category?.name}
        </p>

        <Link
          to={`/products/${product.slug}`}
          className="mt-2 block text-lg font-bold text-gray-950 hover:underline"
        >
          {product.name}
        </Link>

        <p className="mt-3 text-lg font-bold text-gray-950">
          {formatProductPrice(product.pricing)}
        </p>

        {availabilityMessage && (
          <p
            className={[
              "mt-3 rounded-xl px-3 py-2 text-sm font-semibold",
              product.availability?.available
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-700",
            ].join(" ")}
          >
            {availabilityMessage}
          </p>
        )}

        <div className="mt-5 grid gap-2">
          {canAddDirectly ? (
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={isAdding || isRemoving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              <ShoppingBagOutlinedIcon fontSize="small" />

              {isAdding ? "Adding..." : "Add to cart"}
            </button>
          ) : product.availability?.available && product.inStock ? (
            <Link
              to={`/products/${product.slug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-950 px-4 py-2.5 text-center font-semibold text-white transition hover:bg-gray-800"
            >
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="min-h-11 cursor-not-allowed rounded-xl bg-gray-200 px-4 py-2.5 font-semibold text-gray-500"
            >
              Unavailable
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={isRemoving || isAdding}
            className="min-h-11 rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            {isRemoving ? "Removing..." : "Remove from wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default WishlistItemCard;
