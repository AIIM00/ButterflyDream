import { useEffect, useState } from "react";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import WallpaperRoundedIcon from "@mui/icons-material/WallpaperRounded";

import { toast } from "react-toastify";

import { fetchSiteMediaAssets } from "../../../services/adminSiteMediaApi.js";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

import MediaPickerDialog from "./MediaPickerDialog.jsx";

const IMAGE_FOCUS_OPTIONS = [
  {
    value: "center",
    label: "Center",
  },
  {
    value: "top",
    label: "Top",
  },
  {
    value: "bottom",
    label: "Bottom",
  },
  {
    value: "left",
    label: "Left",
  },
  {
    value: "right",
    label: "Right",
  },
];

const DEFAULT_IMAGE_TEXT = {
  eyebrow: "Butterfly Dream",

  title: "Details that make it yours.",

  description:
    "Discover pieces designed around elegance, individuality, and the moments that become part of your story.",

  assetId: null,

  imageAlt: "",

  imageSide: "left",

  imageFocus: "center",

  buttonText: "Explore collection",

  buttonUrl: "/products",
};

const DEFAULT_IMAGE_BANNER = {
  eyebrow: "Butterfly Dream",

  title: "A moment worth carrying with you.",

  description:
    "Pieces created to turn meaningful moments into something you can keep.",

  assetId: null,

  imageAlt: "",

  imageFocus: "center",

  textAlign: "left",

  overlayStrength: "medium",

  buttonText: "Discover more",

  buttonUrl: "/products",
};

function normalizeContent(section) {
  const isBanner = section.type === "IMAGE_BANNER";

  const defaults = isBanner ? DEFAULT_IMAGE_BANNER : DEFAULT_IMAGE_TEXT;

  const original = section.content ?? {};

  const content = {
    ...defaults,
    ...original,

    /*
     * Backward compatibility with our
     * original IMAGE_TEXT placeholder.
     */
    assetId: original.assetId ?? original.imageAssetId ?? null,
  };

  if (!isBanner) {
    content.imageSide =
      original.imageSide ??
      (original.imagePosition === "right" ? "right" : "left");

    content.imageFocus = original.imageFocus ?? "center";
  }

  if (isBanner) {
    content.imageFocus =
      original.imageFocus ??
      (IMAGE_FOCUS_OPTIONS.some(
        (option) => option.value === original.imagePosition,
      )
        ? original.imagePosition
        : "center");
  }

  return content;
}

