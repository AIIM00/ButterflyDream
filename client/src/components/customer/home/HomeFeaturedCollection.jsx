import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import WishlistToggleButton from "../../wishlist/WishlistToggleButton.jsx";
import { usePublicProducts } from "../../../hooks/useCatalogData.js";
import formatCurrency from "../../../utils/formatCurrency.js";

function getProductPrice(product) {
  const minimum = product.pricing?.minimum;
  const maximum = product.pricing?.maximum;
  const currency = product.pricing?.currency ?? "USD";

  if (minimum === null || minimum === undefined) {
    return "Price unavailable";
  }

  const formattedMinimum = formatCurrency(minimum, currency);

  if (
    product.pricing?.hasPriceRange &&
    maximum !== null &&
    maximum !== undefined
  ) {
    return `${formattedMinimum} – ${formatCurrency(maximum, currency)}`;
  }

  return formattedMinimum;
}

function ProductImage({ product, priority = false, className = "" }) {
  const [hasImageError, setHasImageError] = useState(false);

  const image = product.image;
  const hasImage = Boolean(image?.imageUrl) && !hasImageError;

  if (!hasImage) {
    return (
      <div
        className={`
          flex h-full w-full flex-col items-center justify-center
          bg-brand-pale-champagne text-brand-bronze
          ${className}
        `}
      >
        <AutoAwesomeRoundedIcon aria-hidden="true" />

        <span className="mt-3 text-xs font-bold uppercase tracking-[0.18em]">
          Butterfly Dream
        </span>
      </div>
    );
  }

  return (
    <img
      src={image.imageUrl}
      alt={image.altText || product.name}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setHasImageError(true)}
      className={`
        h-full w-full object-cover
        transition-transform duration-700
        group-hover:scale-[1.025]
        motion-reduce:transition-none
        ${className}
      `}
    />
  );
}

function AvailabilityLabel({ inStock }) {
  return (
    <span
      className={`
        inline-flex items-center gap-2 text-xs font-semibold
        ${inStock ? "text-brand-forest" : "text-brand-error"}
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${inStock ? "bg-brand-success" : "bg-brand-error"}
        `}
        aria-hidden="true"
      />

      {inStock ? "Available" : "Out of stock"}
    </span>
  );
}

