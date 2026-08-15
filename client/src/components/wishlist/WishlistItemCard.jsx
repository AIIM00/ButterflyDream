import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import useCart from "../../context/cart/useCart.js";
import useWishlist from "../../context/wishlist/useWishlist.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   WISHLIST ITEM CARD
========================================================= */

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
    <article
      className="
        group/card

        w-full
        max-w-[350px]

        overflow-hidden

        rounded-[1.65rem]

        border
        border-brand-border

        bg-brand-surface-soft

        p-2.5

        transition-all
        duration-300

        shadow-[0_8px_24px_rgba(0,0,0,0.045)]

        hover:-translate-y-0.5
        hover:shadow-[0_14px_34px_rgba(0,0,0,0.07)]
      "
    >
      {/* ==================================================
          IMAGE AREA
      ================================================== */}

      <div
        className="
          relative

          overflow-hidden

          rounded-[1.3rem]

          bg-brand-surface

          shadow-[inset_0_4px_12px_rgba(0,0,0,0.08)]
        "
      >
        <Link
          to={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="
            block
            aspect-square
            w-full
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

                object-contain

                p-3

                transition-transform
                duration-500

                group-hover/card:scale-[1.025]
              "
            />
          ) : (
            <span
              className="
                flex
                h-full
                w-full

                flex-col

                items-center
                justify-center

                gap-2

                text-brand-text-muted
              "
            >
              <span
                className="
                  inline-flex
                  h-14
                  w-14

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  text-brand-accent-text
                "
              >
                <ImageNotSupportedOutlinedIcon
                  sx={{
                    fontSize: 27,
                  }}
                />
              </span>

              <span
                className="
                  text-xs
                  font-medium
                "
              >
                Product image
              </span>
            </span>
          )}
        </Link>

        {/* ==================================================
            WISHLIST INDICATOR
        ================================================== */}

        <button
          type="button"
          onClick={() => void handleRemove()}
          disabled={isRemoving || isAdding}
          aria-label={`Remove ${product.name} from wishlist`}
          title="Remove from wishlist"
          className="
            absolute
            right-3
            top-3

            inline-flex
            h-11
            w-11

            items-center
            justify-center

            rounded-full

            bg-brand-surface/90

            text-brand-accent-text

            shadow-sm
            backdrop-blur-md

            transition-all
            duration-200

            hover:bg-brand-accent-soft

            active:scale-90

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-accent-fill/40

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <FavoriteRoundedIcon
            sx={{
              fontSize: 21,
            }}
          />
        </button>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="
          px-2.5
          pb-2
          pt-4
        "
      >
        {/* CATEGORY */}

        {product.category?.name && (
          <p
            className="
              text-[0.58rem]
              font-bold
              uppercase

              tracking-[0.16em]

              text-brand-accent-text
            "
          >
            {product.category.name}
          </p>
        )}

        {/* NAME */}

        <Link
          to={`/products/${product.slug}`}
          className="
            mt-1.5
            block
          "
        >
          <h3
            className="
              line-clamp-2

              font-display

              text-[1.18rem]
              font-medium

              leading-[1.12]

              tracking-[-0.03em]

              text-brand-text

              transition-colors

              hover:text-brand-accent-text
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}

        <p
          className="
            mt-3

            font-display

            text-[1.35rem]
            font-semibold

            tracking-[-0.035em]

            text-brand-text
          "
        >
          {formatProductPrice(product.pricing)}
        </p>

        {/* ==================================================
            AVAILABILITY
        ================================================== */}

        {availabilityMessage && (
          <div
            className={`
              mt-3

              rounded-[0.9rem]

              border

              px-3
              py-2.5

              text-xs
              font-semibold
              leading-5

              ${
                product.availability?.available
                  ? `
                      border-amber-500/20
                      bg-amber-50
                      text-amber-800
                    `
                  : `
                      border-brand-error/20
                      bg-brand-error/5
                      text-brand-error
                    `
              }
            `}
          >
            {availabilityMessage}
          </div>
        )}

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            mt-5
            space-y-2
          "
        >
          {/* ADD DIRECTLY */}

          {canAddDirectly ? (
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={isAdding || isRemoving}
              className="
                inline-flex
                min-h-12
                w-full

                items-center
                justify-center

                gap-2

                rounded-full

                bg-brand-primary

                px-5

                text-sm
                font-semibold

                text-brand-surface

                transition-all
                duration-200

                hover:bg-brand-primary-hover

                active:scale-[0.985]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/40

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <ShoppingBagOutlinedIcon
                sx={{
                  fontSize: 19,
                }}
              />

              {isAdding ? "Adding..." : "Add to cart"}
            </button>
          ) : product.availability?.available && product.inStock ? (
            /* CHOOSE VARIANT */

            <Link
              to={`/products/${product.slug}`}
              className="
                inline-flex
                min-h-12
                w-full

                items-center
                justify-center

                rounded-full

                bg-brand-primary

                px-5

                text-center
                text-sm
                font-semibold

                text-brand-surface

                transition-all
                duration-200

                hover:bg-brand-primary-hover

                active:scale-[0.985]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/40
              "
            >
              Choose options
            </Link>
          ) : (
            /* UNAVAILABLE */

            <button
              type="button"
              disabled
              className="
                inline-flex
                min-h-12
                w-full

                cursor-not-allowed

                items-center
                justify-center

                rounded-full

                bg-brand-surface

                px-5

                text-sm
                font-semibold

                text-brand-text-muted

                opacity-70
              "
            >
              Unavailable
            </button>
          )}

          {/* REMOVE */}

          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={isRemoving || isAdding}
            className="
              inline-flex
              min-h-10
              w-full

              items-center
              justify-center

              rounded-full

              bg-transparent

              px-4

              text-xs
              font-semibold

              text-brand-text-muted

              transition-colors
              duration-200

              hover:bg-brand-error/5
              hover:text-brand-error

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-error/25

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isRemoving ? "Removing..." : "Remove from wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default WishlistItemCard;
