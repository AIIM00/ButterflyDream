import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

//React Toastify
import { toast } from "react-toastify";

//Context
import useCart from "../../context/cart/useCart.js";

//Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

//Components
import QuantitySelector from "./QuantitySelector.jsx";

//MUI Icons
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

function AddToCartSection({ selectedVariant }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { addItem, mutationKey } = useCart();

  const [quantity, setQuantity] = useState(1);

  if (!selectedVariant) {
    return null;
  }

  const isOutOfStock =
    selectedVariant.stockStatus === "OUT_OF_STOCK" ||
    selectedVariant.inStock === false;

  const isAdding = mutationKey === `add:${selectedVariant.id}`;

  async function handleAddToCart() {
    try {
      const response = await addItem(selectedVariant.id, quantity);

      toast.success(response.message ?? "Product added to cart.");

      setQuantity(1);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.info("Log in to add products to your cart.");

        navigate("/login", {
          state: {
            from: `${location.pathname}${location.search}`,
          },
        });

        return;
      }

      toast.error(getApiErrorMessage(error, "Unable to add product to cart."));
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-600">
            Quantity
          </p>

          <QuantitySelector
            quantity={quantity}
            maximum={99}
            disabled={isOutOfStock || isAdding}
            onChange={setQuantity}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={isOutOfStock || isAdding}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-3 rounded-xl bg-gray-950 px-6 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <ShoppingBagOutlinedIcon />

          {isAdding
            ? "Adding..."
            : isOutOfStock
              ? "Out of stock"
              : "Add to cart"}
        </button>
      </div>

      {!isOutOfStock && (
        <p className="mt-3 text-sm text-gray-500">
          Stock availability will be confirmed again when the order is placed.
        </p>
      )}
    </section>
  );
}

export default AddToCartSection;
