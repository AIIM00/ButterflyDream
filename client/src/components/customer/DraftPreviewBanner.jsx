import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import useSiteTheme from "../../context/site-theme/useSiteTheme.js";

function exitPreview() {
  const url = new URL(window.location.href);

  url.hash = "";

  window.location.replace(url.toString());
}

function DraftPreviewBanner() {
  const { isDraftPreview, themeError } = useSiteTheme();

  if (!isDraftPreview) {
    return null;
  }

  return (
    <div
      className={`
        relative
        z-[100]
        flex
        min-h-11
        items-center
        justify-center
        gap-3
        px-4
        py-2
        text-center
        text-xs
        font-semibold

        ${themeError ? "bg-red-700 text-white" : "bg-gray-950 text-white"}
      `}
    >
      {themeError ? (
        <WarningAmberRoundedIcon sx={{ fontSize: 17 }} />
      ) : (
        <PreviewRoundedIcon sx={{ fontSize: 17 }} />
      )}

      <span>
        {themeError
          ? themeError.message
          : "Draft preview — customers cannot see these changes yet."}
      </span>

      <button
        type="button"
        onClick={exitPreview}
        className="
          ml-1
          rounded-full
          border
          border-white/30
          px-3
          py-1
          text-[0.65rem]
          font-bold
          uppercase
          tracking-wider
          transition
          hover:bg-white
          hover:text-gray-950
        "
      >
        Exit preview
      </button>
    </div>
  );
}

export default DraftPreviewBanner;
