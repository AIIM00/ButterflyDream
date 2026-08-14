import { useEffect, useState } from "react";

import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SlideshowRoundedIcon from "@mui/icons-material/SlideshowRounded";

import { toast } from "react-toastify";

import { fetchSiteMediaAssets } from "../../../services/adminSiteMediaApi.js";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

import MediaPickerDialog from "./MediaPickerDialog.jsx";

const POSITION_OPTIONS = [
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

function OpeningSliderSectionEditor({ section, onClose, onSaved }) {
  const [name, setName] = useState(section.name ?? "Opening Slider");

  const [intervalMs, setIntervalMs] = useState(
    section.content?.intervalMs ?? 5000,
  );

  const [slides, setSlides] = useState(
    Array.isArray(section.content?.slides)
      ? section.content.slides.map((slide) => ({
          assetId: slide.assetId,
          alt: slide.alt ?? "",
          position: slide.position ?? "center",
        }))
      : [],
  );

  const [assetById, setAssetById] = useState(new Map());

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  /*
   * Load asset previews for existing slides.
   */
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

        const nextMap = new Map(
          (response.assets ?? []).map((asset) => [asset.id, asset]),
        );

        setAssetById(nextMap);
      })
      .catch(() => {
        // Missing thumbnails should not prevent editing.
      });

    return () => {
      controller.abort();
    };
  }, []);

  function addAsset(asset) {
    if (slides.length >= 8) {
      toast.error("The opening slider can contain up to 8 images.");

      return;
    }

    if (slides.some((slide) => slide.assetId === asset.id)) {
      toast.info("This image is already in the slider.");

      return;
    }

    setAssetById((current) => {
      const next = new Map(current);

      next.set(asset.id, asset);

      return next;
    });

    setSlides((current) => [
      ...current,
      {
        assetId: asset.id,

        alt: asset.altText || asset.fileName || "",

        position: "center",
      },
    ]);

    setIsPickerOpen(false);
  }

  function updateSlide(index, changes) {
    setSlides((current) =>
      current.map((slide, slideIndex) =>
        slideIndex === index
          ? {
              ...slide,
              ...changes,
            }
          : slide,
      ),
    );
  }

  function removeSlide(index) {
    setSlides((current) =>
      current.filter((_, slideIndex) => slideIndex !== index),
    );
  }

  function moveSlide(index, direction) {
    const destination = index + direction;

    if (destination < 0 || destination >= slides.length) {
      return;
    }

    setSlides((current) => {
      const next = [...current];

      [next[index], next[destination]] = [next[destination], next[index]];

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const parsedInterval = Number(intervalMs);

    if (!name.trim()) {
      toast.error("Section name is required.");
      return;
    }

    if (slides.length === 0) {
      toast.error("Add at least one image to the opening slider.");

      return;
    }

    if (
      !Number.isInteger(parsedInterval) ||
      parsedInterval < 2500 ||
      parsedInterval > 15000
    ) {
      toast.error(
        "Autoplay interval must be between 2500 and 15000 milliseconds.",
      );

      return;
    }

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          intervalMs: parsedInterval,

          slides: slides.map((slide) => ({
            assetId: slide.assetId,

            alt: typeof slide.alt === "string" ? slide.alt.trim() : "",

            position: slide.position,
          })),
        },
      });

      toast.success("Opening slider updated successfully.");

      onSaved?.(updatedSection);
      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update the opening slider.");
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
          aria-label="Close opening slider editor"
          className="absolute inset-0 bg-gray-950/60"
        />

        <form
          onSubmit={handleSubmit}
          className="
            relative z-10
            flex
            max-h-[92vh]
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
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-white">
                <SlideshowRoundedIcon />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Homepage section
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-950">
                  Edit Opening Slider
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            >
              <CloseRoundedIcon />
            </button>
          </header>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Section name
                </span>

                <input
                  type="text"
                  value={name}
                  maxLength={120}
                  disabled={isSaving}
                  onChange={(event) => setName(event.target.value)}
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border border-gray-300
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                    focus:ring-2
                    focus:ring-gray-950/10
                  "
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Autoplay interval
                </span>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={2500}
                    max={15000}
                    step={500}
                    value={intervalMs}
                    disabled={isSaving}
                    onChange={(event) => setIntervalMs(event.target.value)}
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      px-4 py-3
                      text-sm
                      outline-none
                      focus:border-gray-950
                    "
                  />

                  <span className="text-sm text-gray-500">ms</span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  5000 ms = 5 seconds.
                </p>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div>
                <h4 className="font-bold text-gray-950">Slider images</h4>

                <p className="mt-1 text-xs text-gray-500">
                  {slides.length}/8 images
                </p>
              </div>

              <button
                type="button"
                disabled={isSaving || slides.length >= 8}
                onClick={() => setIsPickerOpen(true)}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border border-gray-300
                  bg-white
                  px-4 py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:border-gray-950
                  hover:text-gray-950
                  disabled:opacity-40
                "
              >
                <AddPhotoAlternateRoundedIcon fontSize="small" />
                Add image
              </button>
            </div>

            {slides.length === 0 ? (
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="
                  flex
                  min-h-52
                  w-full
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-gray-300
                  bg-gray-50
                  text-center
                  transition
                  hover:border-gray-950
                "
              >
                <AddPhotoAlternateRoundedIcon
                  sx={{
                    fontSize: 38,
                  }}
                  className="text-gray-400"
                />

                <span className="mt-3 font-semibold text-gray-950">
                  Choose images from Media Library
                </span>
              </button>
            ) : (
              <div className="space-y-4">
                {slides.map((slide, index) => {
                  const asset = assetById.get(slide.assetId);

                  return (
                    <article
                      key={slide.assetId}
                      className="
                        grid
                        gap-4
                        rounded-2xl
                        border border-gray-200
                        bg-gray-50
                        p-4
                        sm:grid-cols-[9rem_minmax(0,1fr)_auto]
                      "
                    >
                      <div className="overflow-hidden rounded-xl bg-gray-200">
                        {asset?.imageUrl ? (
                          <img
                            src={asset.imageUrl}
                            alt={slide.alt || asset.altText || asset.fileName}
                            className="aspect-square h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center text-xs text-gray-400">
                            Image
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Slide {index + 1}
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-gray-950">
                            {asset?.fileName || "Media image"}
                          </p>
                        </div>

                        <label className="block">
                          <span className="text-xs font-semibold text-gray-700">
                            Alt text
                          </span>

                          <input
                            type="text"
                            value={slide.alt}
                            maxLength={300}
                            disabled={isSaving}
                            onChange={(event) =>
                              updateSlide(index, {
                                alt: event.target.value,
                              })
                            }
                            className="
                              mt-1
                              w-full
                              rounded-xl
                              border border-gray-300
                              bg-white
                              px-3 py-2
                              text-sm
                              outline-none
                              focus:border-gray-950
                            "
                          />
                        </label>

                        <label className="block">
                          <span className="text-xs font-semibold text-gray-700">
                            Image position
                          </span>

                          <select
                            value={slide.position}
                            disabled={isSaving}
                            onChange={(event) =>
                              updateSlide(index, {
                                position: event.target.value,
                              })
                            }
                            className="
                              mt-1
                              w-full
                              rounded-xl
                              border border-gray-300
                              bg-white
                              px-3 py-2
                              text-sm
                              outline-none
                              focus:border-gray-950
                            "
                          >
                            {POSITION_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="flex gap-1 sm:flex-col">
                        <button
                          type="button"
                          disabled={index === 0 || isSaving}
                          onClick={() => moveSlide(index, -1)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 hover:text-gray-950 disabled:opacity-30"
                        >
                          <ArrowUpwardRoundedIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          disabled={index === slides.length - 1 || isSaving}
                          onClick={() => moveSlide(index, 1)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 hover:text-gray-950 disabled:opacity-30"
                        >
                          <ArrowDownwardRoundedIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => removeSlide(index)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 hover:bg-red-50"
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
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
                px-5 py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-gray-800
                disabled:opacity-50
              "
            >
              <CheckRoundedIcon fontSize="small" />

              {isSaving ? "Saving..." : "Save slider"}
            </button>
          </footer>
        </form>
      </div>

      {isPickerOpen && (
        <MediaPickerDialog
          onClose={() => setIsPickerOpen(false)}
          onSelect={addAsset}
        />
      )}
    </>
  );
}

export default OpeningSliderSectionEditor;
