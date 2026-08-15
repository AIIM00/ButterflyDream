import { Link, useLocation } from "react-router-dom";

// MUI Icons
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

// Components
import WishlistItemCard from "../../components/wishlist/WishlistItemCard.jsx";

// Context
import useWishlist from "../../context/wishlist/useWishlist.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   LOADING
========================================================= */

function WishlistLoading() {
  return (
    <div
      className="
        mt-8

        grid
        grid-cols-1
        justify-items-center

        gap-y-8

        sm:grid-cols-2
        sm:gap-x-5
        sm:gap-y-10

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
            w-full
            max-w-[350px]

            overflow-hidden

            rounded-[1.5rem]
          "
        >
          <div
            className="
              aspect-square

              animate-pulse

              rounded-[1.5rem]

              bg-brand-surface-soft
            "
          />

          <div
            className="
              space-y-3

              px-1
              pt-4
            "
          >
            <div
              className="
                h-3
                w-20

                animate-pulse

                rounded-full

                bg-brand-accent-soft
              "
            />

            <div
              className="
                h-5
                w-4/5

                animate-pulse

                rounded

                bg-brand-surface-soft
              "
            />

            <div
              className="
                h-4
                w-16

                animate-pulse

                rounded

                bg-brand-surface-soft
              "
            />
          </div>
        </article>
      ))}
    </div>
  );
}

/* =========================================================
   GUEST STATE
========================================================= */

