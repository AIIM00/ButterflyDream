import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

/* =========================================================
   HELPERS
========================================================= */

function getOrderedImages(images, selectedVariantId) {
  if (!Array.isArray(images)) {
    return [];
  }

  /*
   * When a variant is selected:
   *
   * 1. Images assigned to that variant
   * 2. General product images
   * 3. Images belonging to other variants
   */
  if (!selectedVariantId) {
    return [...images].sort((first, second) => {
      if (first.isPrimary !== second.isPrimary) {
        return first.isPrimary ? -1 : 1;
      }

      return Number(first.position ?? 0) - Number(second.position ?? 0);
    });
  }

  const matchingImages = images.filter(
    (image) => image.variantId === selectedVariantId,
  );

  const generalImages = images.filter((image) => !image.variantId);

  const otherImages = images.filter(
    (image) => image.variantId && image.variantId !== selectedVariantId,
  );

  function sortImages(items) {
    return [...items].sort((first, second) => {
      if (first.isPrimary !== second.isPrimary) {
        return first.isPrimary ? -1 : 1;
      }

      return Number(first.position ?? 0) - Number(second.position ?? 0);
    });
  }

  return [
    ...sortImages(matchingImages),
    ...sortImages(generalImages),
    ...sortImages(otherImages),
  ];
}

/* =========================================================
   PRODUCT IMAGE GALLERY
========================================================= */

function ProductImageGallery({
  productName,
  images,
  selectedImageId,
  selectedVariantId = null,
  onImageSelect,
}) {
  const orderedImages = getOrderedImages(images, selectedVariantId);

  const variantImage = selectedVariantId
    ? orderedImages.find((image) => image.variantId === selectedVariantId)
    : null;

  const manuallySelectedImage = orderedImages.find(
    (image) => image.id === selectedImageId,
  );

  /*
   * Preserve the existing image-selection
   * behavior.
   */
  const selectedImage =
    manuallySelectedImage ?? variantImage ?? orderedImages[0] ?? null;

  const selectedImageIndex = selectedImage
    ? orderedImages.findIndex((image) => image.id === selectedImage.id)
    : -1;

  return (
    <section
      aria-label={`${productName} images`}
      className="
        w-full
        min-w-0
      "
    >
      {/* ==================================================
          MAIN IMAGE FRAME
      ================================================== */}

      <div
        className="
          relative

          overflow-hidden

          rounded-[1.75rem]

          border
          border-brand-border

          bg-brand-surface-soft

          p-2.5

          shadow-[inset_0_5px_16px_rgba(0,0,0,0.07)]

          sm:rounded-[2rem]
          sm:p-3
        "
      >
        {/* INNER IMAGE */}

        <div
          className="
            relative

            aspect-square

            overflow-hidden

            rounded-[1.35rem]

            bg-brand-surface

            sm:rounded-[1.55rem]
          "
        >
          {selectedImage?.imageUrl ? (
            <img
              key={selectedImage.id}
              src={selectedImage.imageUrl}
              alt={selectedImage.altText || productName}
              className="
                h-full
                w-full

                object-contain

                p-2

                transition-all
                duration-300

                sm:p-3
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full

                flex-col

                items-center
                justify-center

                gap-3

                px-6

                text-center

                text-brand-text-muted
              "
            >
              <span
                className="
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
                <ImageNotSupportedOutlinedIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </span>

              <div>
                <p
                  className="
                    font-display

                    text-lg
                    font-medium

                    text-brand-text
                  "
                >
                  Product image
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-brand-text-muted
                  "
                >
                  An image is not available for this piece.
                </p>
              </div>
            </div>
          )}

          {/* ==============================================
              IMAGE COUNT
          ============================================== */}

          {orderedImages.length > 1 && (
            <span
              className="
                pointer-events-none

                absolute
                bottom-3
                right-3

                inline-flex
                min-h-8

                items-center
                justify-center

                rounded-full

                border
                border-brand-border/70

                bg-brand-surface/90

                px-3

                text-[0.62rem]
                font-semibold

                text-brand-text

                shadow-sm
                backdrop-blur-md
              "
            >
              {selectedImageIndex >= 0 ? selectedImageIndex + 1 : 1}
              <span
                className="
                  mx-1
                  text-brand-text-muted/50
                "
              >
                /
              </span>
              {orderedImages.length}
            </span>
          )}
        </div>
      </div>

      {/* ==================================================
          THUMBNAILS
      ================================================== */}

      {orderedImages.length > 1 && (
        <div
          className="
            -mx-1

            mt-3

            flex
            gap-2.5

            overflow-x-auto

            px-1
            pb-1

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:mt-4
            sm:gap-3
          "
        >
          {orderedImages.map((image, index) => {
            const active = image.id === selectedImage?.id;

            const belongsToSelectedVariant = Boolean(
              selectedVariantId && image.variantId === selectedVariantId,
            );

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onImageSelect?.(image.id)}
                aria-label={`View ${image.altText || productName} image ${index + 1}`}
                aria-pressed={active}
                className={`
                    group/thumbnail

                    relative

                    aspect-square

                    w-[4.35rem]
                    shrink-0

                    overflow-hidden

                    rounded-[1rem]

                    border

                    p-1

                    transition-all
                    duration-200

                    active:scale-[0.97]

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-accent-fill/40

                    sm:w-[4.8rem]

                    lg:w-[5.25rem]

                    ${
                      active
                        ? `
                            border-brand-primary
                            bg-brand-surface

                            shadow-[0_5px_16px_rgba(0,0,0,0.08)]
                          `
                        : `
                            border-brand-border
                            bg-brand-surface-soft

                            hover:border-brand-accent-fill/60
                            hover:bg-brand-surface
                          `
                    }
                  `}
              >
                <div
                  className="
                      h-full
                      w-full

                      overflow-hidden

                      rounded-[0.72rem]

                      bg-brand-surface
                    "
                >
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image.altText || productName}
                      loading="lazy"
                      className="
                          h-full
                          w-full

                          object-contain

                          p-0.5

                          transition-transform
                          duration-300

                          group-hover/thumbnail:scale-[1.04]
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

                          text-brand-text-muted
                        "
                    >
                      <ImageNotSupportedOutlinedIcon
                        sx={{
                          fontSize: 18,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* ======================================
                      SELECTED VARIANT INDICATOR
                  ====================================== */}

                {belongsToSelectedVariant && (
                  <span
                    aria-label="Image for selected variant"
                    className="
                        absolute
                        bottom-1.5
                        right-1.5

                        inline-flex
                        h-5
                        w-5

                        items-center
                        justify-center

                        rounded-full

                        bg-brand-accent-fill

                        text-brand-text

                        shadow-sm

                        ring-2
                        ring-brand-surface
                      "
                  >
                    <AutoAwesomeRoundedIcon
                      sx={{
                        fontSize: 10,
                      }}
                    />
                  </span>
                )}

                {/* ACTIVE INDICATOR */}

                {active && (
                  <span
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        inset-0

                        rounded-[1rem]

                        ring-1
                        ring-inset
                        ring-brand-primary/10
                      "
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ==================================================
          MOBILE SWIPE HINT
      ================================================== */}

      {orderedImages.length > 2 && (
        <p
          className="
            mt-2

            text-center

            text-[0.58rem]
            font-medium

            text-brand-text-muted

            sm:hidden
          "
        >
          Swipe to explore more images
        </p>
      )}
    </section>
  );
}

export default ProductImageGallery;
