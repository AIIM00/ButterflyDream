import { Link } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import WishlistToggleButton from "../wishlist/WishlistToggleButton.jsx";

/* =========================================================
   HELPERS
========================================================= */

function getDisplayPrice(product, defaultVariant) {
  if (defaultVariant?.price !== undefined && defaultVariant?.price !== null) {
    return `$${defaultVariant.price}`;
  }

  if (product.pricing?.hasPriceRange) {
    return `$${product.pricing.minimum} – $${product.pricing.maximum}`;
  }

  return `$${product.pricing?.minimum ?? 0}`;
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ image, product }) {
  if (!image?.imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-brand-surface-soft text-xs text-brand-text-muted">
        No image available
      </div>
    );
  }

  return (
    <img
      src={image.imageUrl}
      alt={image.altText || product.name}
      loading="lazy"
      className="
        h-full
        w-full
        object-cover
        transition-transform
        duration-500
        group-hover:scale-[1.035]
      "
    />
  );
}

/* =========================================================
   COMPACT CARD
========================================================= */

function CompactProductCard({ product, productUrl, primaryImage, price }) {
  return (
    <article
      className="
        group
        min-w-0
        w-full
        overflow-hidden
        rounded-[1.2rem]
        border
        border-brand-border
        bg-brand-surface
        shadow-[0_8px_24px_rgba(0,0,0,0.045)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_14px_32px_rgba(0,0,0,0.075)]
      "
    >
      {/* IMAGE */}
      <div
        className="
          relative
          aspect-square
          w-full
          overflow-hidden
          bg-brand-surface-soft
        "
      >
        <Link
          to={productUrl}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          <ProductImage image={primaryImage} product={product} />
        </Link>

        {/* WISHLIST ON IMAGE */}
        <div
          className="
            absolute
            right-1
            top-1
            z-10

            rounded-full
            bg-brand-surface/90
            shadow-[0_4px_14px_rgba(0,0,0,0.08)]
            backdrop-blur-sm
          "
        >
          <WishlistToggleButton productId={product.id} variant="default" />
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="
          flex
          min-h-[8.2rem]
          flex-col
          p-3

          sm:min-h-[9rem]
          sm:p-4
        "
      >
        {/* CATEGORY */}
        <p
          className="
            truncate
            text-[0.5rem]
            font-bold
            uppercase
            tracking-[0.15em]
            text-brand-bronze

            sm:text-[0.56rem]
          "
        >
          {product.category?.name ?? "Butterfly Dream"}
        </p>

        {/* NAME */}
        <Link to={productUrl} className="mt-1.5 block">
          <h3
            className="
              line-clamp-2
              min-h-[2.25rem]

              font-display
              text-[0.98rem]
              font-medium
              leading-[1.12]
              tracking-[-0.025em]
              text-brand-text

              transition-colors
              duration-300

              group-hover:text-brand-accent-text

              sm:min-h-[2.6rem]
              sm:text-[1.1rem]
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* PRICE + VIEW */}
        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-2
            pt-3
          "
        >
          <p
            className="
              min-w-0
              truncate
              font-display
              text-[0.95rem]
              font-semibold
              leading-none
              tracking-[-0.025em]
              text-brand-text

              sm:text-lg
            "
          >
            {price}
          </p>

          <Link
            to={productUrl}
            className="
              inline-flex
              shrink-0
              items-center
              gap-0.5

              text-[0.55rem]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-brand-text-muted

              transition-colors
              duration-200

              hover:text-brand-accent-text

              sm:text-[0.62rem]
            "
          >
            View piece
            <ArrowForwardRoundedIcon
              sx={{
                fontSize: 13,
              }}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   FEATURED EDITORIAL CARD
========================================================= */

function FeaturedProductCard({ product, productUrl, primaryImage, price }) {
  return (
    <article
      className="
        group
        col-span-2
        grid
        min-w-0
        w-full
        grid-cols-[44%_minmax(0,1fr)]

        overflow-hidden
        rounded-[1.5rem]

        border
        border-brand-accent-fill/25

        bg-brand-accent-soft

        shadow-[0_12px_32px_rgb(var(--theme-accent-fill)/0.12)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_18px_42px_rgb(var(--theme-accent-fill)/0.18)]

        sm:grid-cols-[42%_minmax(0,1fr)]
      "
    >
      {/* IMAGE */}
      <Link
        to={productUrl}
        aria-label={`View ${product.name}`}
        className="
          relative
          block
          min-h-[185px]
          overflow-hidden
          bg-brand-surface

          sm:min-h-[230px]
        "
      >
        <ProductImage image={primaryImage} product={product} />
      </Link>

      {/* CONTENT */}
      <div
        className="
          flex
          min-w-0
          flex-col
          p-3.5

          sm:p-6
        "
      >
        {/* CATEGORY + WISHLIST */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-2
          "
        >
          <p
            className="
              min-w-0
              truncate
              pt-2

              text-[0.5rem]
              font-bold
              uppercase
              tracking-[0.15em]
              text-brand-accent-text

              sm:text-[0.62rem]
            "
          >
            {product.category?.name ?? "Butterfly Dream"}
          </p>

          <div className="-mr-2 -mt-2 shrink-0">
            <WishlistToggleButton productId={product.id} variant="featured" />
          </div>
        </div>

        {/* NAME */}
        <Link
          to={productUrl}
          className="
            my-auto
            block
            py-3
          "
        >
          <h3
            className="
              line-clamp-3

              font-display
              text-[1.2rem]
              font-medium
              leading-[1.05]
              tracking-[-0.035em]
              text-brand-text

              transition-colors
              duration-300

              group-hover:text-brand-accent-text

              sm:text-2xl
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* PRICE + VIEW */}
        <div
          className="
            flex
            items-end
            justify-between
            gap-2
          "
        >
          <p
            className="
              min-w-0
              truncate

              font-display
              text-lg
              font-semibold
              leading-none
              tracking-[-0.035em]
              text-brand-text

              sm:text-2xl
            "
          >
            {price}
          </p>

          <Link
            to={productUrl}
            className="
              inline-flex
              shrink-0
              items-center
              gap-1

              text-[0.55rem]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-brand-accent-text

              transition
              hover:gap-1.5

              sm:text-[0.65rem]
            "
          >
            View piece
            <ArrowForwardRoundedIcon
              sx={{
                fontSize: 14,
              }}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product, layout = "compact" }) {
  const primaryImage = product.image ?? product.images?.[0] ?? null;

  const defaultVariant =
    product.defaultVariant ??
    product.variants?.find((variant) => variant.isDefault) ??
    product.variants?.[0] ??
    null;

  const price = getDisplayPrice(product, defaultVariant);

  const productUrl = `/products/${product.slug}`;

  if (layout === "featured") {
    return (
      <FeaturedProductCard
        product={product}
        productUrl={productUrl}
        primaryImage={primaryImage}
        price={price}
      />
    );
  }

  return (
    <CompactProductCard
      product={product}
      productUrl={productUrl}
      primaryImage={primaryImage}
      price={price}
    />
  );
}

export default ProductCard;
