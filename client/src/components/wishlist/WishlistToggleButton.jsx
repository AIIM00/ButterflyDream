import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useWishlist from "../../context/wishlist/useWishlist.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function WishlistToggleButton({
  productId,
  showLabel = false,

  // "default" = normal product
  // "featured" = featured product
  variant = "default",

  className = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isGuest,
    isLoading,
    mutationKey,
    isSaved,
    addProduct,
    removeProduct,
  } = useWishlist();

  const productIsSaved = isSaved(productId);

  const isMutating =
    mutationKey === `add:${productId}` || mutationKey === `remove:${productId}`;

  async function handleToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isGuest) {
      toast.info("Log in to save products to your wishlist.");

      navigate("/login", {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });

      return;
    }

    try {
      const response = productIsSaved
        ? await removeProduct(productId)
        : await addProduct(productId);

      toast.success(
        response.message ??
          (productIsSaved
            ? "Product removed from wishlist."
            : "Product saved to wishlist."),
      );
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        navigate("/login", {
          state: {
            from: `${location.pathname}${location.search}`,
          },
        });

        return;
      }

      toast.error(getApiErrorMessage(error, "Unable to update your wishlist."));
    }
  }

  const featured = variant === "featured";

  /*
   * ======================================================
   * FULL / LABELED BUTTON
   * Product details page etc.
   * ======================================================
   */

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={(event) => void handleToggle(event)}
        disabled={isLoading || isMutating}
        aria-label={
          productIsSaved
            ? "Remove product from wishlist"
            : "Add product to wishlist"
        }
        aria-pressed={productIsSaved}
        className={[
          `
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2.5

            rounded-full

            border
            border-brand-border

            bg-brand-surface

            px-5
            py-2.5

            text-sm
            font-semibold

            text-brand-text

            transition-all
            duration-200

            hover:bg-brand-surface-soft
            hover:border-brand-text/30

            active:scale-[0.98]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-accent-fill/40
            focus-visible:ring-offset-2

            disabled:cursor-not-allowed
            disabled:opacity-50
          `,
          className,
        ].join(" ")}
      >
        <span
          className={`
            inline-flex
            items-center
            justify-center

            transition-transform
            duration-200

            ${
              productIsSaved
                ? "scale-110 text-brand-accent-text"
                : "text-brand-text-muted"
            }

            ${isMutating ? "animate-pulse" : ""}
          `}
        >
          {productIsSaved ? (
            <FavoriteRoundedIcon
              sx={{
                fontSize: 20,
              }}
            />
          ) : (
            <FavoriteBorderRoundedIcon
              sx={{
                fontSize: 20,
              }}
            />
          )}
        </span>

        <span>
          {isMutating
            ? "Updating..."
            : productIsSaved
              ? "Saved"
              : "Save to wishlist"}
        </span>
      </button>
    );
  }

  /*
   * ======================================================
   * PRODUCT CARD HEART
   * ======================================================
   */

  return (
    <button
      type="button"
      onClick={(event) => void handleToggle(event)}
      disabled={isLoading || isMutating}
      aria-label={
        productIsSaved
          ? "Remove product from wishlist"
          : "Add product to wishlist"
      }
      aria-pressed={productIsSaved}
      title={productIsSaved ? "Remove from wishlist" : "Save to wishlist"}
      className={[
        `
          group/wishlist

          relative

          inline-flex
          h-11
          w-11
          shrink-0

          items-center
          justify-center

          rounded-full

          border-0
          bg-transparent

          transition-all
          duration-200

          active:scale-90

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand-accent-fill/40

          disabled:cursor-not-allowed
          disabled:opacity-50
        `,

        featured
          ? productIsSaved
            ? `
                bg-brand-accent-fill/10
                text-brand-accent-text

                hover:bg-brand-accent-fill/20
                hover:text-brand-accent-text-hover
              `
            : `
                text-brand-accent-text

                hover:bg-brand-accent-fill/10
                hover:text-brand-accent-text-hover
              `
          : productIsSaved
            ? `
                bg-brand-primary/5
                text-brand-primary

                hover:bg-brand-primary/10
              `
            : `
                text-brand-text-muted

                hover:bg-brand-primary/5
                hover:text-brand-text
              `,

        className,
      ].join(" ")}
    >
      <span
        className={`
          inline-flex
          items-center
          justify-center

          transition-all
          duration-200

          ${
            productIsSaved
              ? "scale-110"
              : "scale-100 group-hover/wishlist:scale-105"
          }

          ${isMutating ? "animate-pulse" : ""}
        `}
      >
        {productIsSaved ? (
          <FavoriteRoundedIcon
            sx={{
              fontSize: 22,
            }}
          />
        ) : (
          <FavoriteBorderRoundedIcon
            sx={{
              fontSize: 22,
            }}
          />
        )}
      </span>
    </button>
  );
}

export default WishlistToggleButton;
