import { useEffect, useState } from "react";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { fetchSiteMediaAssets } from "../../../services/adminSiteMediaApi";

function normalizeSelectedAsset(asset) {
  return {
    id: asset.id ?? asset.mediaAssetId,

    imageUrl: asset.imageUrl ?? "",

    fileName: asset.fileName ?? "Media image",

    altText: asset.altText ?? "",
  };
}

function MediaPickerDialog({
  onClose,

  /*
   * Existing behavior.
   *
   * Used by homepage editors that select
   * one image.
   */
  onSelect,

  /*
   * Multi-select mode.
   *
   * Used by popup posts.
   */
  multiple = false,
  selectedAssets = [],
  maxSelection = 20,
  onConfirm,
}) {
  const [assets, setAssets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  /*
   * Map lets us retain the entire
   * selected asset object, not only ID.
   *
   * It also preserves selection order.
   */
  const [selectedAssetMap, setSelectedAssetMap] = useState(() => {
    const map = new Map();

    if (multiple) {
      selectedAssets.forEach((asset) => {
        const normalized = normalizeSelectedAsset(asset);

        if (normalized.id) {
          map.set(normalized.id, normalized);
        }
      });
    }

    return map;
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchSiteMediaAssets(
      {
        page: 1,
        limit: 100,
        search,
      },
      {
        signal: controller.signal,
      },
    )
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        setAssets(Array.isArray(response.assets) ? response.assets : []);

        setError(null);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [search]);

  function handleSearch(event) {
    event.preventDefault();

    setIsLoading(true);

    setSearch(searchInput.trim());
  }

  function handleAssetClick(asset) {
    /*
     * Preserve current single-image
     * Media Picker behavior.
     */
    if (!multiple) {
      onSelect?.(asset);

      return;
    }

    setSelectedAssetMap((current) => {
      const next = new Map(current);

      if (next.has(asset.id)) {
        next.delete(asset.id);

        return next;
      }

      if (next.size >= maxSelection) {
        return next;
      }

      next.set(asset.id, normalizeSelectedAsset(asset));

      return next;
    });
  }

  function handleConfirm() {
    if (!multiple) {
      return;
    }

    onConfirm?.(Array.from(selectedAssetMap.values()));
  }

  function clearSelection() {
    setSelectedAssetMap(new Map());
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close Media Library"
        className="absolute inset-0 bg-gray-950/70"
      />

      <div
        className="
          relative
          z-10
          flex
          max-h-[90vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}
        <header
          className="
            flex
            items-start
            justify-between
            gap-5
            border-b
            border-gray-200
            px-6
            py-5
          "
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Website Media
            </p>

            <h3 className="mt-1 text-xl font-bold text-gray-950">
              {multiple ? "Choose popup photos" : "Choose an image"}
            </h3>

            {multiple && (
              <p className="mt-1 text-sm text-gray-500">
                Select up to {maxSelection} images.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              inline-flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-950
            "
          >
            <CloseRoundedIcon />
          </button>
        </header>

        {/* SEARCH */}
        <div className="border-b border-gray-200 p-5">
          <form onSubmit={handleSearch} className="relative">
            <SearchRoundedIcon
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
              fontSize="small"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search Media Library..."
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                py-3
                pl-10
                pr-4
                text-sm
                outline-none
                focus:border-gray-950
              "
            />
          </form>
        </div>

        {/* MEDIA */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div
              className="
                grid
                grid-cols-2
                gap-4

                sm:grid-cols-3

                lg:grid-cols-4
              "
            >
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                      aspect-square
                      animate-pulse
                      rounded-2xl
                      bg-gray-100
                    "
                />
              ))}
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">
              {error.message || "Unable to load the Media Library."}
            </p>
          ) : assets.length === 0 ? (
            <div className="py-16 text-center">
              <PhotoLibraryRoundedIcon
                sx={{
                  fontSize: 42,
                }}
                className="text-gray-300"
              />

              <p className="mt-3 font-semibold text-gray-950">
                No images found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Upload images from the Media tab first.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-2
                gap-4

                sm:grid-cols-3

                lg:grid-cols-4
              "
            >
              {assets.map((asset) => {
                const isSelected = multiple && selectedAssetMap.has(asset.id);

                const selectedIndex = isSelected
                  ? Array.from(selectedAssetMap.keys()).indexOf(asset.id) + 1
                  : null;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleAssetClick(asset)}
                    className={[
                      `
                          group
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          bg-white
                          text-left
                          transition
                          hover:shadow-md
                        `,

                      isSelected
                        ? "border-gray-950 ring-2 ring-gray-950/15"
                        : "border-gray-200 hover:border-gray-950",
                    ].join(" ")}
                  >
                    <div className="relative">
                      <img
                        src={asset.imageUrl}
                        alt={asset.altText || asset.fileName}
                        loading="lazy"
                        className="
                            aspect-square
                            w-full
                            object-cover
                          "
                      />

                      {/* MULTI SELECT STATE */}
                      {multiple && (
                        <span
                          className={[
                            `
                                absolute
                                right-2.5
                                top-2.5
                                inline-flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-full
                                border
                                text-xs
                                font-bold
                                shadow-sm
                                transition
                              `,

                            isSelected
                              ? "border-gray-950 bg-gray-950 text-white"
                              : "border-white/80 bg-white/85 text-transparent backdrop-blur-sm",
                          ].join(" ")}
                        >
                          {isSelected ? (
                            selectedIndex
                          ) : (
                            <CheckRoundedIcon
                              sx={{
                                fontSize: 16,
                              }}
                            />
                          )}
                        </span>
                      )}

                      {isSelected && (
                        <div className="pointer-events-none absolute inset-0 bg-gray-950/5" />
                      )}
                    </div>

                    <div className="p-3">
                      <p className="truncate text-xs font-bold text-gray-950">
                        {asset.fileName}
                      </p>

                      <p className="mt-1 truncate text-[0.7rem] text-gray-500">
                        {asset.altText || "No alt text"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* MULTI SELECT FOOTER */}
        {multiple && (
          <footer
            className="
              flex
              flex-col
              gap-3
              border-t
              border-gray-200
              bg-gray-50
              px-6
              py-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-950">
                  {selectedAssetMap.size}
                </span>{" "}
                of {maxSelection} selected
              </p>

              {selectedAssetMap.size > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-950"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedAssetMap.size === 0}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gray-950
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <CheckRoundedIcon fontSize="small" />
                Use selected photos
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default MediaPickerDialog;
