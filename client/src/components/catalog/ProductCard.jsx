import { Link } from "react-router-dom";

// MUI Icons
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

// Components
import WishlistToggleButton from "../wishlist/WishlistToggleButton.jsx";
import StockBadge from "./StockBadge.jsx";

const MAX_VISIBLE_COLORS = 5;
const MAX_VISIBLE_SIZES = 5;

function getProductPrice(product) {
  const minimum = product.pricing?.minimum;
  const maximum = product.pricing?.maximum;

  if (minimum === null || minimum === undefined) {
    return "Price unavailable";
  }

  if (
    product.pricing?.hasPriceRange &&
    maximum !== null &&
    maximum !== undefined
  ) {
    return `$${minimum} – $${maximum}`;
  }

  return `$${minimum}`;
}

function getProductVariants(product) {
  /*
   * Support either full variants or a future
   * lightweight variant preview from the API.
   */
  if (Array.isArray(product.variants)) {
    return product.variants;
  }

  if (Array.isArray(product.variantPreview)) {
    return product.variantPreview;
  }

  return [];
}

function getUniqueOptions(variants, nameKey, colorKey = null) {
  const seen = new Set();

  return variants.reduce((result, variant) => {
    const options =
      variant?.options && typeof variant.options === "object"
        ? variant.options
        : {};

    const name = options[nameKey];

    if (!name || seen.has(String(name).toLowerCase())) {
      return result;
    }

    seen.add(String(name).toLowerCase());

    result.push({
      name: String(name),

      color: colorKey ? (options[colorKey] ?? null) : null,
    });

    return result;
  }, []);
}

function getUniqueSizes(variants) {
  const sizes = [];
  const seen = new Set();

  for (const variant of variants) {
    const options =
      variant?.options && typeof variant.options === "object"
        ? variant.options
        : {};

    const size = options.size;

    if (size === undefined || size === null || String(size).trim() === "") {
      continue;
    }

    const value = String(size).trim();

    const key = value.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    sizes.push({
      value,
      type: options.sizeType ?? null,
    });
  }

  return sizes;
}

function ColorSwatch({ name, color, type = "Metal" }) {
  return (
    <span
      className="
        relative
        flex h-7 w-7
        items-center
        justify-center
        rounded-full
        border
        border-[var(--color-warm-light-gray)]
        bg-white
      "
      title={`${type}: ${name}`}
      aria-label={`${type}: ${name}`}
    >
      <span
        className="
          h-[18px] w-[18px]
          rounded-full
          border border-black/10
        "
        style={{
          backgroundColor: color || "#E6DFDA",
        }}
        aria-hidden="true"
      />
    </span>
  );
}

function OptionSwatches({ label, options, type }) {
  if (options.length === 0) {
    return null;
  }

  const visible = options.slice(0, MAX_VISIBLE_COLORS);

  const hiddenCount = options.length - visible.length;

  return (
    <div>
      <p
        className="
          text-[0.65rem]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-[var(--color-warm-gray)]
        "
      >
        {label}
      </p>

      <div
        className="
          mt-2
          flex flex-wrap
          items-center
          gap-1.5
        "
      >
        {visible.map((option) => (
          <ColorSwatch
            key={option.name}
            name={option.name}
            color={option.color}
            type={type}
          />
        ))}

        {hiddenCount > 0 && (
          <span
            className="
              ml-1
              text-xs
              font-semibold
              text-[var(--color-warm-gray)]
            "
          >
            +{hiddenCount}
          </span>
        )}
      </div>
    </div>
  );
}

