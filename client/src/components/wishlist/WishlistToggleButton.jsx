import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useWishlist from "../../context/wishlist/useWishlist.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function WishlistToggleButton({
  productId,
  showLabel = false,
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
        "inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-950 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50",
        showLabel ? "min-h-11 px-5 py-2.5 font-semibold" : "h-11 w-11",
        className,
      ].join(" ")}
    >
      {productIsSaved ? (
        <FavoriteRoundedIcon className="text-red-600" />
      ) : (
        <FavoriteBorderRoundedIcon />
      )}

      {showLabel && (
        <span>
          {isMutating
            ? "Updating..."
            : productIsSaved
              ? "Saved"
              : "Save to wishlist"}
        </span>
      )}
    </button>
  );
}

export default WishlistToggleButton;