function FeaturedSpotlight({ product }) {
  return (
    <article
      className="
        group relative
        h-[390px]
        overflow-hidden
        rounded-[1.25rem]
        border border-brand-border/70
        bg-white
        shadow-[0_12px_35px_rgba(36,29,32,0.08)]

        sm:h-[460px]
        lg:h-[500px]
      "
    >
      <Link
        to={`/products/${product.slug}`}
        className="absolute inset-0"
        aria-label={`View ${product.name}`}
      >
        <ProductImage product={product} priority />
      </Link>

      {/* Featured label */}
      <span
        className="
          absolute left-3 top-3 z-10
          rounded-full
          bg-brand-forest/90
          px-3 py-1.5

          text-[0.55rem]
          font-bold
          uppercase
          tracking-[0.16em]
          text-white

          backdrop-blur-sm

          sm:left-4
          sm:top-4
          sm:text-[0.62rem]
        "
      >
        Featured
      </span>

      {/* Wishlist */}
      <WishlistToggleButton
        productId={product.id}
        className="
          absolute right-3 top-3 z-20

          !border-white/60
          !bg-white/85
          !text-brand-espresso
          !shadow-none

          backdrop-blur-md

          hover:!border-brand-champagne

          sm:right-4
          sm:top-4
        "
      />

      {/* Bottom information card */}
      <div
        className="
          absolute
          inset-x-3
          bottom-3
          z-10

          rounded-[1rem]
          border border-white/55
          bg-brand-cream/92

          p-4

          backdrop-blur-md

          sm:inset-x-4
          sm:bottom-4
          sm:p-5
        "
      >
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p
              className="
                text-[0.55rem]
                font-bold
                uppercase
                tracking-[0.16em]
                text-brand-bronze

                sm:text-[0.62rem]
              "
            >
              {product.category?.name || "Butterfly Dream"}
            </p>

            <h3
              className="
                mt-1.5
                line-clamp-1

                font-display
                text-[1.35rem]
                font-medium
                leading-tight
                tracking-[-0.03em]
                text-brand-espresso

                sm:text-[1.65rem]
              "
            >
              <Link to={`/products/${product.slug}`}>{product.name}</Link>
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <p
                className="
                  text-[0.78rem]
                  font-bold
                  text-brand-espresso

                  sm:text-sm
                "
              >
                {getProductPrice(product)}
              </p>

              <AvailabilityLabel inStock={product.inStock} />
            </div>
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-full

              bg-brand-forest
              text-white

              transition
              hover:bg-brand-emerald

              sm:h-10
              sm:w-10
            "
            aria-label={`Open ${product.name}`}
          >
            <ArrowOutwardRoundedIcon sx={{ fontSize: 18 }} />
          </Link>
        </div>
      </div>

      {/* subtle image gradient */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0

          bg-gradient-to-t
          from-brand-espresso/15
          via-transparent
          to-transparent
        "
        aria-hidden="true"
      />
    </article>
  );
}

function FeaturedProductCard({ product }) {
  return (
    <article
      className="
        group

        grid
        h-[125px]
        grid-cols-[6.5rem_minmax(0,1fr)]

        overflow-hidden

        rounded-[1rem]

        border
        border-brand-border/70

        bg-white

        shadow-[0_8px_24px_rgba(36,29,32,0.05)]

        sm:h-[145px]
        sm:grid-cols-[8rem_minmax(0,1fr)]

        lg:flex-1
      "
    >
      {/* Image */}
      <Link
        to={`/products/${product.slug}`}
        className="
          relative
          block
          h-full
          overflow-hidden
          bg-brand-pale-champagne
        "
        aria-label={`View ${product.name}`}
      >
        <ProductImage product={product} />
      </Link>

      {/* Content */}
      <div
        className="
          flex
          min-w-0
          flex-col

          p-3

          sm:p-4
        "
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className="
              truncate

              text-[0.5rem]
              font-bold
              uppercase
              tracking-[0.14em]
              text-brand-bronze

              sm:text-[0.58rem]
            "
          >
            {product.category?.name || "Collection"}
          </p>

          <WishlistToggleButton
            productId={product.id}
            className="
              -mr-1
              -mt-1

              !border-brand-border
              !bg-transparent
              !text-brand-espresso
              !shadow-none

              hover:!border-brand-champagne
            "
          />
        </div>

        <h3
          className="
            mt-1
            line-clamp-1

            font-display
            text-[1rem]
            font-medium
            leading-tight
            tracking-[-0.025em]
            text-brand-espresso

            sm:text-lg
          "
        >
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <p
          className="
            mt-1.5

            text-[0.7rem]
            font-bold
            text-brand-espresso

            sm:text-xs
          "
        >
          {getProductPrice(product)}
        </p>

        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-2
          "
        >
          <AvailabilityLabel inStock={product.inStock} />

          <Link
            to={`/products/${product.slug}`}
            className="
              inline-flex
              items-center
              gap-0.5

              text-[0.62rem]
              font-bold
              text-brand-bronze

              transition
              hover:text-brand-espresso

              sm:text-xs
            "
          >
            View
            <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedLoading() {
  return (
    <div
      className="
        mt-10 grid gap-5
        lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]
      "
    >
      <div
        className="
          min-h-[540px] animate-pulse
          border border-brand-border
          bg-brand-pale-champagne/90
          backdrop-blur-md
          sm:min-h-[640px]
        "
        aria-hidden="true"
      />

      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="
              min-h-[170px] flex-1 animate-pulse
              border border-brand-border
              bg-white/90 backdrop-blur-md
            "
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function HomeFeaturedCollection({ content }) {
  const selectionMode =
    content?.selectionMode === "manual" ? "manual" : "automatic";

  const requestedLimit = Number(content?.productLimit);

  const productLimit = Number.isFinite(requestedLimit)
    ? Math.min(4, Math.max(1, requestedLimit))
    : 4;

  const automaticQueryString = `featured=true&sort=newest&page=1&limit=${productLimit}`;

  const { data, error, isLoading } = usePublicProducts(automaticQueryString);

  const manualProducts = Array.isArray(content?.products)
    ? content.products.slice(0, 4)
    : [];

  const featuredProducts =
    selectionMode === "manual" ? manualProducts : (data?.products ?? []);

  const effectiveLoading = selectionMode === "automatic" ? isLoading : false;

  const effectiveError = selectionMode === "automatic" ? error : null;

  const spotlightProduct = featuredProducts[0] ?? null;

  const supportingProducts = featuredProducts.slice(1, 4);

  const eyebrow = content?.eyebrow || "Selected for you";

  const title = content?.title || "Pieces chosen to carry your story.";

  const description =
    content?.description ||
    "Discover signature Butterfly Dream accessories selected for their elegance, meaning, and ability to make an everyday moment feel personal.";

  const buttonText = content?.buttonText || "View featured pieces";

  const buttonUrl =
    typeof content?.buttonUrl === "string" &&
    content.buttonUrl.startsWith("/") &&
    !content.buttonUrl.startsWith("//")
      ? content.buttonUrl
      : "/products?featured=true";

  return (
    <section
      id="home-featured"
      className="relative isolate overflow-hidden section-spacing"
      aria-labelledby="home-featured-title"
      data-home-section="featured"
    >
      <div
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-gradient-to-b
          from-brand-ivory/92
          via-brand-ivory/72
          to-brand-cream/84
          backdrop-blur-[2px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute inset-x-0 top-0 -z-10
          h-24 bg-gradient-to-b
          from-brand-cream/80 to-transparent
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none absolute inset-x-0 bottom-0 -z-10
          h-24 bg-gradient-to-t
          from-brand-ivory/85 to-transparent
        "
        aria-hidden="true"
      />

      <div className="page-container relative z-10">
        <div
          className="
            flex flex-col gap-6
            sm:flex-row sm:items-end sm:justify-between
          "
        >
          <div
            className="
              
              
            "
          >
            {eyebrow && <p className="eyebrow-text">{eyebrow}</p>}

            <h2 id="home-featured-title" className="section-heading mt-4">
              {title}
            </h2>
            {description && (
              <p className="body-large mt-5 max-w-xl">{description}</p>
            )}
          </div>
        </div>

        {effectiveLoading && <FeaturedLoading />}

        {!effectiveLoading && effectiveError && (
          <div
            className="
              mt-10 border border-brand-border
              bg-white/90 px-6 py-14 text-center
              backdrop-blur-md sm:px-10
            "
          >
            <h3 className="font-display text-2xl font-medium text-brand-espresso">
              The featured edit is unavailable right now.
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-brand-muted">
              You can still explore the complete Butterfly Dream collection.
            </p>

            <Link
              to="/products"
              className="button-base button-primary mt-6 w-fit rounded-full"
            >
              Shop all products
              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          </div>
        )}

        {!effectiveLoading && !effectiveError && !spotlightProduct && (
          <div
            className="
              mt-10 border border-brand-border
              bg-white/90 px-6 py-14 text-center
              backdrop-blur-md sm:px-10
            "
          >
            <p className="eyebrow-text">Coming soon</p>

            <h3 className="mt-4 font-display text-3xl font-medium text-brand-espresso">
              Our next signature edit is taking shape.
            </h3>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-brand-muted">
              Featured pieces will appear here when products are marked as
              featured in the admin catalog.
            </p>

            <Link
              to="/products"
              className="button-base button-outline mt-6 w-fit rounded-full"
            >
              Explore all products
            </Link>
          </div>
        )}

        {!effectiveLoading && !effectiveError && spotlightProduct && (
          <div
            className={
              supportingProducts.length > 0
                ? `
                    mt-10 grid gap-5
                    lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]
                  `
                : "mt-10"
            }
          >
            <FeaturedSpotlight product={spotlightProduct} />

            {supportingProducts.length > 0 && (
              <div className="flex flex-col gap-5">
                {supportingProducts.map((product) => (
                  <FeaturedProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          {buttonText && (
            <Link
              to={buttonUrl}
              className="
      button-base button-outline
      hidden w-fit shrink-0 rounded-full
      bg-brand-ivory/80 backdrop-blur-md
      sm:inline-flex
    "
            >
              {buttonText}

              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default HomeFeaturedCollection;