function WishlistGuestState({ location }) {
  return (
    <main
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
      "
    >
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
            relative

            overflow-hidden

            rounded-[2rem]

            border
            border-brand-border

            bg-brand-surface

            px-6
            py-12

            sm:px-10
            sm:py-14
          "
        >
          {/* DECORATION */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -right-16
              -top-16

              h-44
              w-44

              rounded-full

              border
              border-brand-accent-fill/20
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -bottom-20
              -left-20

              h-48
              w-48

              rounded-full

              border
              border-brand-accent-fill/10
            "
          />

          <div className="relative z-10">
            <span
              className="
                mx-auto

                inline-flex
                h-16
                w-16

                items-center
                justify-center

                rounded-full

                bg-brand-accent-soft

                text-brand-accent-text
              "
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 29,
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

                text-brand-accent-text
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

                text-brand-text

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

                text-brand-text-muted
              "
            >
              Sign in to save your favorite pieces, revisit them anytime, and
              keep your Butterfly Dream wishlist across your devices.
            </p>

            <div
              className="
                mt-8

                flex
                flex-col

                items-center
                justify-center

                gap-3

                sm:flex-row
              "
            >
              <Link
                to="/login"
                state={{
                  from: `${location.pathname}${location.search}`,
                }}
                className="
                  inline-flex
                  min-h-12
                  w-fit

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-primary

                  px-6

                  text-sm
                  font-semibold

                  text-brand-surface

                  transition-all
                  duration-200

                  hover:bg-brand-primary-hover

                  active:scale-[0.98]
                "
              >
                Sign in
              </Link>

              <Link
                to="/products"
                className="
                  inline-flex
                  min-h-12
                  w-fit

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-brand-primary

                  bg-transparent

                  px-6

                  text-sm
                  font-semibold

                  text-brand-primary

                  transition-all
                  duration-200

                  hover:bg-brand-primary
                  hover:text-brand-surface

                  active:scale-[0.98]
                "
              >
                Explore collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function WishlistError({ error, reloadWishlist }) {
  return (
    <main
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
      "
    >
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
            rounded-[2rem]

            border
            border-brand-error/20

            bg-brand-surface

            px-6
            py-12

            sm:px-10
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

              bg-brand-error/10

              text-brand-error
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

              text-[0.62rem]
              font-bold
              uppercase

              tracking-[0.2em]

              text-brand-error
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

              leading-[0.98]

              tracking-[-0.04em]

              text-brand-text

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

              text-brand-text-muted
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
              min-h-12

              items-center
              justify-center

              gap-2

              rounded-full

              bg-brand-primary

              px-6

              text-sm
              font-semibold

              text-brand-surface

              transition-all

              hover:bg-brand-primary-hover

              active:scale-[0.98]
            "
          >
            <RefreshRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function WishlistEmptyState() {
  return (
    <div
      className="
        relative

        mt-10

        overflow-hidden

        rounded-[1.75rem]

        border
        border-dashed
        border-brand-border

        bg-brand-surface-soft

        px-6
        py-14

        text-center

        sm:py-16
      "
    >
      {/* DECORATION */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          -right-16
          -top-16

          h-44
          w-44

          rounded-full

          border
          border-brand-accent-fill/20
        "
      />

      <div className="relative z-10">
        <span
          className="
            mx-auto

            inline-flex
            h-16
            w-16

            items-center
            justify-center

            rounded-full

            bg-brand-surface

            text-brand-accent-text

            shadow-sm
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

            text-[0.6rem]
            font-bold
            uppercase

            tracking-[0.2em]

            text-brand-accent-text
          "
        >
          Your favorites
        </p>

        <h2
          className="
            mx-auto
            mt-2
            max-w-2xl

            font-display

            text-3xl
            font-medium

            leading-[1]

            tracking-[-0.04em]

            text-brand-text

            sm:text-4xl
          "
        >
          Your wishlist is waiting
          <span className="block italic">for its first piece.</span>
        </h2>

        <p
          className="
            mx-auto
            mt-4
            max-w-md

            text-sm
            leading-7

            text-brand-text-muted
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
            min-h-12

            items-center
            justify-center

            rounded-full

            bg-brand-primary

            px-6

            text-sm
            font-semibold

            text-brand-surface

            transition-all

            hover:bg-brand-primary-hover

            active:scale-[0.98]
          "
        >
          Explore collection
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   WISHLIST
========================================================= */

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

  /* =======================================================
     GUEST
  ======================================================= */

  if (isGuest) {
    return <WishlistGuestState location={location} />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (status === "error" || error) {
    return <WishlistError error={error} reloadWishlist={reloadWishlist} />;
  }

  const items = wishlist?.items ?? [];

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
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

                text-[0.6rem]
                font-bold
                uppercase

                tracking-[0.2em]

                text-brand-accent-text
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

                text-brand-text

                sm:text-6xl
              "
            >
              Pieces you
              <span
                className="
                  block
                  italic

                  text-brand-accent-text
                "
              >
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

                text-brand-text-muted
              "
            >
              A personal collection of the pieces that caught your eye and
              stayed with you.
            </p>
          </div>
        </header>

        {/* ==================================================
            SUMMARY
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
            <div
              className="
                flex
                items-center

                gap-2
              "
            >
              <FavoriteRoundedIcon
                sx={{
                  fontSize: 17,
                }}
                className="
                  text-brand-accent-text
                "
              />

              <p
                className="
                  text-sm

                  text-brand-text-muted
                "
              >
                <span
                  className="
                    font-semibold

                    text-brand-text
                  "
                >
                  {itemCount}
                </span>{" "}
                saved {itemCount === 1 ? "piece" : "pieces"}
              </p>
            </div>

            {itemCount > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="
                    hidden
                    h-1
                    w-1

                    rounded-full

                    bg-brand-border

                    sm:block
                  "
                />

                <p
                  className="
                    text-sm

                    text-brand-text-muted
                  "
                >
                  <span
                    className="
                      font-semibold

                      text-brand-text
                    "
                  >
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
          <section
            className="
                mt-8

                sm:mt-10
              "
          >
            {/* LIST HEADER */}

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
                      text-[0.58rem]
                      font-bold
                      uppercase

                      tracking-[0.18em]

                      text-brand-accent-text
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

                      text-brand-text

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
                    min-h-9
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    px-2

                    text-xs
                    font-semibold

                    text-brand-text-muted

                    transition-colors

                    hover:text-brand-text

                    sm:inline-flex
                  "
              >
                Continue shopping
              </Link>
            </div>

            {/* ============================================
                  PRODUCT GRID

                  Mobile:
                  one 350px card per row, centered.
              ============================================ */}

            <div
              className="
                  grid
                  grid-cols-1
                  justify-items-center

                  gap-y-8

                  sm:grid-cols-2
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

            {/* ============================================
                  MOBILE CONTINUE SHOPPING
              ============================================ */}

            <div
              className="
                  mt-10

                  text-center

                  sm:hidden
                "
            >
              <Link
                to="/products"
                className="
                    inline-flex
                    min-h-11

                    items-center
                    justify-center

                    rounded-full

                    border
                    border-brand-primary

                    bg-transparent

                    px-5

                    text-sm
                    font-semibold

                    text-brand-primary

                    transition-all

                    hover:bg-brand-primary
                    hover:text-brand-surface

                    active:scale-[0.98]
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
