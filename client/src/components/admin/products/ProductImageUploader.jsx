import { useRef, useState } from "react";

import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import {
  uploadProductImage,
  validateProductImageFile,
} from "../../../services/adminProductImageUploadApi.js";

const MAX_IMAGES_PER_PRODUCT = 8;

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

  async function handleUpload() {
    if (!productId || selectedItems.length === 0 || isUploading) {
      return;
    }

    setIsUploading(true);
    setGeneralError("");
    setSuccessMessage("");

    let uploadedCount = 0;

    /*
     * Upload sequentially instead of uploading
     * all images simultaneously. This gives the
     * administrator predictable progress and puts
     * less pressure on the browser/network.
     */
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

        /*
         * Remove the staged item after the backend
         * successfully finalized it.
         */
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
      className="
        border border-brand-border
        bg-brand-surface
      "
      aria-labelledby="product-images-heading"
    >
      <div
        className="
          flex flex-col gap-4
          border-b border-brand-border
          px-5 py-5
          sm:flex-row sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div>
          <p
            className="
              text-[0.6875rem]
              font-semibold uppercase
              tracking-[0.16em]
              text-brand-bronze
            "
          >
            Product media
          </p>

          <h2
            id="product-images-heading"
            className="
              mt-1
              font-display text-2xl
              font-medium
              text-brand-espresso
            "
          >
            Product photos
          </h2>

          <p
            className="
              mt-2 max-w-2xl
              text-sm leading-6
              text-brand-muted
            "
          >
            Add up to 8 JPG, PNG, or WebP photos. Each image can be up to 10 MB.
          </p>
        </div>

        <div
          className="
            shrink-0
            text-sm font-semibold
            text-brand-muted
          "
        >
          {usedSlots} / {MAX_IMAGES_PER_PRODUCT}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {displayedImages.length > 0 && (
          <div className="mb-6">
            <p
              className="
                mb-3
                text-xs font-semibold uppercase
                tracking-[0.12em]
                text-brand-muted
              "
            >
              Saved images
            </p>

            <div
              className="
                grid grid-cols-2 gap-3
                sm:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {displayedImages.map((image, index) => (
                <article
                  key={image.id ?? image.imageUrl ?? index}
                  className="
                      relative overflow-hidden
                      border
                      border-brand-border
                      bg-brand-ivory
                    "
                >
                  <div
                    className="
                        aspect-square
                        overflow-hidden
                      "
                  >
                    {image.imageUrl ? (
                      <img
                        src={image.imageUrl}
                        alt={image.altText || productName || "Product"}
                        className="
                            h-full w-full
                            object-cover
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex h-full
                            items-center
                            justify-center
                            text-brand-muted
                          "
                      >
                        <ImageOutlinedIcon />
                      </div>
                    )}
                  </div>

                  {image.isPrimary && (
                    <span
                      className="
                          absolute left-2 top-2
                          rounded-full
                          bg-brand-bronze
                          px-2.5 py-1
                          text-[0.625rem]
                          font-semibold uppercase
                          tracking-[0.1em]
                          text-white
                        "
                    >
                      Primary
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <p
                      className="
      min-w-0 flex-1 truncate
      text-xs
      text-brand-muted
    "
                    >
                      {image.altText || `Product image ${index + 1}`}
                    </p>

                    {!disabled && image.id && (
                      <div className="flex shrink-0 items-center gap-1">
                        {typeof onEditImage === "function" && (
                          <button
                            type="button"
                            onClick={() => onEditImage(image)}
                            aria-label="Edit product image"
                            className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            text-brand-muted
            transition-colors
            bg-brand-pale-champagne
            hover:text-brand-bronze
          "
                          >
                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                          </button>
                        )}

                        {typeof onDeleteImage === "function" && (
                          <button
                            type="button"
                            onClick={() => onDeleteImage(image)}
                            aria-label="Delete product image"
                            className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            text-brand-error
            transition-colors
            hover:bg-brand-error/5
          "
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
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

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex min-h-[210px]
            flex-col items-center
            justify-center
            border-2 border-dashed
            px-5 py-8
            text-center
            transition-colors
            ${
              isDragging
                ? `
                  border-brand-champagne
                  bg-brand-pale-champagne
                `
                : `
                  border-brand-border
                 bg-brand-cream
                `
            }
            ${
              canSelectMore ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            }
          `}
          onClick={() => {
            if (canSelectMore) {
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={canSelectMore ? 0 : -1}
          onKeyDown={(event) => {
            if (canSelectMore && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();

              fileInputRef.current?.click();
            }
          }}
          aria-disabled={!canSelectMore}
        >
          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-full
              bg-brand-pale-champagne 
              text-brand-bronze
            "
          >
            <AddPhotoAlternateRoundedIcon />
          </div>

          <h3
            className="
              mt-4
              text-sm font-semibold
              text-brand-espresso
            "
          >
            {remainingSlots > 0
              ? "Drop product photos here"
              : "Maximum image limit reached"}
          </h3>

          {remainingSlots > 0 && (
            <>
              <p
                className="
                  mt-1
                  text-sm
                  text-brand-muted
                "
              >
                or choose images from your device
              </p>

              <button
                type="button"
                disabled={!canSelectMore}
                onClick={(event) => {
                  event.stopPropagation();

                  fileInputRef.current?.click();
                }}
                className="
                  mt-5 inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-brand-bronze
                  px-5
                  text-sm font-semibold
                  text-white
                  transition-colors
                  hover:bg-brand-bronze-hover
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <AddPhotoAlternateRoundedIcon fontSize="small" />
                Choose photos
              </button>

              <p
                className="
                  mt-3
                  text-xs
                  text-brand-muted
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
            accept="
              image/jpeg,
              image/png,
              image/webp
            "
            onChange={handleInputChange}
            className="sr-only"
            disabled={!canSelectMore}
          />
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-6">
            <div
              className="
    flex flex-col
    gap-4
    sm:flex-row
    sm:items-center
    sm:justify-between
  "
            >
              <div>
                <p
                  className="
        text-xs
        font-semibold
        uppercase
        tracking-[0.12em]
        text-brand-muted
      "
                >
                  Ready to upload
                </p>

                <p
                  className="
        mt-1
        text-sm
        text-brand-muted
      "
                >
                  {selectedItems.length}{" "}
                  {selectedItems.length === 1
                    ? "photo selected"
                    : "photos selected"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
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
        border-brand-border
        px-4
        text-sm
        font-semibold
        text-brand-error
        transition-colors
        hover:bg-brand-error/5
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
        inline-flex
        min-h-11
        items-center
        justify-center
        gap-2
        rounded-full
        bg-brand-bronze
        px-5
        text-sm
        font-semibold
        text-white
        transition-colors
        hover:bg-brand-bronze-hover
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
                >
                  <CloudUploadRoundedIcon fontSize="small" />

                  {isUploading
                    ? "Uploading & saving..."
                    : `Upload & save ${selectedItems.length} ${
                        selectedItems.length === 1 ? "photo" : "photos"
                      }`}
                </button>
              </div>
            </div>
            <div
              className="
                mt-4 grid gap-4
                md:grid-cols-2
              "
            >
              {selectedItems.map((item) => (
                <article
                  key={item.id}
                  className="
                      grid
                      grid-cols-[6.5rem_minmax(0,1fr)]
                      overflow-hidden
                      border
                      border-brand-border
                      bg-brand-surface
                    "
                >
                  <div
                    className="
                        relative
                        min-h-[150px]
                       bg-brand-ivory
                      "
                  >
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="
                          h-full w-full
                          object-cover
                        "
                    />

                    {item.status === "uploading" && (
                      <div
                        className="
                            absolute inset-0
                            flex items-center
                            justify-center
                            bg-[var(--color-deep-espresso)]/60
                            text-white
                          "
                      >
                        <span
                          className="
                              text-sm
                              font-semibold
                            "
                        >
                          {item.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className="
                        min-w-0 p-4
                      "
                  >
                    <div
                      className="
                          flex items-start
                          justify-between
                          gap-3
                        "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                              truncate
                              text-sm
                              font-semibold
                              text-brand-espresso
                            "
                        >
                          {item.file.name}
                        </p>

                        <p
                          className="
                              mt-1 text-xs
                              text-brand-muted
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
                            flex h-10 w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-brand-muted
                            transition-colors
                            hover:bg-brand-error/5
                            hover:text-brand-error
                            disabled:opacity-40
                          "
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </button>
                    </div>

                    <label
                      className="
                          mt-3 block
                          text-xs font-semibold
                         text-brand-espresso
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
                            min-h-10 w-full
                            border
                            border-brand-border
                            bg-brand-surface
                            px-3
                            text-sm
                            text-brand-espresso
                            outline-none
                            transition-colors
                            focus:border-brand-champagne
                            disabled:bg-brand-ivory
                          "
                      />
                    </label>

                    {item.status === "uploading" && (
                      <div
                        className="
                            mt-3 h-1.5
                            overflow-hidden
                            rounded-full
                            bg-brand-pale-champagne
                          "
                      >
                        <div
                          className="
                              h-full
                              rounded-full
                              bg-brand-bronze
                              transition-[width]
                              duration-200
                            "
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />
                      </div>
                    )}

                    {item.status === "error" && (
                      <div
                        className="
                            mt-3 flex
                            items-start gap-2
                            text-xs leading-5
                            text-brand-error
                          "
                      >
                        <ErrorOutlineRoundedIcon
                          sx={{
                            fontSize: 17,
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

        {generalError && (
          <div
            role="alert"
            className="
              mt-5 flex
              items-start gap-3
              border
              border-brand-error/25
              bg-brand-error/5
              px-4 py-3
              text-sm leading-6
              text-brand-error
            "
          >
            <ErrorOutlineRoundedIcon fontSize="small" />

            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="
              mt-5 flex
              items-center gap-3
              border
              border-brand-success/25
              bg-brand-success/5
              px-4 py-3
              text-sm
              text-brand-success
            "
          >
            <CheckCircleRoundedIcon fontSize="small" />

            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductImageUploader;
