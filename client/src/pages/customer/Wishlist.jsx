import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Link, useLocation } from "react-router-dom";
import WishlistItemCard from "../../components/wishlist/WishlistItemCard.jsx";
import useWishlist from "../../context/wishlist/useWishlist.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function WishlistLoading() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[31rem] animate-pulse rounded-2xl bg-gray-100"
        />
      ))}
    </div>
  );
}

function Wishlist() {
  const location = useLocation();

  const {
    wishlist,
    status,
    error,
    isLoading,
    isGuest,
    itemCount,
    inStockItemCount,
    reloadWishlist,
  } = useWishlist();

  if (isGuest) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <LockOutlinedIcon
            sx={{
              fontSize: 40,
            }}
          />
        </span>

        <h1 className="mt-6 text-3xl font-bold text-gray-950">
          Log in to view your wishlist
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
          Save your favorite accessories and access them from any device.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            state={{
              from: `${location.pathname}${location.search}`,
            }}
            className="rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
          >
            Log in
          </Link>

          <Link
            to="/products"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  if (status === "error" || error) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ErrorOutlineRoundedIcon
          className="text-red-500"
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          Your wishlist could not be loaded
        </h1>

        <p className="mt-4 text-gray-600">
          {getApiErrorMessage(error, "Unable to load your wishlist.")}
        </p>

        <button
          type="button"
          onClick={() => void reloadWishlist()}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          <RefreshRoundedIcon />
          Try again
        </button>
      </section>
    );
  }

  const items = wishlist?.items ?? [];

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Customer account
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          My wishlist
        </h1>

        {!isLoading && (
          <p className="mt-3 text-gray-600">
            {itemCount} saved {itemCount === 1 ? "product" : "products"}
            {itemCount > 0 ? ` · ${inStockItemCount} currently in stock` : ""}
          </p>
        )}
      </header>

      {isLoading && <WishlistLoading />}

      {!isLoading && items.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
          <FavoriteBorderRoundedIcon
            className="text-gray-400"
            sx={{
              fontSize: 60,
            }}
          />

          <h2 className="mt-5 text-2xl font-bold text-gray-950">
            Your wishlist is empty
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-gray-600">
            Save products you love by pressing the heart icon while browsing the
            store.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
          >
            Explore products
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Wishlist;