function ProductSizes({ sizes }) {
  if (sizes.length === 0) {
    return null;
  }

  const visible = sizes.slice(0, MAX_VISIBLE_SIZES);

  const hiddenCount = sizes.length - visible.length;

  return (
    <div>
      <p
        className="
          text-[0.65rem]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-[var(--color-warm-gray)]
        "
      >
        Size
      </p>

      <div
        className="
          mt-2
          flex flex-wrap
          items-center
          gap-1.5
        "
      >
        {visible.map((size) => (
          <span
            key={size.value}
            className="
              inline-flex
              min-h-8
              min-w-8
              items-center
              justify-center
              rounded-full
              border
              border-[var(--color-warm-light-gray)]
              bg-white
              px-2.5
              text-xs
              font-semibold
              text-[var(--color-deep-espresso)]
            "
          >
            {size.value}
          </span>
        ))}

        {hiddenCount > 0 && (
          <span
            className="
              text-xs
              font-semibold
              text-[var(--color-warm-gray)]
            "
          >
            +{hiddenCount}
          </span>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const image = product.image;

  const variants = getProductVariants(product);

  const metalColors = getUniqueOptions(variants, "metalColor", "metalColorHex");

  const stoneColors = getUniqueOptions(variants, "stoneColor", "stoneColorHex");

  const sizes = getUniqueSizes(variants);

  const hasStructuredOptions =
    metalColors.length > 0 || stoneColors.length > 0 || sizes.length > 0;

  return (
    <article
      className="
        group
        relative
        flex h-full
        flex-col
        overflow-hidden
        border
        border-[var(--color-warm-light-gray)]
        bg-white
        transition
        duration-300
        hover:border-[var(--color-antique-champagne)]
      "
    >
      {/* IMAGE */}

      <div className="relative">
        <WishlistToggleButton
          productId={product.id}
          className="
            absolute
            right-3 top-3
            z-20
          "
        />

        <Link
          to={`/products/${product.slug}`}
          className="
            relative
            block
            aspect-[4/5]
            overflow-hidden
            bg-[var(--color-soft-ivory)]
          "
          aria-label={`View ${product.name}`}
        >
          {image?.imageUrl ? (
            <img
              src={image.imageUrl}
              alt={image.altText || product.name}
              loading="lazy"
              className="
                h-full w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.025]
              "
            />
          ) : (
            <div
              className="
                flex h-full
                flex-col
                items-center
                justify-center
                gap-3
                text-[var(--color-warm-gray)]
              "
            >
              <ImageNotSupportedOutlinedIcon
                sx={{
                  fontSize: 44,
                }}
              />

              <span className="text-sm font-medium">Product image</span>
            </div>
          )}

          {product.isFeatured && (
            <span
              className="
                absolute
                left-3 top-3
                rounded-full
                bg-[var(--color-deep-espresso)]
                px-3 py-1.5
                text-[0.65rem]
                font-bold
                uppercase
                tracking-[0.14em]
                text-white
              "
            >
              Featured
            </span>
          )}
        </Link>
      </div>

      {/* INFORMATION */}

      <div
        className="
          flex flex-1
          flex-col
          px-4 pb-4 pt-4
          sm:px-5 sm:pb-5
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <p
            className="
              text-[0.68rem]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-[var(--color-burnished-bronze)]
            "
          >
            {product.category?.name || "Butterfly Dream"}
          </p>

          <StockBadge status={product.inStock} compact />
        </div>

        {/* NAME */}

        <h2
          className="
            mt-2
            font-display
            text-[1.35rem]
            font-medium
            leading-tight
            tracking-[-0.025em]
            text-[var(--color-deep-espresso)]
            sm:text-[1.5rem]
          "
        >
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h2>

        {/* PRICE */}

        <p
          className="
            mt-2
            text-sm
            font-bold
            text-[var(--color-deep-espresso)]
          "
        >
          {getProductPrice(product)}
        </p>

        {/* STRUCTURED OPTIONS */}

        {hasStructuredOptions && (
          <div
            className="
              mt-5
              space-y-4
              border-t
              border-[var(--color-warm-light-gray)]
              pt-4
            "
          >
            <OptionSwatches label="Metal" options={metalColors} type="Metal" />

            <OptionSwatches label="Stone" options={stoneColors} type="Stone" />

            <ProductSizes sizes={sizes} />
          </div>
        )}

        {/* FALLBACK UNTIL CATALOG API RETURNS OPTIONS */}

        {!hasStructuredOptions && product.activeVariantCount > 1 && (
          <p
            className="
                mt-4
                text-xs
                font-medium
                text-[var(--color-warm-gray)]
              "
          >
            {product.activeVariantCount} options available
          </p>
        )}

        {/* ACTION */}

        <div className="mt-auto pt-5">
          <Link
            to={`/products/${product.slug}`}
            className="
              inline-flex
              min-h-11
              w-fit
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[var(--color-deep-espresso)]
              px-5
              text-sm
              font-semibold
              text-white
              transition-colors
              hover:bg-[var(--color-dark-bronze)]
            "
          >
            View options
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
