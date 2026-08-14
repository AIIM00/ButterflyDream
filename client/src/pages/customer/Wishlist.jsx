import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { Link, useLocation } from "react-router-dom";

import WishlistItemCard from "../../components/wishlist/WishlistItemCard.jsx";

import useWishlist from "../../context/wishlist/useWishlist.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function WishlistLoading() {
  return (
    <div
      className="
        mt-8
        grid
        grid-cols-2
        gap-x-3
        gap-y-7

        sm:gap-x-5

        lg:grid-cols-3

        xl:grid-cols-4
      "
    >
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <article
          key={index}
          className="
            overflow-hidden
            rounded-[1.5rem]
          "
        >
          <div
            className="
              aspect-[4/5]
              animate-pulse
              rounded-[1.5rem]
              bg-brand-cream
            "
          />

          <div className="space-y-3 px-1 pt-4">
            <div
              className="
                h-3
                w-20
                animate-pulse
                rounded-full
                bg-brand-cream
              "
            />

            <div
              className="
                h-5
                w-4/5
                animate-pulse
                rounded
                bg-brand-cream
              "
            />

            <div
              className="
                h-4
                w-16
                animate-pulse
                rounded
                bg-brand-cream
              "
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function WishlistGuestState({ location }) {
  return (
    <main className="min-h-screen bg-brand-ivory">
      <section
        className="
          mx-auto
          max-w-2xl
          px-4
          py-20
          text-center

          sm:px-6
          sm:py-28
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-brand-pale-champagne
            text-brand-bronze
          "
        >
          <LockOutlinedIcon
            sx={{
              fontSize: 29,
            }}
          />
        </div>

        <p
          className="
            mt-6
            text-[0.65rem]
            font-bold
            uppercase
            tracking-[0.22em]
            text-brand-bronze
          "
        >
          Your Butterfly Dream
        </p>

        <h1
          className="
            mx-auto
            mt-3
            max-w-xl
            font-display
            text-[2.7rem]
            font-medium
            leading-[0.95]
            tracking-[-0.045em]
            text-brand-espresso

            sm:text-5xl
          "
        >
          Keep the pieces
          <span className="block italic">that speak to you.</span>
        </h1>

        <p
          className="
            mx-auto
            mt-5
            max-w-md
            text-sm
            leading-7
            text-brand-muted
          "
        >
          Log in to save your favorite pieces, revisit them anytime, and keep
          your Butterfly Dream wishlist across your devices.
        </p>

        <div
          className="
            mt-8
            flex
            flex-wrap
            justify-center
            gap-3
          "
        >
          <Link
            to="/login"
            state={{
              from: `${location.pathname}${location.search}`,
            }}
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              bg-brand-espresso
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-brand-emerald
            "
          >
            Log in
          </Link>

          <Link
            to="/products"
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              border
              border-brand-espresso
              px-6
              py-3
              text-sm
              font-semibold
              text-brand-espresso
              transition
              hover:bg-brand-espresso
              hover:text-white
            "
          >
            Explore collection
          </Link>
        </div>
      </section>
    </main>
  );
}

function WishlistError({ error, reloadWishlist }) {
  return (
    <main className="min-h-screen bg-brand-ivory">
      <section
        className="
          mx-auto
          max-w-2xl
          px-4
          py-20
          text-center

          sm:px-6
          sm:py-28
        "
      >
        <span
          className="
            mx-auto
            inline-flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-red-50
            text-red-600
          "
        >
          <ErrorOutlineRoundedIcon
            sx={{
              fontSize: 30,
            }}
          />
        </span>

        <p
          className="
            mt-6
            text-[0.65rem]
            font-bold
            uppercase
            tracking-[0.2em]
            text-red-600
          "
        >
          Wishlist unavailable
        </p>

        <h1
          className="
            mt-3
            font-display
            text-4xl
            font-medium
            tracking-[-0.04em]
            text-brand-espresso

            sm:text-5xl
          "
        >
          We couldn't load your saved pieces.
        </h1>

        <p
          className="
            mx-auto
            mt-4
            max-w-md
            text-sm
            leading-7
            text-brand-muted
          "
        >
          {getApiErrorMessage(error, "Unable to load your wishlist.")}
        </p>

        <button
          type="button"
          onClick={() => void reloadWishlist()}
          className="
            mt-8
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-brand-espresso
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-brand-emerald
          "
        >
          <RefreshRoundedIcon fontSize="small" />
          Try again
        </button>
      </section>
    </main>
  );
}

function WishlistEmptyState() {
  return (
    <div
      className="
        mt-10
        rounded-[1.75rem]
        border
        border-brand-border
        bg-brand-surface
        px-6
        py-16
        text-center
      "
    >
      <span
        className="
          mx-auto
          inline-flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-brand-pale-champagne
          text-brand-bronze
        "
      >
        <FavoriteBorderRoundedIcon
          sx={{
            fontSize: 30,
          }}
        />
      </span>

      <p
        className="
          mt-6
          text-[0.62rem]
          font-bold
          uppercase
          tracking-[0.2em]
          text-brand-bronze
        "
      >
        Your favorites
      </p>

      <h2
        className="
          mt-2
          font-display
          text-3xl
          font-medium
          tracking-[-0.04em]
          text-brand-espresso

          sm:text-4xl
        "
      >
        Your wishlist is waiting for its first piece.
      </h2>

      <p
        className="
          mx-auto
          mt-4
          max-w-md
          text-sm
          leading-7
          text-brand-muted
        "
      >
        Tap the heart while exploring the collection to keep pieces you love
        close and return to them later.
      </p>

      <Link
        to="/products"
        className="
          mt-7
          inline-flex
          items-center
          justify-center
          rounded-full
          bg-brand-espresso
          px-6
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-brand-emerald
        "
      >
        Explore collection
      </Link>
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
    return <WishlistGuestState location={location} />;
  }

  if (status === "error" || error) {
    return <WishlistError error={error} reloadWishlist={reloadWishlist} />;
  }

  const items = wishlist?.items ?? [];

  return (
    <main
      className="
        min-h-screen
        bg-brand-ivory
        text-brand-espresso
      "
    >
      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-20
          pt-8

          sm:px-6
          sm:pt-12

          lg:px-8
          lg:pb-28
          lg:pt-16
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}
        <header
          className="
            grid
            gap-6

            lg:grid-cols-12
            lg:items-end
          "
        >
          <div className="lg:col-span-8">
            <div
              className="
                flex
                items-center
                gap-2
                text-[0.63rem]
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-bronze
              "
            >
              <AutoAwesomeOutlinedIcon
                sx={{
                  fontSize: 14,
                }}
              />
              Your Butterfly Dream
            </div>

            <h1
              className="
                mt-4
                max-w-2xl
                font-display
                text-[3rem]
                font-medium
                leading-[0.9]
                tracking-[-0.05em]
                text-brand-espresso

                sm:text-6xl
              "
            >
              Pieces you
              <span className="block italic text-brand-bronze">
                fell in love with.
              </span>
            </h1>
          </div>

          <div className="lg:col-span-4">
            <p
              className="
                max-w-md
                text-sm
                leading-7
                text-brand-muted
              "
            >
              A personal collection of the pieces that caught your eye and
              stayed with you.
            </p>
          </div>
        </header>

        {/* ==================================================
            SUMMARY STRIP
        ================================================== */}
        {!isLoading && (
          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              gap-x-6
              gap-y-3
              border-y
              border-brand-border
              py-4

              sm:mt-10
            "
          >
            <div className="flex items-center gap-2">
              <FavoriteRoundedIcon
                sx={{
                  fontSize: 17,
                }}
                className="text-brand-bronze"
              />

              <p className="text-sm text-brand-muted">
                <span className="font-semibold text-brand-espresso">
                  {itemCount}
                </span>{" "}
                saved {itemCount === 1 ? "piece" : "pieces"}
              </p>
            </div>

            {itemCount > 0 && (
              <>
                <span
                  className="
                    hidden
                    h-1
                    w-1
                    rounded-full
                    bg-brand-border

                    sm:block
                  "
                />

                <p className="text-sm text-brand-muted">
                  <span className="font-semibold text-brand-espresso">
                    {inStockItemCount}
                  </span>{" "}
                  currently available
                </p>
              </>
            )}
          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}
        {isLoading && <WishlistLoading />}

        {/* ==================================================
            EMPTY
        ================================================== */}
        {!isLoading && items.length === 0 && <WishlistEmptyState />}

        {/* ==================================================
            WISHLIST ITEMS
        ================================================== */}
        {!isLoading && items.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <div
              className="
                  mb-5
                  flex
                  items-end
                  justify-between
                  gap-4

                  sm:mb-7
                "
            >
              <div>
                <p
                  className="
                      text-[0.6rem]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-brand-bronze
                    "
                >
                  Saved for later
                </p>

                <h2
                  className="
                      mt-1
                      font-display
                      text-2xl
                      font-medium
                      tracking-[-0.03em]
                      text-brand-espresso

                      sm:text-3xl
                    "
                >
                  Your favorite pieces
                </h2>
              </div>

              <Link
                to="/products"
                className="
                    hidden
                    shrink-0
                    text-xs
                    font-semibold
                    text-brand-muted
                    transition
                    hover:text-brand-espresso

                    sm:inline-flex
                  "
              >
                Continue shopping
              </Link>
            </div>

            <div
              className="
                  grid
                  grid-cols-2
                  gap-x-3
                  gap-y-8

                  sm:gap-x-5
                  sm:gap-y-10

                  lg:grid-cols-3

                  xl:grid-cols-4
                "
            >
              {items.map((item) => (
                <WishlistItemCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link
                to="/products"
                className="
                    inline-flex
                    rounded-full
                    border
                    border-brand-espresso
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-brand-espresso
                  "
              >
                Continue shopping
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default Wishlist;
