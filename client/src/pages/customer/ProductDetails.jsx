import { useState } from "react";
import { Link, useParams } from "react-router-dom";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

// Components
import AddToCartSection from "../../components/cart/AddToCartSection.jsx";
import ProductImageGallery from "../../components/catalog/ProductImageGallery.jsx";
import StockBadge from "../../components/catalog/StockBadge.jsx";
import VariantSelector from "../../components/catalog/VariantSelector.jsx";
import WishlistToggleButton from "../../components/wishlist/WishlistToggleButton.jsx";

// Hooks
import { usePublicProduct } from "../../hooks/useCatalogData.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   LOADING
========================================================= */

function ProductDetailsLoading() {
  return (
    <main
      className="
        min-h-screen

        bg-brand-page
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
          sm:pt-10

          lg:px-8
          lg:pb-28
          lg:pt-14
        "
      >
        {/* BREADCRUMB */}

        <div
          className="
            mb-8

            h-4
            w-52

            animate-pulse

            rounded-full

            bg-brand-surface-soft
          "
        />

        <div
          className="
            grid

            gap-10

            lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]

            lg:gap-16
          "
        >
          {/* IMAGE */}

          <div
            className="
              aspect-[4/5]

              animate-pulse

              rounded-[1.75rem]

              bg-brand-surface-soft

              sm:aspect-square
            "
          />

          {/* INFO */}

          <div
            className="
              space-y-5

              py-2

              lg:py-6
            "
          >
            <div
              className="
                h-3
                w-28

                animate-pulse

                rounded

                bg-brand-accent-soft
              "
            />

            <div
              className="
                h-16
                w-4/5

                animate-pulse

                rounded-xl

                bg-brand-surface-soft
              "
            />

            <div
              className="
                h-8
                w-36

                animate-pulse

                rounded

                bg-brand-surface-soft
              "
            />

            <div
              className="
                h-24

                animate-pulse

                rounded-[1.25rem]

                bg-brand-surface-soft
              "
            />

            <div
              className="
                h-44

                animate-pulse

                rounded-[1.25rem]

                bg-brand-surface-soft
              "
            />

            <div
              className="
                h-14

                animate-pulse

                rounded-full

                bg-brand-surface-soft
              "
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT DETAILS CONTENT
========================================================= */

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

  /* =======================================================
     VARIANT CHANGE
  ======================================================= */

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

  /* =======================================================
     PRICE
  ======================================================= */

  const displayPrice = selectedVariant
    ? `$${selectedVariant.price}`
    : product.pricing.hasPriceRange
      ? `$${product.pricing.minimum} – $${product.pricing.maximum}`
      : `$${product.pricing.minimum}`;

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
          pt-6

          sm:px-6
          sm:pt-8

          lg:px-8
          lg:pb-28
          lg:pt-10
        "
      >
        {/* ==============================================
                BACK TO COLLECTION
            ============================================== */}

        <Link
          to="/products"
          className="
          mb-5
                inline-flex
                min-h-10

                items-center
                justify-center

                gap-2

                rounded-full

                px-2

                text-sm
                font-semibold

                text-brand-text-muted

                transition-colors

                hover:text-brand-text
              "
        >
          <ArrowBackRoundedIcon
            sx={{
              fontSize: 18,
            }}
          />
          Back to collection
        </Link>
        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <nav
          aria-label="Breadcrumb"
          className="
            mb-7

            flex
            flex-wrap

            items-center

            gap-2

            text-[0.6rem]
            font-semibold
            uppercase

            tracking-[0.14em]

            text-brand-text-muted

            sm:mb-9
          "
        >
          <Link
            to="/products"
            className="
              transition-colors

              hover:text-brand-text
            "
          >
            Shop
          </Link>

          <span
            aria-hidden="true"
            className="
              text-brand-border
            "
          >
            /
          </span>

          <Link
            to={`/products?category=${product.category.slug}`}
            className="
              transition-colors

              hover:text-brand-text
            "
          >
            {product.category.name}
          </Link>

          <span
            aria-hidden="true"
            className="
              text-brand-border
            "
          >
            /
          </span>

          <span
            className="
              max-w-[12rem]

              truncate

              text-brand-text

              sm:max-w-none
            "
          >
            {product.name}
          </span>
        </nav>

        {/* ==================================================
            PRODUCT LAYOUT
        ================================================== */}

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
              PRODUCT INFORMATION
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
            {/* ==============================================
                CATEGORY / FEATURED
            ============================================== */}

            <div
              className="
                flex
                flex-wrap

                items-center

                gap-3
              "
            >
              <p
                className="
                  text-[0.6rem]
                  font-bold
                  uppercase

                  tracking-[0.2em]

                  text-brand-accent-text
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

                    bg-brand-accent-soft

                    px-3
                    py-1.5

                    text-[0.56rem]
                    font-bold
                    uppercase

                    tracking-[0.14em]

                    text-brand-accent-text
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

            {/* ==============================================
                TITLE
            ============================================== */}

            <div className="mt-4">
              <div
                className="
                  flex
                  items-start
                  justify-between

                  gap-3
                "
              >
                <h1
                  className="
                    min-w-0
                    flex-1

                    font-display

                    text-[2.65rem]
                    font-medium

                    leading-[0.95]

                    tracking-[-0.045em]

                    text-brand-text

                    sm:text-5xl

                    lg:text-[3.4rem]
                  "
                >
                  {product.name}
                </h1>

                {/* WISHLIST */}

                <div
                  className="
                    shrink-0

                    pt-0.5
                  "
                >
                  <WishlistToggleButton productId={product.id} />
                </div>
              </div>

              {/* ============================================
                  PRICE + STOCK
              ============================================ */}

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

                    text-brand-text

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

            {/* ==============================================
                DESCRIPTION
            ============================================== */}

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

                    text-brand-text-muted

                    sm:text-[0.95rem]
                  "
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* ==============================================
                VARIANTS
            ============================================== */}

            <section className="mt-7">
              <p
                className="
                  mb-4

                  text-[0.58rem]
                  font-bold
                  uppercase

                  tracking-[0.18em]

                  text-brand-accent-text
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

            {/* ==============================================
                OUT OF STOCK
            ============================================== */}

            {selectedVariant && !selectedVariant.inStock && (
              <div
                className="
                    mt-5

                    flex
                    items-start

                    gap-3

                    rounded-[1.25rem]

                    border
                    border-brand-error/20

                    bg-brand-error/5

                    px-4
                    py-4

                    text-sm
                    font-medium

                    leading-6

                    text-brand-error
                  "
              >
                <span
                  className="
                      inline-flex
                      h-8
                      w-8
                      shrink-0

                      items-center
                      justify-center

                      rounded-full

                      bg-brand-error/10
                    "
                >
                  <ErrorOutlineRoundedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </span>

                <span>
                  The selected option is currently out of stock. You can choose
                  another available option.
                </span>
              </div>
            )}

            {/* ==============================================
                ADD TO CART
            ============================================== */}

            <div className="mt-7">
              <AddToCartSection selectedVariant={selectedVariant} />
            </div>

            {/* ==============================================
                DELIVERY / PAYMENT
            ============================================== */}

            <div
              className="
                mt-8

                grid

                gap-3

                sm:grid-cols-2
              "
            >
              {/* DELIVERY */}

              <article
                className="
                  rounded-[1.4rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft

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

                    bg-brand-accent-soft

                    text-brand-accent-text
                  "
                >
                  <LocalShippingOutlinedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </span>

                <p
                  className="
                    mt-4

                    text-sm
                    font-semibold

                    text-brand-text
                  "
                >
                  Delivery in Lebanon
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-brand-text-muted
                  "
                >
                  Your order is prepared carefully and delivered through our
                  courier partner.
                </p>
              </article>

              {/* PAYMENT */}

              <article
                className="
                  rounded-[1.4rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft

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

                    bg-brand-accent-soft

                    text-brand-accent-text
                  "
                >
                  <PaymentsOutlinedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </span>

                <p
                  className="
                    mt-4

                    text-sm
                    font-semibold

                    text-brand-text
                  "
                >
                  Cash on delivery
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-brand-text-muted
                  "
                >
                  Pay in USD when your Butterfly Dream order arrives.
                </p>
              </article>
            </div>

            {/* ==============================================
                CONFIDENCE STRIP
            ============================================== */}

            <div
              className="
                mt-4

                flex
                items-start

                gap-3

                rounded-[1.25rem]

                bg-brand-dark-surface

                px-4
                py-4

                text-brand-surface
              "
            >
              <span
                className="
                  inline-flex
                  h-9
                  w-9
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-fill/10

                  text-brand-accent-fill
                "
              >
                <VerifiedOutlinedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
              </span>

              <div>
                <p
                  className="
                    text-sm
                    font-semibold

                    text-brand-surface
                  "
                >
                  Chosen with intention.
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-brand-surface/60
                  "
                >
                  Each piece is prepared as part of your Butterfly Dream story.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT DETAILS
========================================================= */

function ProductDetails() {
  const { slug } = useParams();

  const { product, error, isLoading } = usePublicProduct(slug ?? "");

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return <ProductDetailsLoading />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    const statusCode = error.response?.status;

    const notFound = statusCode === 404;

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

            <div className="relative z-10">
              <span
                className={`
                  mx-auto

                  inline-flex
                  h-16
                  w-16

                  items-center
                  justify-center

                  rounded-full

                  ${
                    notFound
                      ? `
                          bg-brand-accent-soft
                          text-brand-accent-text
                        `
                      : `
                          bg-brand-error/10
                          text-brand-error
                        `
                  }
                `}
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

                  text-[0.6rem]
                  font-bold
                  uppercase

                  tracking-[0.2em]

                  text-brand-accent-text
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

                  leading-[0.98]

                  tracking-[-0.04em]

                  text-brand-text

                  sm:text-5xl
                "
              >
                {notFound
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

                  text-brand-text-muted
                "
              >
                {getApiErrorMessage(error, "The product could not be loaded.")}
              </p>

              <Link
                to="/products"
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
                <ArrowBackRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
                Browse collection
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     NO PRODUCT
  ======================================================= */

  if (!product) {
    return null;
  }

  return <ProductDetailsContent key={product.id} product={product} />;
}

export default ProductDetails;
