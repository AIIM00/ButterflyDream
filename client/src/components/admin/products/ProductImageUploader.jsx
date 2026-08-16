import { useRef, useState } from "react";

// MUI Icons
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";

// Services
import {
  uploadProductImage,
  validateProductImageFile,
} from "../../../services/adminProductImageUploadApi.js";

const MAX_IMAGES_PER_PRODUCT = 8;

/* =========================================================
   HELPERS
========================================================= */

function createLocalId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(reader.result);
    });

    reader.addEventListener("error", () => {
      reject(new Error("The image preview could not be created."));
    });

    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createDefaultAltText(productName, fileName) {
  if (typeof productName === "string" && productName.trim()) {
    return `${productName.trim()} product image`;
  }

  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/* =========================================================
   COMPONENT
========================================================= */

function ProductImageUploader({
  productId,
  productName = "",
  existingImages = [],
  disabled = false,
  onImageAdded,
  onEditImage,
  onDeleteImage,
}) {
  const fileInputRef = useRef(null);

  const [selectedItems, setSelectedItems] = useState([]);

  const [locallyUploadedImages, setLocallyUploadedImages] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =======================================================
     IMAGE COUNTS
  ======================================================= */

  const existingImageIds = new Set(
    existingImages.map((image) => image?.id).filter(Boolean),
  );

  const newUploadedImages = locallyUploadedImages.filter(
    (image) => !image?.id || !existingImageIds.has(image.id),
  );

  const displayedImages = [...existingImages, ...newUploadedImages];

  const usedSlots = displayedImages.length + selectedItems.length;

  const remainingSlots = Math.max(0, MAX_IMAGES_PER_PRODUCT - usedSlots);

  const canSelectMore = !disabled && !isUploading && remainingSlots > 0;

  /* =======================================================
     SELECTED IMAGE HELPERS
  ======================================================= */

  function updateSelectedItem(itemId, updates) {
    setSelectedItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    );
  }

  async function addFiles(fileList) {
    if (disabled || isUploading) {
      return;
    }

    setGeneralError("");
    setSuccessMessage("");

    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      return;
    }

    if (remainingSlots <= 0) {
      setGeneralError(
        `A product can contain a maximum of ${MAX_IMAGES_PER_PRODUCT} images.`,
      );

      return;
    }

    const existingFileSignatures = new Set(
      selectedItems.map(
        (item) =>
          `${item.file.name}-${item.file.size}-${item.file.lastModified}`,
      ),
    );

    const filesToPrepare = [];
    const errors = [];

    for (const file of files) {
      if (filesToPrepare.length >= remainingSlots) {
        errors.push(
          `Only ${remainingSlots} more ${
            remainingSlots === 1 ? "image" : "images"
          } can be added.`,
        );

        break;
      }

      const signature = `${file.name}-${file.size}-${file.lastModified}`;

      if (existingFileSignatures.has(signature)) {
        errors.push(`${file.name} is already selected.`);

        continue;
      }

      try {
        validateProductImageFile(file);

        const previewUrl = await readFileAsDataUrl(file);

        filesToPrepare.push({
          id: createLocalId(),
          file,
          previewUrl,
          altText: createDefaultAltText(productName, file.name),
          progress: 0,
          status: "pending",
          error: "",
        });

        existingFileSignatures.add(signature);
      } catch (error) {
        errors.push(
          `${file.name}: ${error?.message || "The image is not valid."}`,
        );
      }
    }

    if (filesToPrepare.length > 0) {
      setSelectedItems((currentItems) => [...currentItems, ...filesToPrepare]);
    }

    if (errors.length > 0) {
      setGeneralError(errors.join(" "));
    }
  }

  function handleInputChange(event) {
    void addFiles(event.target.files);

    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();

    setIsDragging(false);

    if (!canSelectMore) {
      return;
    }

    void addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event) {
    event.preventDefault();

    if (canSelectMore) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();

    setIsDragging(false);
  }

  function removeSelectedItem(itemId) {
    if (isUploading) {
      return;
    }

    setSelectedItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );

    setGeneralError("");
  }

  /* =======================================================
     UPLOAD
  ======================================================= */

  async function handleUpload() {
    if (!productId || selectedItems.length === 0 || isUploading) {
      return;
    }

    setIsUploading(true);
    setGeneralError("");
    setSuccessMessage("");

    let uploadedCount = 0;

    for (const item of selectedItems) {
      updateSelectedItem(item.id, {
        status: "uploading",
        progress: 0,
        error: "",
      });

      try {
        const image = await uploadProductImage(productId, item.file, {
          altText: item.altText,

          onProgress: (progress) => {
            updateSelectedItem(item.id, {
              progress,
            });
          },
        });

        uploadedCount += 1;

        setLocallyUploadedImages((currentImages) => [...currentImages, image]);

        onImageAdded?.(image);

        setSelectedItems((currentItems) =>
          currentItems.filter((currentItem) => currentItem.id !== item.id),
        );
      } catch (error) {
        updateSelectedItem(item.id, {
          status: "error",
          error: error?.message || "The image could not be uploaded.",
        });
      }
    }

    setIsUploading(false);

    if (uploadedCount > 0) {
      setSuccessMessage(
        `${uploadedCount} ${
          uploadedCount === 1 ? "image was" : "images were"
        } uploaded successfully.`,
      );
    }
  }

  return (
    <section
      aria-labelledby="product-images-heading"
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className="
          flex
          items-start
          justify-between
          gap-4

          border-b
          border-gray-100

          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.13em]
              text-gray-400
            "
          >
            Product media
          </p>

          <h2
            id="product-images-heading"
            className="
              mt-1
              text-lg
              font-bold
              tracking-[-0.025em]
              text-gray-950

              sm:text-xl
            "
          >
            Product photos
          </h2>

          <p
            className="
              mt-1.5
              max-w-xl

              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            Add up to 8 JPG, PNG, or WebP photos. Each image can be up to 10 MB.
          </p>
        </div>

        {/* IMAGE COUNT */}
        <div
          className="
            flex
            shrink-0
            flex-col
            items-end
          "
        >
          <span
            className="
              text-[0.58rem]
              font-bold
              uppercase
              tracking-[0.1em]
              text-gray-400
            "
          >
            Images
          </span>

          <span
            className="
              mt-1
              text-sm
              font-bold
              text-gray-950

              sm:text-base
            "
          >
            {usedSlots}/{MAX_IMAGES_PER_PRODUCT}
          </span>
        </div>
      </div>

      <div
        className="
          p-4

          sm:p-5

          lg:p-6
        "
      >
        {/* ===================================================
            SAVED IMAGES
        =================================================== */}
        {displayedImages.length > 0 && (
          <div className="mb-6">
            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-[0.62rem]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-gray-400
                  "
                >
                  Saved images
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  Manage existing product photos.
                </p>
              </div>

              <PhotoLibraryOutlinedIcon
                sx={{
                  fontSize: 19,
                }}
                className="text-gray-400"
              />
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3

                sm:grid-cols-3

                lg:grid-cols-4

                xl:grid-cols-5
              "
            >
              {displayedImages.map((image, index) => (
                <article
                  key={image.id ?? image.imageUrl ?? index}
                  className="
                      group
                      overflow-hidden

                      rounded-[1rem]

                      border
                      border-gray-200

                      bg-white

                      transition

                      hover:border-gray-300
                      hover:shadow-sm
                    "
                >
                  {/* IMAGE */}
                  <div
                    className="
                        relative
                        aspect-square
                        overflow-hidden
                        bg-gray-100
                      "
                  >
                    {image.imageUrl ? (
                      <img
                        src={image.imageUrl}
                        alt={image.altText || productName || "Product"}
                        loading="lazy"
                        className="
                            h-full
                            w-full
                            object-cover

                            transition-transform
                            duration-300

                            group-hover:scale-[1.025]
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-gray-400
                          "
                      >
                        <ImageOutlinedIcon
                          sx={{
                            fontSize: 24,
                          }}
                        />
                      </div>
                    )}

                    {/* PRIMARY */}
                    {image.isPrimary && (
                      <span
                        className="
                            absolute
                            left-2
                            top-2

                            rounded-full

                            bg-gray-950/90

                            px-2.5
                            py-1

                            text-[0.55rem]
                            font-bold
                            uppercase
                            tracking-[0.09em]
                            text-white

                            backdrop-blur-sm
                          "
                      >
                        Primary
                      </span>
                    )}
                  </div>

                  {/* IMAGE FOOTER */}
                  <div
                    className="
                        flex
                        min-h-[3.25rem]
                        items-center
                        gap-1

                        px-2.5
                        py-2
                      "
                  >
                    <p
                      className="
                          min-w-0
                          flex-1
                          truncate

                          text-[0.65rem]
                          text-gray-500

                          sm:text-xs
                        "
                    >
                      {image.altText || `Product image ${index + 1}`}
                    </p>

                    {!disabled && image.id && (
                      <div
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-1
                          "
                      >
                        {typeof onEditImage === "function" && (
                          <button
                            type="button"
                            onClick={() => onEditImage(image)}
                            aria-label="Edit product image"
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center

                                rounded-full

                                bg-gray-100
                                text-gray-500

                                transition-colors

                                hover:bg-gray-950
                                hover:text-white
                              "
                          >
                            <EditRoundedIcon
                              sx={{
                                fontSize: 16,
                              }}
                            />
                          </button>
                        )}

                        {typeof onDeleteImage === "function" && (
                          <button
                            type="button"
                            onClick={() => onDeleteImage(image)}
                            aria-label="Delete product image"
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center

                                rounded-full

                                bg-red-50
                                text-red-600

                                transition-colors

                                hover:bg-red-600
                                hover:text-white
                              "
                          >
                            <DeleteOutlineRoundedIcon
                              sx={{
                                fontSize: 16,
                              }}
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================
            DROP ZONE
        =================================================== */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (canSelectMore) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (canSelectMore && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();

              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={canSelectMore ? 0 : -1}
          aria-disabled={!canSelectMore}
          className={[
            `
              flex
              min-h-[190px]
              flex-col
              items-center
              justify-center

              rounded-[1.15rem]

              border-2
              border-dashed

              px-4
              py-7

              text-center

              transition-all

              sm:min-h-[220px]
              sm:px-6
              sm:py-8
            `,
            isDragging
              ? `
                border-gray-950
                bg-gray-100
              `
              : `
                border-gray-200
                bg-gray-50/70
              `,
            canSelectMore
              ? `
                cursor-pointer

                hover:border-gray-300
                hover:bg-gray-50
              `
              : `
                cursor-not-allowed
                opacity-60
              `,
          ].join(" ")}
        >
          <span
            className="
              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-full

              bg-white
              text-gray-700

              shadow-sm
              ring-1
              ring-gray-200

              sm:h-14
              sm:w-14
            "
          >
            <AddPhotoAlternateRoundedIcon
              sx={{
                fontSize: 23,
              }}
            />
          </span>

          <h3
            className="
              mt-4
              text-sm
              font-bold
              text-gray-950

              sm:text-base
            "
          >
            {remainingSlots > 0
              ? "Add product photos"
              : "Maximum image limit reached"}
          </h3>

          {remainingSlots > 0 && (
            <>
              <p
                className="
                  mt-1
                  max-w-sm
                  text-xs
                  leading-5
                  text-gray-500

                  sm:text-sm
                "
              >
                Drag and drop images here, or select them from your device.
              </p>

              <button
                type="button"
                disabled={!canSelectMore}
                onClick={(event) => {
                  event.stopPropagation();

                  fileInputRef.current?.click();
                }}
                className="
                  button-base
                  button-primary

                  mt-5
                  min-h-11
                  px-5
                "
              >
                <AddPhotoAlternateRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
                Choose photos
              </button>

              <p
                className="
                  mt-3
                  text-[0.65rem]
                  font-medium
                  text-gray-400

                  sm:text-xs
                "
              >
                {remainingSlots} {remainingSlots === 1 ? "photo" : "photos"}{" "}
                remaining
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="sr-only"
            disabled={!canSelectMore}
          />
        </div>

        {/* ===================================================
            SELECTED / STAGED IMAGES
        =================================================== */}
        {selectedItems.length > 0 && (
          <div className="mt-6">
            {/* HEADER + ACTIONS */}
            <div
              className="
                flex
                flex-col
                gap-4

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-[0.62rem]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-gray-400
                  "
                >
                  Ready to upload
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500

                    sm:text-sm
                  "
                >
                  {selectedItems.length}{" "}
                  {selectedItems.length === 1
                    ? "photo selected"
                    : "photos selected"}
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2

                  sm:flex
                  sm:flex-wrap
                "
              >
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setSelectedItems([]);
                    setGeneralError("");
                    setSuccessMessage("");
                  }}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-gray-200

                    bg-white

                    px-4

                    text-sm
                    font-bold
                    text-red-600

                    transition-colors

                    hover:border-red-200
                    hover:bg-red-50

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={
                    isUploading || selectedItems.length === 0 || !productId
                  }
                  onClick={() => void handleUpload()}
                  className="
                    button-base
                    button-primary

                    min-h-11
                    px-4

                    sm:px-5
                  "
                >
                  <CloudUploadRoundedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />

                  <span className="sm:hidden">
                    {isUploading ? "Uploading..." : "Upload"}
                  </span>

                  <span className="hidden sm:inline">
                    {isUploading
                      ? "Uploading & saving..."
                      : `Upload & save ${selectedItems.length} ${
                          selectedItems.length === 1 ? "photo" : "photos"
                        }`}
                  </span>
                </button>
              </div>
            </div>

            {/* STAGED IMAGE CARDS */}
            <div
              className="
                mt-4
                grid
                gap-3

                md:grid-cols-2

                lg:gap-4
              "
            >
              {selectedItems.map((item) => (
                <article
                  key={item.id}
                  className="
                    overflow-hidden

                    rounded-[1rem]

                    border
                    border-gray-200

                    bg-white

                    sm:grid
                    sm:grid-cols-[7rem_minmax(0,1fr)]
                  "
                >
                  {/* PREVIEW */}
                  <div
                    className="
                      relative
                      aspect-[4/3]
                      overflow-hidden
                      bg-gray-100

                      sm:aspect-auto
                      sm:min-h-[165px]
                    "
                  >
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />

                    {item.status === "uploading" && (
                      <div
                        className="
                          absolute
                          inset-0

                          flex
                          items-center
                          justify-center

                          bg-gray-950/60

                          text-white
                          backdrop-blur-[1px]
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-bold
                          "
                        >
                          {item.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* INFORMATION */}
                  <div
                    className="
                      min-w-0
                      p-3.5

                      sm:p-4
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
                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-gray-900
                          "
                        >
                          {item.file.name}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[0.65rem]
                            text-gray-400

                            sm:text-xs
                          "
                        >
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${item.file.name}`}
                        disabled={isUploading}
                        onClick={() => removeSelectedItem(item.id)}
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center

                          rounded-full

                          text-gray-400

                          transition-colors

                          hover:bg-red-50
                          hover:text-red-600

                          disabled:opacity-40
                        "
                      >
                        <CloseRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      </button>
                    </div>

                    {/* ALT TEXT */}
                    <label
                      className="
                        mt-3
                        block

                        text-[0.68rem]
                        font-bold
                        text-gray-700

                        sm:text-xs
                      "
                    >
                      Alt text
                      <input
                        type="text"
                        maxLength={200}
                        disabled={isUploading}
                        value={item.altText}
                        onChange={(event) =>
                          updateSelectedItem(item.id, {
                            altText: event.target.value,
                          })
                        }
                        className="
                          mt-1.5
                          min-h-10
                          w-full

                          rounded-xl

                          border
                          border-gray-200

                          bg-white

                          px-3

                          text-sm
                          font-normal
                          text-gray-900

                          outline-none
                          transition

                          focus:border-gray-400
                          focus:ring-4
                          focus:ring-gray-950/[0.035]

                          disabled:bg-gray-100
                        "
                      />
                    </label>

                    {/* PROGRESS */}
                    {item.status === "uploading" && (
                      <div
                        className="
                          mt-3
                          h-1.5
                          overflow-hidden
                          rounded-full
                          bg-gray-100
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-gray-950
                            transition-[width]
                            duration-200
                          "
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, item.progress),
                            )}%`,
                          }}
                        />
                      </div>
                    )}

                    {/* ERROR */}
                    {item.status === "error" && (
                      <div
                        className="
                          mt-3
                          flex
                          items-start
                          gap-2

                          text-xs
                          leading-5
                          text-red-600
                        "
                      >
                        <ErrorOutlineRoundedIcon
                          sx={{
                            fontSize: 16,
                          }}
                        />

                        <span>{item.error}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================
            GENERAL ERROR
        =================================================== */}
        {generalError && (
          <div
            role="alert"
            className="
              mt-5
              flex
              items-start
              gap-3

              rounded-[1rem]

              border
              border-red-200

              bg-red-50

              px-3.5
              py-3

              text-xs
              leading-5
              text-red-700

              sm:px-4
              sm:text-sm
              sm:leading-6
            "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 18,
              }}
              className="shrink-0"
            />

            <span>{generalError}</span>
          </div>
        )}

        {/* ===================================================
            SUCCESS
        =================================================== */}
        {successMessage && (
          <div
            role="status"
            className="
              mt-5
              flex
              items-start
              gap-3

              rounded-[1rem]

              border
              border-emerald-200

              bg-emerald-50

              px-3.5
              py-3

              text-xs
              font-medium
              leading-5
              text-emerald-700

              sm:px-4
              sm:text-sm
            "
          >
            <CheckCircleRoundedIcon
              sx={{
                fontSize: 18,
              }}
              className="shrink-0"
            />

            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductImageUploader;
