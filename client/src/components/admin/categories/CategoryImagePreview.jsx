import { useState } from "react";

// MUI Icons
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

function CategoryImagePreview({ imageUrl, categoryName, compact = false }) {
  const [failedImageUrl, setFailedImageUrl] = useState("");

  const normalizedImageUrl =
    typeof imageUrl === "string" ? imageUrl.trim() : "";

  const imageFailed =
    Boolean(normalizedImageUrl) && failedImageUrl === normalizedImageUrl;

  const hasImage = Boolean(normalizedImageUrl) && !imageFailed;

  /* =========================================================
     COMPACT PREVIEW
  ========================================================= */

  if (compact) {
    if (!hasImage) {
      return (
        <div
          className="
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center

            overflow-hidden
            rounded-[0.9rem]

            border
            border-dashed
            border-gray-200

            bg-gray-50

            text-gray-400
          "
          aria-label={
            imageFailed
              ? "Category image could not be loaded"
              : "No category image"
          }
        >
          {imageFailed ? (
            <BrokenImageOutlinedIcon
              sx={{
                fontSize: 20,
              }}
            />
          ) : (
            <ImageOutlinedIcon
              sx={{
                fontSize: 20,
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div
        className="
          h-14
          w-14
          shrink-0
          overflow-hidden

          rounded-[0.9rem]

          border
          border-gray-200

          bg-gray-100
        "
      >
        <img
          src={normalizedImageUrl}
          alt={categoryName ? `${categoryName} category` : "Category preview"}
          loading="lazy"
          onError={() => setFailedImageUrl(normalizedImageUrl)}
          className="
            h-full
            w-full
            object-cover
          "
        />
      </div>
    );
  }

  /* =========================================================
     FULL PREVIEW
  ========================================================= */

  return (
    <div
      className="
        relative
        aspect-[16/9]
        w-full
        overflow-hidden

        rounded-[1.15rem]

        border
        border-gray-200

        bg-gray-50

        sm:rounded-[1.3rem]
      "
    >
      {hasImage ? (
        <img
          src={normalizedImageUrl}
          alt={categoryName ? `${categoryName} category` : "Category preview"}
          loading="lazy"
          onError={() => setFailedImageUrl(normalizedImageUrl)}
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            flex
            h-full
            min-h-[10rem]
            w-full
            flex-col
            items-center
            justify-center
            gap-3

            px-5

            text-center
          "
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

              text-gray-400

              shadow-sm
              ring-1
              ring-gray-200
            "
          >
            {imageFailed ? (
              <BrokenImageOutlinedIcon
                sx={{
                  fontSize: 22,
                }}
              />
            ) : (
              <ImageOutlinedIcon
                sx={{
                  fontSize: 22,
                }}
              />
            )}
          </span>

          <div>
            <p
              className="
                text-xs
                font-bold
                text-gray-700

                sm:text-sm
              "
            >
              {imageFailed ? "Image unavailable" : "No category image"}
            </p>

            <p
              className="
                mt-1
                text-[0.65rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              {imageFailed
                ? "The selected image could not be loaded."
                : "Choose an image to preview this category."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryImagePreview;
