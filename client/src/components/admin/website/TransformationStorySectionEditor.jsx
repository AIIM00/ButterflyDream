import { useEffect, useState } from "react";

import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import { toast } from "react-toastify";

import { fetchSiteMediaAssets } from "../../../services/adminSiteMediaApi.js";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

import MediaPickerDialog from "./MediaPickerDialog.jsx";

const DEFAULT_INTRO = {
  eyebrow: "Butterfly Dream",

  title: "Every dream begins with transformation.",

  description:
    "Follow the journey from chrysalis to butterfly, and from butterfly to a piece created to carry your story.",

  buttonText: "Explore collection",

  buttonUrl: "/products",

  rotationIntervalMs: 3200,

  images: [],
};

const DEFAULT_CUSTOMIZED = {
  imageAssetId: null,

  imageAlt: "Customized Butterfly Dream accessories",

  imagePosition: "center",

  badge: "Made for you",

  eyebrow: "Made personal",

  title: "Accessories shaped around your story.",

  description:
    "Create something more personal — an accessory designed to hold meaning, celebrate a moment, or become part of someone's story.",

  details: [
    {
      label: "Personal",
      text: "Made meaningful",
    },
    {
      label: "Thoughtful",
      text: "Made for moments",
    },
    {
      label: "Yours",
      text: "Made to keep",
    },
  ],

  buttonText: "Explore customization",

  buttonUrl: "/products",
};

function normalizeStoryContent(content) {
  const intro = {
    ...DEFAULT_INTRO,
    ...(content?.intro ?? {}),
  };

  intro.images = Array.isArray(content?.intro?.images)
    ? content.intro.images
    : [];

  const customized = {
    ...DEFAULT_CUSTOMIZED,
    ...(content?.customized ?? {}),
  };

  customized.details = Array.isArray(content?.customized?.details)
    ? content.customized.details
    : DEFAULT_CUSTOMIZED.details;

  return {
    intro,
    customized,
  };
}

