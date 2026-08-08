import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

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
   * Variant-specific image has priority.
   *
   * This means selecting "Silver" can
   * immediately switch away from a Gold
   * image even if the previous image ID
   * is still stored in the parent.
   */
  const selectedImage =
    manuallySelectedImage ?? variantImage ?? orderedImages[0] ?? null;
  return (
    <section>
      {/* MAIN IMAGE */}

      <div
        className="
          aspect-square
          overflow-hidden
          bg-brand-pale-champagne
        "
      >
        {selectedImage?.imageUrl ? (
          <img
            key={selectedImage.id}
            src={selectedImage.imageUrl}
            alt={selectedImage.altText || productName}
            className="
              h-full w-full
              object-cover
              transition-opacity
              duration-300
            "
          />
        ) : (
          <div
            className="
              flex h-full
              flex-col
              items-center
              justify-center
              gap-4
              text-brand-bronze
            "
          >
            <ImageNotSupportedOutlinedIcon
              sx={{
                fontSize: 64,
              }}
            />

            <p className="font-semibold">Product image</p>
          </div>
        )}
      </div>

      {/* THUMBNAILS */}

      {orderedImages.length > 1 && (
        <div
          className="
            mt-4
            grid grid-cols-4
            gap-3
            sm:grid-cols-5
          "
        >
          {orderedImages.map((image) => {
            const active = image.id === selectedImage?.id;

            const belongsToSelectedVariant =
              selectedVariantId && image.variantId === selectedVariantId;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onImageSelect?.(image.id)}
                aria-label={`View ${image.altText || productName}`}
                aria-pressed={active}
                className={[
                  `
                      relative
                      aspect-square
                      overflow-hidden
                      border-2
                      bg-brand-pale-champagne
                      transition-colors
                    `,
                  active
                    ? "border-brand-espresso"
                    : "border-transparent hover:border-brand-champagne",
                ].join(" ")}
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText || productName}
                  className="
                      h-full w-full
                      object-cover
                    "
                />

                {belongsToSelectedVariant && (
                  <span
                    className="
                        absolute
                        bottom-1.5
                        right-1.5
                        h-2 w-2
                        rounded-full
                        bg-brand-champagne
                        ring-2
                        ring-white
                      "
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProductImageGallery;