function FlexibleImageSectionEditor({ section, onClose, onSaved }) {
  const isBanner = section.type === "IMAGE_BANNER";

  const normalized = normalizeContent(section);

  const [name, setName] = useState(
    section.name ?? (isBanner ? "Image Banner" : "Image + Text"),
  );

  const [content, setContent] = useState(normalized);

  const [assetById, setAssetById] = useState(new Map());

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchSiteMediaAssets(
      {
        page: 1,
        limit: 100,
      },
      {
        signal: controller.signal,
      },
    )
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        setAssetById(
          new Map((response.assets ?? []).map((asset) => [asset.id, asset])),
        );
      })
      .catch(() => {
        /*
         * A preview failure should not stop
         * the section editor from working.
         */
      });

    return () => {
      controller.abort();
    };
  }, []);

  const selectedAsset = content.assetId ? assetById.get(content.assetId) : null;

  function updateContent(key, value) {
    setContent((current) => ({
      ...current,

      [key]: value,
    }));
  }

  function handleMediaSelect(asset) {
    setAssetById((current) => {
      const next = new Map(current);

      next.set(asset.id, asset);

      return next;
    });

    setContent((current) => ({
      ...current,

      assetId: asset.id,

      imageAlt: current.imageAlt || asset.altText || asset.fileName || "",
    }));

    setIsMediaPickerOpen(false);
  }

  function removeImage() {
    setContent((current) => ({
      ...current,

      assetId: null,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Section name is required.");

      return;
    }

    if (!content.title?.trim()) {
      toast.error("Section title is required.");

      return;
    }

    if (!content.assetId) {
      toast.error("Choose an image from the Media Library.");

      return;
    }

    if (content.buttonText?.trim() && !content.buttonUrl?.trim()) {
      toast.error("Add a destination URL for the button.");

      return;
    }

    const nextContent = isBanner
      ? {
          eyebrow: content.eyebrow?.trim() ?? "",

          title: content.title.trim(),

          description: content.description?.trim() ?? "",

          assetId: content.assetId,

          imageAlt: content.imageAlt?.trim() ?? "",

          imageFocus: content.imageFocus || "center",

          textAlign: content.textAlign || "left",

          overlayStrength: content.overlayStrength || "medium",

          buttonText: content.buttonText?.trim() ?? "",

          buttonUrl: content.buttonUrl?.trim() ?? "",
        }
      : {
          eyebrow: content.eyebrow?.trim() ?? "",

          title: content.title.trim(),

          description: content.description?.trim() ?? "",

          assetId: content.assetId,

          imageAlt: content.imageAlt?.trim() ?? "",

          imageSide: content.imageSide || "left",

          imageFocus: content.imageFocus || "center",

          buttonText: content.buttonText?.trim() ?? "",

          buttonUrl: content.buttonUrl?.trim() ?? "",
        };

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: nextContent,
      });

      toast.success(
        isBanner
          ? "Image banner updated successfully."
          : "Image + Text section updated successfully.",
      );

      onSaved?.(updatedSection);

      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update the section.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close section editor"
          className="absolute inset-0 bg-gray-950/60"
        />

        <form
          onSubmit={handleSubmit}
          className="
            relative
            z-10

            flex
            max-h-[94vh]
            w-full
            max-w-4xl
            flex-col

            overflow-hidden

            rounded-2xl
            bg-white
            shadow-2xl
          "
        >
          <header className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <span
                className="
                  inline-flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-950
                  text-white
                "
              >
                {isBanner ? <WallpaperRoundedIcon /> : <ImageRoundedIcon />}
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Flexible section
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-950">
                  {isBanner ? "Edit Image Banner" : "Edit Image + Text"}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Close"
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-gray-500
                hover:bg-gray-100
                hover:text-gray-950
              "
            >
              <CloseRoundedIcon />
            </button>
          </header>

          <div className="flex-1 space-y-7 overflow-y-auto p-6">
            {/* BASIC CONTENT */}
            <section className="rounded-2xl border border-gray-200 p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Admin section name
                  </span>

                  <input
                    value={name}
                    maxLength={120}
                    disabled={isSaving}
                    onChange={(event) => setName(event.target.value)}
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Eyebrow
                  </span>

                  <input
                    value={content.eyebrow ?? ""}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateContent("eyebrow", event.target.value)
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-gray-800">
                  Title
                </span>

                <input
                  value={content.title ?? ""}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateContent("title", event.target.value)
                  }
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                  "
                />
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-gray-800">
                  Description
                </span>

                <textarea
                  rows={4}
                  value={content.description ?? ""}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateContent("description", event.target.value)
                  }
                  className="
                    mt-2
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    leading-6
                    outline-none
                    focus:border-gray-950
                  "
                />
              </label>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Button text
                  </span>

                  <input
                    value={content.buttonText ?? ""}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateContent("buttonText", event.target.value)
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Button URL
                  </span>

                  <input
                    value={content.buttonUrl ?? ""}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateContent("buttonUrl", event.target.value)
                    }
                    placeholder="/products"
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  />
                </label>
              </div>
            </section>

            {/* IMAGE */}
            <section className="rounded-2xl border border-gray-200 p-5">
              <div>
                <h4 className="font-bold text-gray-950">Image</h4>

                <p className="mt-1 text-xs text-gray-500">
                  Selected from the Butterfly Dream Media Library.
                </p>
              </div>

              {content.assetId ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl bg-gray-100">
                    {selectedAsset?.imageUrl ? (
                      <img
                        src={selectedAsset.imageUrl}
                        alt={content.imageAlt || selectedAsset.fileName}
                        className="aspect-[4/5] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center text-gray-400">
                        <ImageRoundedIcon />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-gray-300
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-gray-700
                          hover:border-gray-950
                        "
                      >
                        <EditRoundedIcon fontSize="small" />
                        Replace image
                      </button>

                      <button
                        type="button"
                        onClick={removeImage}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-red-600
                          hover:bg-red-50
                        "
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                        Remove
                      </button>
                    </div>

                    <label className="mt-4 block">
                      <span className="text-sm font-semibold text-gray-800">
                        Image alt text
                      </span>

                      <input
                        value={content.imageAlt ?? ""}
                        onChange={(event) =>
                          updateContent("imageAlt", event.target.value)
                        }
                        className="
                          mt-2
                          w-full
                          rounded-xl
                          border
                          border-gray-300
                          px-4
                          py-3
                          text-sm
                          outline-none
                          focus:border-gray-950
                        "
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="
                    mt-5
                    flex
                    min-h-44
                    w-full
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border-2
                    border-dashed
                    border-gray-300
                    bg-gray-50
                    text-gray-500
                    transition
                    hover:border-gray-950
                    hover:text-gray-950
                  "
                >
                  <ImageRoundedIcon />

                  <span className="mt-2 text-sm font-semibold">
                    Choose from Media Library
                  </span>
                </button>
              )}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Image focus
                  </span>

                  <select
                    value={content.imageFocus ?? "center"}
                    onChange={(event) =>
                      updateContent("imageFocus", event.target.value)
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  >
                    {IMAGE_FOCUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {!isBanner && (
                  <label>
                    <span className="text-sm font-semibold text-gray-800">
                      Desktop image side
                    </span>

                    <select
                      value={content.imageSide ?? "left"}
                      onChange={(event) =>
                        updateContent("imageSide", event.target.value)
                      }
                      className="
                        mt-2
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        bg-white
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-gray-950
                      "
                    >
                      <option value="left">Left</option>

                      <option value="right">Right</option>
                    </select>
                  </label>
                )}

                {isBanner && (
                  <label>
                    <span className="text-sm font-semibold text-gray-800">
                      Text alignment
                    </span>

                    <select
                      value={content.textAlign ?? "left"}
                      onChange={(event) =>
                        updateContent("textAlign", event.target.value)
                      }
                      className="
                        mt-2
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        bg-white
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-gray-950
                      "
                    >
                      <option value="left">Left</option>

                      <option value="center">Center</option>

                      <option value="right">Right</option>
                    </select>
                  </label>
                )}
              </div>

              {isBanner && (
                <label className="mt-5 block max-w-sm">
                  <span className="text-sm font-semibold text-gray-800">
                    Image overlay
                  </span>

                  <select
                    value={content.overlayStrength ?? "medium"}
                    onChange={(event) =>
                      updateContent("overlayStrength", event.target.value)
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  >
                    <option value="light">Light</option>

                    <option value="medium">Medium</option>

                    <option value="strong">Strong</option>
                  </select>
                </label>
              )}
            </section>
          </div>

          <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
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
                hover:bg-gray-100
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
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
                hover:bg-gray-800
                disabled:opacity-50
              "
            >
              <CheckRoundedIcon fontSize="small" />

              {isSaving ? "Saving..." : "Save section"}
            </button>
          </footer>
        </form>
      </div>

      {isMediaPickerOpen && (
        <MediaPickerDialog
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </>
  );
}

export default FlexibleImageSectionEditor;