function TransformationStorySectionEditor({ section, onClose, onSaved }) {
  const normalized = normalizeStoryContent(section.content);

  const [name, setName] = useState(section.name ?? "Transformation Story");

  const [intro, setIntro] = useState(normalized.intro);

  const [customized, setCustomized] = useState(normalized.customized);

  const [assetById, setAssetById] = useState(new Map());

  /*
   * "intro"      = add image to intro stack
   * "customized" = choose customized image
   */
  const [pickerTarget, setPickerTarget] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  /*
   * Load Media Library metadata so existing
   * selected images have previews.
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
        /*
         * Missing thumbnails should not
         * prevent the editor from opening.
         */
      });

    return () => {
      controller.abort();
    };
  }, []);

  function updateIntro(key, value) {
    setIntro((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateCustomized(key, value) {
    setCustomized((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateDetail(index, key, value) {
    setCustomized((current) => ({
      ...current,

      details: current.details.map((detail, detailIndex) =>
        detailIndex === index
          ? {
              ...detail,
              [key]: value,
            }
          : detail,
      ),
    }));
  }

  function addIntroImage(asset) {
    if (intro.images.length >= 3) {
      toast.error("The intro supports up to 3 editorial images.");

      return;
    }

    if (intro.images.some((image) => image.assetId === asset.id)) {
      toast.info("This image is already used in the intro.");

      return;
    }

    setAssetById((current) => {
      const next = new Map(current);

      next.set(asset.id, asset);

      return next;
    });

    setIntro((current) => ({
      ...current,

      images: [
        ...current.images,

        {
          assetId: asset.id,

          alt: asset.altText || asset.fileName || "",
        },
      ],
    }));

    setPickerTarget(null);
  }

  function selectCustomizedImage(asset) {
    setAssetById((current) => {
      const next = new Map(current);

      next.set(asset.id, asset);

      return next;
    });

    setCustomized((current) => ({
      ...current,

      imageAssetId: asset.id,

      imageAlt: asset.altText || asset.fileName || current.imageAlt,
    }));

    setPickerTarget(null);
  }

  function handleMediaSelect(asset) {
    if (pickerTarget === "intro") {
      addIntroImage(asset);
      return;
    }

    if (pickerTarget === "customized") {
      selectCustomizedImage(asset);
    }
  }

  function updateIntroImage(index, changes) {
    setIntro((current) => ({
      ...current,

      images: current.images.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...image,
              ...changes,
            }
          : image,
      ),
    }));
  }

  function removeIntroImage(index) {
    setIntro((current) => ({
      ...current,

      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  function moveIntroImage(index, direction) {
    const destination = index + direction;

    if (destination < 0 || destination >= intro.images.length) {
      return;
    }

    setIntro((current) => {
      const images = [...current.images];

      [images[index], images[destination]] = [
        images[destination],
        images[index],
      ];

      return {
        ...current,
        images,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Section name is required.");

      return;
    }

    if (!intro.title.trim()) {
      toast.error("Intro title is required.");

      return;
    }

    if (!customized.title.trim()) {
      toast.error("Customized section title is required.");

      return;
    }

    const interval = Number(intro.rotationIntervalMs);

    if (!Number.isInteger(interval) || interval < 2000 || interval > 15000) {
      toast.error(
        "Intro image interval must be between 2000 and 15000 milliseconds.",
      );

      return;
    }

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          intro: {
            ...intro,

            eyebrow: intro.eyebrow.trim(),

            title: intro.title.trim(),

            description: intro.description.trim(),

            buttonText: intro.buttonText.trim(),

            buttonUrl: intro.buttonUrl.trim(),

            rotationIntervalMs: interval,

            images: intro.images.map((image) => ({
              assetId: image.assetId,

              alt: typeof image.alt === "string" ? image.alt.trim() : "",
            })),
          },

          customized: {
            ...customized,

            badge: customized.badge.trim(),

            eyebrow: customized.eyebrow.trim(),

            title: customized.title.trim(),

            description: customized.description.trim(),

            imageAlt: customized.imageAlt.trim(),

            buttonText: customized.buttonText.trim(),

            buttonUrl: customized.buttonUrl.trim(),

            details: customized.details.map((detail) => ({
              label: detail.label.trim(),

              text: detail.text.trim(),
            })),
          },
        },
      });

      toast.success("Transformation story updated successfully.");

      onSaved?.(updatedSection);

      onClose();
    } catch (error) {
      toast.error(
        error?.message || "Unable to update the transformation story.",
      );
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
          aria-label="Close transformation story editor"
          className="absolute inset-0 bg-gray-950/60"
        />

        <form
          onSubmit={handleSubmit}
          className="
            relative z-10
            flex
            max-h-[94vh]
            w-full
            max-w-5xl
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
                <AutoAwesomeRoundedIcon />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Homepage section
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-950">
                  Edit Transformation Story
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 disabled:opacity-50"
            >
              <CloseRoundedIcon />
            </button>
          </header>

          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            {/* Section name */}
            <label className="block">
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

            {/* INTRO */}
            <section className="rounded-2xl border border-gray-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Part 1
                </p>

                <h4 className="mt-1 text-lg font-bold text-gray-950">
                  Transformation Intro
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  The opening copy and editorial image stack beside the
                  butterfly animation.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Eyebrow
                  </span>

                  <input
                    type="text"
                    value={intro.eyebrow}
                    onChange={(event) =>
                      updateIntro("eyebrow", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Image rotation
                  </span>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={2000}
                      max={15000}
                      step={100}
                      value={intro.rotationIntervalMs}
                      onChange={(event) =>
                        updateIntro("rotationIntervalMs", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                    />

                    <span className="text-sm text-gray-500">ms</span>
                  </div>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-gray-800">
                  Title
                </span>

                <input
                  type="text"
                  value={intro.title}
                  onChange={(event) => updateIntro("title", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-gray-800">
                  Description
                </span>

                <textarea
                  rows={4}
                  value={intro.description}
                  onChange={(event) =>
                    updateIntro("description", event.target.value)
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-gray-950"
                />
              </label>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Button text
                  </span>

                  <input
                    type="text"
                    value={intro.buttonText}
                    onChange={(event) =>
                      updateIntro("buttonText", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Button URL
                  </span>

                  <input
                    type="text"
                    value={intro.buttonUrl}
                    onChange={(event) =>
                      updateIntro("buttonUrl", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>
              </div>

              {/* Intro images */}
              <div className="mt-7 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-gray-950">
                      Editorial images
                    </h5>

                    <p className="mt-1 text-xs text-gray-500">
                      {intro.images.length}
                      /3 selected
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={intro.images.length >= 3}
                    onClick={() => setPickerTarget("intro")}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-40"
                  >
                    <AddPhotoAlternateRoundedIcon fontSize="small" />
                    Add image
                  </button>
                </div>

                {intro.images.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setPickerTarget("intro")}
                    className="mt-4 flex min-h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm font-semibold text-gray-600 hover:border-gray-950"
                  >
                    Choose images from Media Library
                  </button>
                ) : (
                  <div className="mt-4 space-y-3">
                    {intro.images.map((image, index) => {
                      const asset = assetById.get(image.assetId);

                      return (
                        <div
                          key={image.assetId}
                          className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
                        >
                          <div className="overflow-hidden rounded-xl bg-gray-200">
                            {asset?.imageUrl ? (
                              <img
                                src={asset.imageUrl}
                                alt={image.alt || asset.fileName}
                                className="aspect-square h-full w-full object-cover"
                              />
                            ) : (
                              <div className="aspect-square" />
                            )}
                          </div>

                          <label className="self-center">
                            <span className="text-xs font-semibold text-gray-700">
                              Alt text
                            </span>

                            <input
                              type="text"
                              value={image.alt ?? ""}
                              onChange={(event) =>
                                updateIntroImage(index, {
                                  alt: event.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                            />
                          </label>

                          <div className="flex gap-1 sm:flex-col">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveIntroImage(index, -1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                            >
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            </button>

                            <button
                              type="button"
                              disabled={index === intro.images.length - 1}
                              onClick={() => moveIntroImage(index, 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                            >
                              <ArrowDownwardRoundedIcon fontSize="small" />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeIntroImage(index)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-600 hover:bg-red-50"
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* CUSTOMIZED */}
            <section className="rounded-2xl border border-gray-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Part 2
                </p>

                <h4 className="mt-1 text-lg font-bold text-gray-950">
                  Customized Story
                </h4>
              </div>

              {/* Customized image */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-800">
                  Main image
                </p>

                {customized.imageAssetId ? (
                  <div className="mt-3 grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-2xl bg-gray-100">
                      {assetById.get(customized.imageAssetId)?.imageUrl && (
                        <img
                          src={assetById.get(customized.imageAssetId).imageUrl}
                          alt={customized.imageAlt}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerTarget("customized")}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-950"
                      >
                        <EditRoundedIcon fontSize="small" />
                        Replace
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCustomized("imageAssetId", null)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerTarget("customized")}
                    className="mt-3 flex min-h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm font-semibold text-gray-600 hover:border-gray-950"
                  >
                    Choose image from Media Library
                  </button>
                )}

                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-gray-800">
                    Image alt text
                  </span>

                  <input
                    type="text"
                    value={customized.imageAlt}
                    onChange={(event) =>
                      updateCustomized("imageAlt", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Floating badge
                  </span>

                  <input
                    value={customized.badge}
                    onChange={(event) =>
                      updateCustomized("badge", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Eyebrow
                  </span>

                  <input
                    value={customized.eyebrow}
                    onChange={(event) =>
                      updateCustomized("eyebrow", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-gray-800">
                  Title
                </span>

                <input
                  value={customized.title}
                  onChange={(event) =>
                    updateCustomized("title", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-gray-800">
                  Description
                </span>

                <textarea
                  rows={4}
                  value={customized.description}
                  onChange={(event) =>
                    updateCustomized("description", event.target.value)
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-gray-950"
                />
              </label>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-800">
                  Editorial details
                </p>

                <div className="mt-3 space-y-3">
                  {customized.details.map((detail, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl bg-gray-50 p-3 sm:grid-cols-2"
                    >
                      <input
                        value={detail.label}
                        placeholder="Label"
                        onChange={(event) =>
                          updateDetail(index, "label", event.target.value)
                        }
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                      />

                      <input
                        value={detail.text}
                        placeholder="Description"
                        onChange={(event) =>
                          updateDetail(index, "text", event.target.value)
                        }
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Button text
                  </span>

                  <input
                    value={customized.buttonText}
                    onChange={(event) =>
                      updateCustomized("buttonText", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-gray-800">
                    Button URL
                  </span>

                  <input
                    value={customized.buttonUrl}
                    onChange={(event) =>
                      updateCustomized("buttonUrl", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                  />
                </label>
              </div>
            </section>
          </div>

          <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <CheckRoundedIcon fontSize="small" />

              {isSaving ? "Saving..." : "Save story"}
            </button>
          </footer>
        </form>
      </div>

      {pickerTarget && (
        <MediaPickerDialog
          onClose={() => setPickerTarget(null)}
          onSelect={handleMediaSelect}
        />
      )}
    </>
  );
}

export default TransformationStorySectionEditor;
