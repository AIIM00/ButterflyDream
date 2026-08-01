import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

function ProductImageGallery({
  productName,
  images,
  selectedImageId,
  onImageSelect,
}) {
  const selectedImage =
    images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;

  return (
    <section>
      <div className="aspect-square overflow-hidden rounded-3xl bg-gray-100">
        {selectedImage?.imageUrl ? (
          <img
            src={selectedImage.imageUrl}
            alt={selectedImage.altText || productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-400">
            <ImageNotSupportedOutlinedIcon
              sx={{
                fontSize: 64,
              }}
            />

            <p className="font-semibold">Product image</p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onImageSelect(image.id)}
              className={[
                "aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 transition",
                image.id === selectedImage?.id
                  ? "border-gray-950"
                  : "border-transparent hover:border-gray-300",
              ].join(" ")}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || productName}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductImageGallery;
