import { useEffect, useRef, useState } from "react";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { toast } from "react-toastify";

import {
  deleteSiteMediaAsset,
  fetchSiteMediaAssets,
  updateSiteMediaAsset,
  uploadSiteMedia,
  validateSiteMediaFile,
} from "../../../services/adminSiteMediaApi";

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function MediaLoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="aspect-square animate-pulse bg-gray-100" />

          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MediaEditDialog({ asset, isSaving, onClose, onSave }) {
  const [fileName, setFileName] = useState(asset.fileName ?? "");

  const [altText, setAltText] = useState(asset.altText ?? "");

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      fileName,
      altText,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close media editor"
        onClick={onClose}
        disabled={isSaving}
        className="absolute inset-0 bg-gray-950/60"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Media Library
            </p>

            <h3 className="mt-1 text-xl font-bold text-gray-950">Edit image</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="
              inline-flex
              h-10 w-10
              items-center justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-950
              disabled:opacity-50
            "
          >
            <CloseRoundedIcon />
          </button>
        </header>

        <div className="space-y-5 p-6">
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={asset.imageUrl}
              alt={asset.altText || asset.fileName}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-gray-800">
              File name
            </span>

            <input
              type="text"
              value={fileName}
              maxLength={255}
              disabled={isSaving}
              onChange={(event) => setFileName(event.target.value)}
              className="
                mt-2
                w-full
                rounded-xl
                border border-gray-300
                bg-white
                px-4 py-3
                text-sm
                text-gray-950
                outline-none
                transition
                focus:border-gray-950
                focus:ring-2
                focus:ring-gray-950/10
                disabled:bg-gray-100
              "
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-800">
              Alt text
            </span>

            <textarea
              value={altText}
              maxLength={300}
              rows={4}
              disabled={isSaving}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Describe the image for accessibility and SEO."
              className="
                mt-2
                w-full
                resize-none
                rounded-xl
                border border-gray-300
                bg-white
                px-4 py-3
                text-sm
                leading-6
                text-gray-950
                outline-none
                transition
                focus:border-gray-950
                focus:ring-2
                focus:ring-gray-950/10
                disabled:bg-gray-100
              "
            />

            <span className="mt-1 block text-right text-xs text-gray-400">
              {altText.length}/300
            </span>
          </label>
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="
              rounded-xl
              border border-gray-300
              bg-white
              px-5 py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-100
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || !fileName.trim()}
            className="
              inline-flex
              items-center justify-center
              gap-2
              rounded-xl
              bg-gray-950
              px-5 py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckRoundedIcon fontSize="small" />

            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function WebsiteMediaTab() {
  const fileInputRef = useRef(null);

  /*
   * Holds the current local object URL so it can
   * always be revoked safely without deriving it
   * inside an effect.
   */
  const previewUrlRef = useRef("");

  const [assets, setAssets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [uploadAltText, setUploadAltText] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);

  const [isUploading, setIsUploading] = useState(false);

  const [editingAsset, setEditingAsset] = useState(null);

  const [isSavingAsset, setIsSavingAsset] = useState(false);

  const [deletingAssetId, setDeletingAssetId] = useState(null);

  /*
   * Load Media Library.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadMedia() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchSiteMediaAssets(
          {
            page,
            limit: 30,
            search,
          },
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setAssets(Array.isArray(response.assets) ? response.assets : []);

        setPagination(
          response.pagination ?? {
            page,
            limit: 30,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setLoadError(error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      controller.abort();
    };
  }, [page, search, reloadKey]);

  /*
   * Only cleanup on unmount.
   *
   * There is deliberately no setState here.
   */
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);

        previewUrlRef.current = "";
      }
    };
  }, []);

  function revokePreviewUrl() {
    if (!previewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewUrlRef.current);

    previewUrlRef.current = "";
  }

  function reloadMedia() {
    setReloadKey((current) => current + 1);
  }

  function handleFile(file) {
    try {
      validateSiteMediaFile(file);

      revokePreviewUrl();

      const objectUrl = URL.createObjectURL(file);

      previewUrlRef.current = objectUrl;

      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setUploadProgress(0);
    } catch (error) {
      toast.error(error?.message || "Unable to use this image.");
    }
  }

  function handleFileInputChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    /*
     * Allows selecting the same file again.
     */
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();

    if (isUploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function clearSelectedFile() {
    if (isUploading) {
      return;
    }

    revokePreviewUrl();

    setSelectedFile(null);
    setPreviewUrl("");
    setUploadAltText("");
    setUploadProgress(0);
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadSiteMedia(selectedFile, {
        altText: uploadAltText,

        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      toast.success("Image uploaded to the Media Library successfully.");

      revokePreviewUrl();

      setSelectedFile(null);
      setPreviewUrl("");
      setUploadAltText("");
      setUploadProgress(0);

      /*
       * Newly uploaded assets appear first.
       */
      setSearchInput("");
      setSearch("");

      if (page !== 1) {
        setPage(1);
      } else {
        reloadMedia();
      }
    } catch (error) {
      toast.error(error?.message || "Unable to upload the image.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function handleSaveAsset(input) {
    if (!editingAsset) {
      return;
    }

    setIsSavingAsset(true);

    try {
      const updatedAsset = await updateSiteMediaAsset(editingAsset.id, input);

      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset.id === updatedAsset.id ? updatedAsset : asset,
        ),
      );

      setEditingAsset(null);

      toast.success("Media information updated successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to update the media asset.");
    } finally {
      setIsSavingAsset(false);
    }
  }

  async function handleDeleteAsset(asset) {
    if (deletingAssetId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${asset.fileName}"?\n\nThis removes the media record and its Cloudflare R2 image. This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingAssetId(asset.id);

    try {
      const response = await deleteSiteMediaAsset(asset.id);

      setAssets((currentAssets) =>
        currentAssets.filter((currentAsset) => currentAsset.id !== asset.id),
      );

      setPagination((current) => {
        const nextTotal = Math.max(0, current.total - 1);

        const nextTotalPages = Math.max(
          1,
          Math.ceil(nextTotal / current.limit),
        );

        return {
          ...current,
          total: nextTotal,
          totalPages: nextTotalPages,
        };
      });

      if (response.storageCleanupPending) {
        toast.warning(
          "The image was removed from the website, but Cloudflare cleanup is still required.",
        );
      } else {
        toast.success("Media image deleted successfully.");
      }

      if (assets.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }
    } catch (error) {
      toast.error(error?.message || "Unable to delete the media image.");
    } finally {
      setDeletingAssetId(null);
    }
  }

  return (
    <>
      <div className="space-y-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Upload card */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
                <CloudUploadRoundedIcon />
              </span>

              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  Upload image
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Upload JPG, PNG, or WebP images directly to Cloudflare R2.
                  Maximum file size is 10 MB.
                </p>
              </div>
            </div>

            {!selectedFile ? (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="
                  mt-6
                  flex
                  min-h-56
                  w-full
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-gray-300
                  bg-gray-50
                  px-6
                  text-center
                  transition
                  hover:border-gray-950
                  hover:bg-gray-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm">
                  <ImageOutlinedIcon />
                </span>

                <span className="mt-4 text-sm font-bold text-gray-950">
                  Drop an image here
                </span>

                <span className="mt-1 text-sm text-gray-500">
                  or click to browse
                </span>
              </button>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Selected upload preview"
                      className="aspect-square h-full w-full object-cover"
                    />
                  )}

                  {!isUploading && (
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      aria-label="Remove selected image"
                      className="
                        absolute
                        right-2 top-2
                        inline-flex
                        h-9 w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-950/80
                        text-white
                        backdrop-blur
                        transition
                        hover:bg-gray-950
                      "
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </button>
                  )}
                </div>

                <div>
                  <p className="truncate text-sm font-bold text-gray-950">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>

                  <label className="mt-4 block">
                    <span className="text-sm font-semibold text-gray-800">
                      Alt text
                    </span>

                    <textarea
                      value={uploadAltText}
                      maxLength={300}
                      rows={3}
                      disabled={isUploading}
                      onChange={(event) => setUploadAltText(event.target.value)}
                      placeholder="Describe the image for accessibility and SEO."
                      className="
                        mt-2
                        w-full
                        resize-none
                        rounded-xl
                        border border-gray-300
                        px-4 py-3
                        text-sm
                        outline-none
                        transition
                        focus:border-gray-950
                        focus:ring-2
                        focus:ring-gray-950/10
                        disabled:bg-gray-100
                      "
                    />

                    <span className="mt-1 block text-right text-xs text-gray-400">
                      {uploadAltText.length}
                      /300
                    </span>
                  </label>

                  {isUploading && (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs font-semibold text-gray-600">
                        <span>Uploading to Cloudflare</span>

                        <span>{uploadProgress}%</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gray-950 transition-[width]"
                          style={{
                            width: `${uploadProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gray-950
                      px-5 py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-gray-800
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <CloudUploadRoundedIcon fontSize="small" />

                    {isUploading
                      ? `Uploading ${uploadProgress}%`
                      : "Upload image"}
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </section>

          {/* Media count */}
          <aside className="rounded-2xl border border-gray-200 bg-gray-950 p-6 text-white">
            <PhotoLibraryRoundedIcon />

            <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-gray-400">
              Media Library
            </p>

            <p className="mt-2 text-4xl font-bold">{pagination.total}</p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Images stored for homepage sections, banners, campaigns,
              collections, and other storefront content.
            </p>
          </aside>
        </div>

        {/* Media library */}
        <section>
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-950">Media Library</h3>

              <p className="mt-1 text-sm text-gray-600">
                Select and reuse website images uploaded to Cloudflare.
              </p>
            </div>

            <div className="flex gap-2">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1 sm:w-72"
              >
                <SearchRoundedIcon
                  fontSize="small"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search images..."
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-white
                    py-2.5
                    pl-10 pr-4
                    text-sm
                    outline-none
                    focus:border-gray-950
                  "
                />
              </form>

              <button
                type="button"
                onClick={reloadMedia}
                disabled={isLoading}
                title="Refresh media"
                className="
                  inline-flex
                  h-11 w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border border-gray-300
                  bg-white
                  text-gray-600
                  transition
                  hover:border-gray-950
                  hover:text-gray-950
                  disabled:opacity-50
                "
              >
                <RefreshRoundedIcon
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {search && (
            <div className="mb-5 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Showing results for</span>

              <span className="font-semibold text-gray-950">“{search}”</span>

              <button
                type="button"
                onClick={clearSearch}
                className="ml-1 font-semibold text-gray-600 underline hover:text-gray-950"
              >
                Clear
              </button>
            </div>
          )}

          {isLoading ? (
            <MediaLoadingGrid />
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-900">
                Unable to load the Media Library.
              </p>

              <p className="mt-2 text-sm text-red-700">
                {loadError?.message || "An unexpected error occurred."}
              </p>

              <button
                type="button"
                onClick={reloadMedia}
                className="mt-5 rounded-xl bg-red-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <PhotoLibraryRoundedIcon
                sx={{
                  fontSize: 40,
                }}
                className="text-gray-300"
              />

              <h4 className="mt-4 font-bold text-gray-950">
                {search ? "No images found" : "Your Media Library is empty"}
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search
                  ? "Try another filename or alt-text search."
                  : "Upload your first website image above. It will appear here and remain available for homepage sections."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {assets.map((asset) => (
                <article
                  key={asset.id}
                  className="
                    group
                    overflow-hidden
                    rounded-2xl
                    border border-gray-200
                    bg-white
                    transition
                    hover:border-gray-300
                    hover:shadow-md
                  "
                >
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={asset.imageUrl}
                      alt={asset.altText || asset.fileName}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditingAsset(asset)}
                        className="
                          inline-flex
                          h-9 w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-gray-700
                          shadow
                          transition
                          hover:bg-gray-950
                          hover:text-white
                        "
                        aria-label={`Edit ${asset.fileName}`}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset)}
                        disabled={deletingAssetId === asset.id}
                        className="
                          inline-flex
                          h-9 w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-red-600
                          shadow
                          transition
                          hover:bg-red-600
                          hover:text-white
                          disabled:opacity-50
                        "
                        aria-label={`Delete ${asset.fileName}`}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p
                      className="truncate text-sm font-bold text-gray-950"
                      title={asset.fileName}
                    >
                      {asset.fileName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {asset.width && asset.height
                        ? `${asset.width} × ${asset.height} · `
                        : ""}

                      {formatFileSize(asset.fileSize)}
                    </p>

                    <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">
                      {asset.altText || "No alt text added yet."}
                    </p>

                    <button
                      type="button"
                      onClick={() => setEditingAsset(asset)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 transition hover:text-gray-950"
                    >
                      <EditRoundedIcon
                        sx={{
                          fontSize: 16,
                        }}
                      />
                      Edit details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && !loadError && pagination.totalPages > 1 && (
            <div className="mt-7 flex items-center justify-between border-t border-gray-200 pt-5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-2.5
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:border-gray-950
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
              >
                Previous
              </button>

              <p className="text-sm text-gray-500">
                Page{" "}
                <strong className="text-gray-950">{pagination.page}</strong> of{" "}
                <strong className="text-gray-950">
                  {pagination.totalPages}
                </strong>
              </p>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-2.5
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:border-gray-950
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      {editingAsset && (
        <MediaEditDialog
          key={editingAsset.id}
          asset={editingAsset}
          isSaving={isSavingAsset}
          onSave={handleSaveAsset}
          onClose={() => {
            if (!isSavingAsset) {
              setEditingAsset(null);
            }
          }}
        />
      )}
    </>
  );
}

export default WebsiteMediaTab;
