import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// MUI Icons
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

// Components
import WishlistToggleButton from "../wishlist/WishlistToggleButton.jsx";

/* =========================================================
   HELPERS
========================================================= */

function getSortedImages(product) {
  return [...(product.images ?? [])].sort(
    (firstImage, secondImage) =>
      Number(firstImage.position ?? 0) - Number(secondImage.position ?? 0),
  );
}

function getDefaultVariant(product) {
  return (
    product.variants?.find((variant) => variant.isDefault) ??
    product.variants?.[0] ??
    null
  );
}

function getDisplayPrice(product, defaultVariant) {
  if (defaultVariant?.price !== undefined && defaultVariant?.price !== null) {
    return `$${defaultVariant.price}`;
  }

  if (product.pricing?.hasPriceRange) {
    return `$${product.pricing.minimum} – $${product.pricing.maximum}`;
  }

  return `$${product.pricing?.minimum ?? 0}`;
}

function getShortDescription(product) {
  if (!product.description?.trim()) {
    return "A refined piece designed to become part of your story.";
  }

  return product.description.trim();
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product }) {
  const images = useMemo(() => getSortedImages(product), [product]);

  const defaultVariant = useMemo(() => getDefaultVariant(product), [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = images[activeImageIndex] ?? images[0] ?? null;

  const price = getDisplayPrice(product, defaultVariant);

  const description = getShortDescription(product);

  const isFeatured = Boolean(product.isFeatured);

  const productUrl = `/products/${product.slug}`;

  return (
    <article
      className={`
        group
        relative

        w-[350px]
        max-w-full

        overflow-hidden

        rounded-[1.75rem]

        border

        p-4

        transition-all
        duration-300

        hover:-translate-y-1

        ${
          isFeatured
            ? `
                border-brand-accent-fill/35
                bg-brand-accent-soft

                shadow-[0_14px_35px_rgb(var(--theme-accent-fill)/0.16)]

                hover:shadow-[0_20px_45px_rgb(var(--theme-accent-fill)/0.22)]
              `
            : `
                border-brand-border
                bg-brand-surface-soft

                shadow-[0_10px_26px_rgba(0,0,0,0.05)]

                hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]
              `
        }
      `}
    >
      {/* ==================================================
          TOP AREA
      ================================================== */}

      <div
        className="
          mb-3
          flex
          min-h-9
          items-center
          justify-between
          gap-3
        "
      >
        {/* FEATURED LABEL */}

        {isFeatured ? (
          <span
            className="
              inline-flex
              items-center
              gap-1.5

              rounded-full

              bg-brand-accent-fill/15

              px-3
              py-1.5

              text-[0.58rem]
              font-bold
              uppercase
              tracking-[0.12em]

              text-brand-accent-text
            "
          >
            <AutoAwesomeRoundedIcon
              sx={{
                fontSize: 12,
              }}
            />
            Featured product
          </span>
        ) : (
          /*
           * Empty element keeps the wishlist
           * aligned to the right on normal cards.
           */
          <span aria-hidden="true" />
        )}

        {/* WISHLIST */}

        <WishlistToggleButton
          productId={product.id}
          variant={isFeatured ? "featured" : "default"}
        />
      </div>

      {/* ==================================================
          IMAGE FRAME
      ================================================== */}

      <div
        className={`
          rounded-[1.35rem]

          p-2.5

          ${
            isFeatured
              ? `
                  bg-brand-accent-fill/10

                  shadow-[0_8px_24px_rgb(var(--theme-accent-fill)/0.18)]
                `
              : `
                  bg-brand-surface

                  shadow-[inset_0_4px_12px_rgba(0,0,0,0.09)]
                `
          }
        `}
      >
        <Link
          to={productUrl}
          aria-label={`View ${product.name}`}
          className="
            block

            overflow-hidden

            rounded-[1rem]

            bg-brand-surface
          "
        >
          <div
            className="
              aspect-square
              overflow-hidden
            "
          >
            {activeImage ? (
              <img
                src={activeImage.imageUrl}
                alt={activeImage.altText || product.name}
                loading="lazy"
                className="
                  h-full
                  w-full

                  object-contain

                  transition-transform
                  duration-500

                  group-hover:scale-[1.035]
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full

                  items-center
                  justify-center

                  px-4

                  text-center
                  text-sm

                  text-brand-text-muted
                "
              >
                No image available
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* ==================================================
          IMAGE SWITCHER
      ================================================== */}

      {images.length > 1 && (
        <div
          className="
            mt-3

            flex
            min-h-6

            items-center
            justify-center

            gap-1
          "
        >
          {images.map((image, index) => {
            const isActive = activeImageIndex === index;

            return (
              <button
                key={image.id ?? `${product.id}-${index}`}
                type="button"
                aria-label={`Show ${product.name} image ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => setActiveImageIndex(index)}
                className="
                    flex
                    h-6
                    min-w-6

                    items-center
                    justify-center

                    rounded-full

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-accent-fill/40
                  "
              >
                <span
                  className={`
                      block

                      h-1.5

                      rounded-full

                      transition-all
                      duration-300

                      ${
                        isActive
                          ? isFeatured
                            ? `
                                w-4
                                bg-brand-accent-text
                              `
                            : `
                                w-4
                                bg-brand-primary
                              `
                          : isFeatured
                            ? `
                                w-1.5
                                bg-brand-accent-fill/40
                              `
                            : `
                                w-1.5
                                bg-brand-text-muted/30
                              `
                      }
                    `}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ==================================================
          PRODUCT INFORMATION
      ================================================== */}

      <div className={images.length > 1 ? "mt-2" : "mt-4"}>
        {/* CATEGORY */}

        <p
          className={`
            text-[0.58rem]

            font-bold
            uppercase

            tracking-[0.16em]

            ${isFeatured ? "text-brand-accent-text" : "text-brand-text-muted"}
          `}
        >
          {product.category?.name ?? "Butterfly Dream"}
        </p>

        {/* PRODUCT NAME */}

        <Link to={productUrl} className="block">
          <h3
            className="
              mt-2

              line-clamp-2

              font-display

              text-[1.45rem]
              font-medium

              leading-[1.05]

              tracking-[-0.035em]

              text-brand-text

              transition-colors
              duration-300

              group-hover:text-brand-accent-text
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* DESCRIPTION */}

        <p
          className="
            mt-2

            line-clamp-2

            text-[0.8rem]

            leading-5

            text-brand-text-muted
          "
        >
          {description}
        </p>
      </div>

      {/* ==================================================
          PRICE + ACTION
      ================================================== */}

      <div
        className="
          mt-6

          flex

          items-center
          justify-between

          gap-3
        "
      >
        {/* PRICE */}

        <div className="min-w-0">
          <p
            className="
              text-[0.52rem]

              font-semibold
              uppercase

              tracking-[0.12em]

              text-brand-text-muted
            "
          >
            Price
          </p>

          <p
            className="
              mt-1

              font-display

              text-[1.65rem]
              font-semibold

              leading-none

              tracking-[-0.04em]

              text-brand-text
            "
          >
            {price}
          </p>
        </div>

        {/* ADD TO CART */}

        <Link
          to={productUrl}
          className={`
            inline-flex

            min-h-11
            shrink-0

            items-center
            justify-center

            gap-2

            rounded-full

            px-4
            py-2.5

            text-[0.72rem]
            font-semibold

            transition-all
            duration-300

            active:scale-[0.98]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-accent-fill/40
            focus-visible:ring-offset-2

            ${
              isFeatured
                ? `
        bg-brand-accent-text
        text-brand-surface

        hover:bg-brand-accent-text-hover
      `
                : `
        bg-brand-primary
        text-brand-surface

        hover:bg-brand-primary-hover
      `
            }
          `}
        >
          <ShoppingBagOutlinedIcon
            sx={{
              fontSize: 16,
            }}
          />
          Add to cart
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
