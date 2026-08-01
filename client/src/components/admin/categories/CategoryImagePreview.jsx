import { useState } from "react";

//MUI Icons
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

function CategoryImagePreview({ imageUrl, categoryName, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  const hasImage =
    typeof imageUrl === "string" && imageUrl.trim().length > 0 && !imageFailed;

  const dimensions = compact
    ? "h-14 w-14 rounded-xl"
    : "aspect-[16/9] w-full rounded-2xl";

  if (!hasImage) {
    return (
      <div
        className={[
          "flex items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-gray-400",
          dimensions,
        ].join(" ")}
      >
        {imageFailed ? <BrokenImageOutlinedIcon /> : <ImageOutlinedIcon />}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={categoryName ? `${categoryName} category` : "Category preview"}
      onError={() => setImageFailed(true)}
      className={["border border-gray-200 object-cover", dimensions].join(" ")}
    />
  );
}

export default CategoryImagePreview;
