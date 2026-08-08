import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import WishlistToggleButton from "../../wishlist/WishlistToggleButton.jsx";
import { usePublicProducts } from "../../../hooks/useCatalogData.js";
import formatCurrency from "../../../utils/formatCurrency.js";

const FEATURED_QUERY_STRING = "featured=true&sort=newest&page=1&limit=4";

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
        group relative min-h-[540px] overflow-hidden
        border border-brand-border bg-white
        shadow-sm sm:min-h-[640px]
      "
    >
      <Link
        to={`/products/${product.slug}`}
        className="absolute inset-0"
        aria-label={`View ${product.name}`}
      >
        <ProductImage product={product} priority />
      </Link>

      <span
        className="
          absolute left-4 top-4 rounded-full
          bg-brand-forest px-4 py-2
          text-[0.68rem] font-bold uppercase
          tracking-[0.18em] text-white
          sm:left-6 sm:top-6
        "
      >
        Featured
      </span>

      <WishlistToggleButton
        productId={product.id}
        className="
          absolute right-4 top-4 z-10
          !border-brand-border
          !bg-brand-cream/95
          !text-brand-espresso
          !shadow-none
          hover:!border-brand-champagne
          sm:right-6 sm:top-6
        "
      />

      <div
        className="
          absolute inset-x-4 bottom-4
          border border-white/50
          bg-brand-cream/95 p-5
          backdrop-blur-md
          sm:inset-x-6 sm:bottom-6 sm:p-7
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="
                text-xs font-bold uppercase
                tracking-[0.18em] text-brand-bronze
              "
            >
              {product.category?.name || "Butterfly Dream"}
            </p>

            <h3
              className="
                mt-3 font-display
                text-[2rem] font-medium leading-[1.02]
                tracking-[-0.04em] text-brand-espresso
                sm:text-[2.75rem]
              "
            >
              <Link to={`/products/${product.slug}`}>{product.name}</Link>
            </h3>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="text-base font-bold text-brand-espresso sm:text-lg">
                {getProductPrice(product)}
              </p>

              <AvailabilityLabel inStock={product.inStock} />
            </div>
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-full bg-brand-forest text-white
              transition-colors hover:bg-brand-emerald
            "
            aria-label={`Open ${product.name}`}
          >
            <ArrowOutwardRoundedIcon fontSize="small" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedProductCard({ product }) {
  return (
    <article
      className="
        group grid min-h-[170px]
        grid-cols-[7.5rem_minmax(0,1fr)]
        overflow-hidden border border-brand-border bg-white
        shadow-sm
        sm:grid-cols-[10rem_minmax(0,1fr)]
        lg:min-h-0 lg:flex-1
      "
    >
      <Link
        to={`/products/${product.slug}`}
        className="
          relative block min-h-full overflow-hidden
          bg-brand-pale-champagne
        "
        aria-label={`View ${product.name}`}
      >
        <ProductImage product={product} />
      </Link>

      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p
            className="
              truncate text-[0.68rem] font-bold uppercase
              tracking-[0.16em] text-brand-bronze
            "
          >
            {product.category?.name || "Collection"}
          </p>

          <WishlistToggleButton
            productId={product.id}
            className="
              -mr-1 -mt-1
              !border-brand-border
              !bg-white
              !text-brand-espresso
              !shadow-none
              hover:!border-brand-champagne
            "
          />
        </div>

        <h3
          className="
            mt-2 line-clamp-2 font-display
            text-xl font-medium leading-tight
            tracking-[-0.025em] text-brand-espresso
            sm:text-2xl
          "
        >
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="mt-3 text-sm font-bold text-brand-espresso">
          {getProductPrice(product)}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <AvailabilityLabel inStock={product.inStock} />

          <Link
            to={`/products/${product.slug}`}
            className="
              inline-flex min-h-11 items-center gap-1.5
              rounded-full px-1
              text-sm font-bold text-brand-bronze
              transition-colors hover:text-brand-bronze-hover
            "
            aria-label={`View details for ${product.name}`}
          >
            View
            <ArrowForwardRoundedIcon fontSize="small" />
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

function HomeFeaturedCollection() {
  const { data, error, isLoading } = usePublicProducts(FEATURED_QUERY_STRING);

  const featuredProducts = data?.products ?? [];
  const spotlightProduct = featuredProducts[0] ?? null;
  const supportingProducts = featuredProducts.slice(1, 4);

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
              max-w-2xl rounded-[1.5rem]
              border border-white/45
              bg-brand-ivory/68 p-5
              backdrop-blur-md sm:p-7
            "
          >
            <p className="eyebrow-text">Selected for you</p>

            <h2 id="home-featured-title" className="section-heading mt-4">
              Pieces chosen to carry your story.
            </h2>

            <p className="body-large mt-5 max-w-xl">
              Discover signature Butterfly Dream accessories selected for their
              elegance, meaning, and ability to make an everyday moment feel
              personal.
            </p>
          </div>

          <Link
            to="/products?featured=true"
            className="
              button-base button-outline
              hidden w-fit shrink-0 rounded-full
              bg-brand-ivory/80 backdrop-blur-md
              sm:inline-flex
            "
          >
            View featured pieces
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
        </div>

        {isLoading && <FeaturedLoading />}

        {!isLoading && error && (
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

        {!isLoading && !error && !spotlightProduct && (
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

        {!isLoading && !error && spotlightProduct && (
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
          <Link
            to="/products?featured=true"
            className="
              button-base button-outline
              w-fit rounded-full
              bg-brand-ivory/80 backdrop-blur-md
            "
          >
            View featured pieces
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeFeaturedCollection;
