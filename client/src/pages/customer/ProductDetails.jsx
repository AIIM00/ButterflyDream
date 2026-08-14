import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

// Components
import ProductImageGallery from "../../components/catalog/ProductImageGallery.jsx";
import StockBadge from "../../components/catalog/StockBadge.jsx";
import VariantSelector from "../../components/catalog/VariantSelector.jsx";
import WishlistToggleButton from "../../components/wishlist/WishlistToggleButton.jsx";
import AddToCartSection from "../../components/cart/AddToCartSection.jsx";

// Hooks
import { usePublicProduct } from "../../hooks/useCatalogData.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function ProductDetailsLoading() {
  return (
    <main className="min-h-screen bg-brand-ivory">
      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-20
          pt-8

          sm:px-6
          sm:pt-10

          lg:px-8
          lg:pb-28
          lg:pt-14
        "
      >
        <div className="mb-8 h-4 w-52 animate-pulse rounded-full bg-brand-cream" />

        <div
          className="
            grid
            gap-10

            lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]
            lg:gap-16
          "
        >
          <div
            className="
              aspect-[4/5]
              animate-pulse
              rounded-[1.75rem]
              bg-brand-cream

              sm:aspect-square
            "
          />

          <div className="space-y-5 py-2 lg:py-6">
            <div className="h-3 w-28 animate-pulse rounded bg-brand-cream" />

            <div className="h-16 w-4/5 animate-pulse rounded-xl bg-brand-cream" />

            <div className="h-8 w-36 animate-pulse rounded bg-brand-cream" />

            <div className="h-24 animate-pulse rounded-2xl bg-brand-cream" />

            <div className="h-44 animate-pulse rounded-2xl bg-brand-cream" />

            <div className="h-14 animate-pulse rounded-full bg-brand-cream" />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductDetailsContent({ product }) {
  const defaultVariant =
    product.variants.find((variant) => variant.isDefault) ??
    product.variants[0] ??
    null;

  const initialImage =
    product.images.find((image) => image.isPrimary) ??
    product.images[0] ??
    null;

  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? "",
  );

  const [selectedImageId, setSelectedImageId] = useState(
    initialImage?.id ?? "",
  );

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant;

  function handleVariantSelect(variantId) {
    setSelectedVariantId(variantId);

    const variantImages = product.images
      .filter((image) => image.variantId === variantId)
      .sort(
        (first, second) =>
          Number(first.position ?? 0) - Number(second.position ?? 0),
      );

    if (variantImages.length > 0) {
      setSelectedImageId(variantImages[0].id);

      return;
    }

    const fallbackImage =
      product.images.find((image) => image.isPrimary && !image.variantId) ??
      product.images.find((image) => !image.variantId) ??
      product.images.find((image) => image.isPrimary) ??
      product.images[0];

    setSelectedImageId(fallbackImage?.id ?? "");
  }

  const displayPrice = selectedVariant
    ? `$${selectedVariant.price}`
    : product.pricing.hasPriceRange
      ? `$${product.pricing.minimum} – $${product.pricing.maximum}`
      : `$${product.pricing.minimum}`;

  return (
    <main className="min-h-screen bg-brand-ivory">
      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-20
          pt-6

          sm:px-6
          sm:pt-8

          lg:px-8
          lg:pb-28
          lg:pt-10
        "
      >
        {/* BREADCRUMB */}
        <nav
          className="
            mb-7
            flex
            flex-wrap
            items-center
            gap-2
            text-[0.65rem]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-brand-muted

            sm:mb-9
          "
        >
          <Link
            to="/products"
            className="
              transition
              hover:text-brand-espresso
            "
          >
            Shop
          </Link>

          <span className="text-brand-border">/</span>

          <Link
            to={`/products?category=${product.category.slug}`}
            className="
              transition
              hover:text-brand-espresso
            "
          >
            {product.category.name}
          </Link>

          <span className="text-brand-border">/</span>

          <span className="max-w-[12rem] truncate text-brand-espresso sm:max-w-none">
            {product.name}
          </span>
        </nav>

        <div
          className="
            grid
            gap-10

            lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
            lg:gap-16

            xl:gap-20
          "
        >
          {/* ==================================================
              PRODUCT IMAGES
          ================================================== */}
          <div className="min-w-0">
            <ProductImageGallery
              productName={product.name}
              images={product.images}
              selectedImageId={selectedImageId}
              selectedVariantId={selectedVariantId}
              onImageSelect={setSelectedImageId}
            />
          </div>

          {/* ==================================================
              PRODUCT INFO
          ================================================== */}
          <div
            className="
              min-w-0

              lg:sticky
              lg:top-24
              lg:self-start
              lg:py-2
            "
          >
            {/* CATEGORY / FEATURED */}
            <div className="flex flex-wrap items-center gap-3">
              <p
                className="
                  text-[0.65rem]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-brand-bronze
                "
              >
                {product.category.name}
              </p>

              {product.isFeatured && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-brand-pale-champagne
                    px-3
                    py-1.5
                    text-[0.6rem]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-brand-espresso
                  "
                >
                  <AutoAwesomeOutlinedIcon
                    sx={{
                      fontSize: 14,
                    }}
                  />
                  Featured
                </span>
              )}
            </div>

            {/* TITLE */}
            <div className="mt-4">
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <h1
                  className="
                    min-w-0
                    flex-1
                    font-display
                    text-[2.75rem]
                    font-medium
                    leading-[0.95]
                    tracking-[-0.045em]
                    text-brand-espresso

                    sm:text-5xl

                    lg:text-[3.4rem]
                  "
                >
                  {product.name}
                </h1>

                <div className="shrink-0 pt-1">
                  <WishlistToggleButton productId={product.id} showLabel />
                </div>
              </div>

              {/* PRICE */}
              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <p
                  className="
                    font-display
                    text-3xl
                    font-medium
                    tracking-[-0.035em]
                    text-brand-espresso

                    sm:text-4xl
                  "
                >
                  {displayPrice}
                </p>

                <StockBadge
                  status={selectedVariant?.stockStatus ?? product.inStock}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div
                className="
                  mt-7
                  border-y
                  border-brand-border
                  py-6
                "
              >
                <p
                  className="
                    whitespace-pre-line
                    text-sm
                    leading-7
                    text-brand-muted

                    sm:text-[0.95rem]
                  "
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* VARIANTS */}
            <section className="mt-7">
              <p
                className="
                  mb-4
                  text-[0.62rem]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-brand-bronze
                "
              >
                Choose your piece
              </p>

              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onVariantSelect={handleVariantSelect}
              />
            </section>

            {/* OUT OF STOCK */}
            {selectedVariant && !selectedVariant.inStock && (
              <div
                className="
                  mt-5
                  flex
                  items-start
                  gap-3
                  rounded-[1.25rem]
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-4
                  text-sm
                  font-medium
                  leading-6
                  text-red-700
                "
              >
                <ErrorOutlineRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  The selected option is currently out of stock. You can choose
                  another available option.
                </span>
              </div>
            )}

            {/* CART */}
            <div className="mt-7">
              <AddToCartSection selectedVariant={selectedVariant} />
            </div>

            {/* TRUST / DELIVERY */}
            <div
              className="
                mt-8
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <div
                className="
                  rounded-[1.4rem]
                  border
                  border-brand-border
                  bg-brand-cream
                  p-4
                "
              >
                <span
                  className="
                    inline-flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <LocalShippingOutlinedIcon fontSize="small" />
                </span>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-brand-espresso
                  "
                >
                  Delivery in Lebanon
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-brand-muted
                  "
                >
                  Your order is prepared carefully and delivered through our
                  courier partner.
                </p>
              </div>

              <div
                className="
                  rounded-[1.4rem]
                  border
                  border-brand-border
                  bg-brand-cream
                  p-4
                "
              >
                <span
                  className="
                    inline-flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-brand-bronze
                  "
                >
                  <PaymentsOutlinedIcon fontSize="small" />
                </span>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-brand-espresso
                  "
                >
                  Cash on delivery
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-brand-muted
                  "
                >
                  Pay in USD when your Butterfly Dream order arrives.
                </p>
              </div>
            </div>

            {/* SMALL CONFIDENCE STRIP */}
            <div
              className="
                mt-4
                flex
                items-start
                gap-3
                rounded-[1.25rem]
                bg-brand-espresso
                px-4
                py-4
                text-brand-cream
              "
            >
              <VerifiedOutlinedIcon
                sx={{
                  fontSize: 19,
                }}
                className="mt-0.5 shrink-0 text-brand-champagne"
              />

              <div>
                <p className="text-sm font-semibold">Chosen with intention.</p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-brand-cream/65
                  "
                >
                  Each piece is prepared as part of your Butterfly Dream story.
                </p>
              </div>
            </div>

            {/* BACK */}
            <Link
              to="/products"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-brand-muted
                transition
                hover:text-brand-espresso
              "
            >
              <ArrowBackRoundedIcon fontSize="small" />
              Back to collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductDetails() {
  const { slug } = useParams();

  const { product, error, isLoading } = usePublicProduct(slug ?? "");

  if (isLoading) {
    return <ProductDetailsLoading />;
  }

  if (error) {
    const statusCode = error.response?.status;

    return (
      <main
        className="
          min-h-screen
          bg-brand-ivory
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
          <span
            className="
              mx-auto
              inline-flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-brand-cream
              text-brand-bronze
            "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 32,
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
              text-brand-bronze
            "
          >
            Butterfly Dream
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
            {statusCode === 404
              ? "This piece could not be found."
              : "We couldn't load this piece."}
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
            {getApiErrorMessage(error, "The product could not be loaded.")}
          </p>

          <Link
            to="/products"
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
            <ArrowBackRoundedIcon fontSize="small" />
            Browse collection
          </Link>
        </section>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return <ProductDetailsContent key={product.id} product={product} />;
}

export default ProductDetails;
