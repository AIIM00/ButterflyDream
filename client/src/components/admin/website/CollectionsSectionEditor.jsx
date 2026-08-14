import { useEffect, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { toast } from "react-toastify";

import { fetchSiteMediaAssets } from "../../../services/adminSiteMediaApi.js";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

import MediaPickerDialog from "./MediaPickerDialog.jsx";

const MAX_COLLECTIONS = 6;

const DEFAULT_CONTENT = {
  eyebrow: "Our collection",

  title: "Timeless pieces for every moment.",

  description:
    "Discover collections shaped around everyday beauty, meaningful gifts, modern elegance, and pieces made especially for you.",

  items: [],
};

const IMAGE_POSITIONS = [
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

function createCollectionItem() {
  return {
    title: "",
    description: "",

    assetId: null,

    imageAlt: "",

    imagePosition: "center",

    buttonUrl: "/products",
  };
}

function CollectionsSectionEditor({ section, onClose, onSaved }) {
  const content = {
    ...DEFAULT_CONTENT,
    ...(section.content ?? {}),
  };

  const [name, setName] = useState(section.name ?? "Our Collection");

  const [eyebrow, setEyebrow] = useState(content.eyebrow);

  const [title, setTitle] = useState(content.title);

  const [description, setDescription] = useState(content.description);

  const [items, setItems] = useState(
    Array.isArray(content.items) ? content.items : [],
  );

  const [assetById, setAssetById] = useState(new Map());

  const [mediaTargetIndex, setMediaTargetIndex] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  /*
   * Load image metadata so existing
   * collection cards can show previews.
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

        setAssetById(
          new Map((response.assets ?? []).map((asset) => [asset.id, asset])),
        );
      })
      .catch(() => {
        /*
         * Image preview failure should
         * not stop the editor itself.
         */
      });

    return () => {
      controller.abort();
    };
  }, []);

  function updateItem(index, changes) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  }

  function addItem() {
    if (items.length >= MAX_COLLECTIONS) {
      toast.error(`You can display up to ${MAX_COLLECTIONS} collections.`);

      return;
    }

    setItems((current) => [...current, createCollectionItem()]);
  }

  function removeItem(index) {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function moveItem(index, direction) {
    const destination = index + direction;

    if (destination < 0 || destination >= items.length) {
      return;
    }

    setItems((current) => {
      const next = [...current];

      [next[index], next[destination]] = [next[destination], next[index]];

      return next;
    });
  }

  function handleSelectImage(asset) {
    if (mediaTargetIndex === null) {
      return;
    }

    setAssetById((current) => {
      const next = new Map(current);

      next.set(asset.id, asset);

      return next;
    });

    updateItem(mediaTargetIndex, {
      assetId: asset.id,

      imageAlt: asset.altText || asset.fileName || "",
    });

    setMediaTargetIndex(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Section name is required.");

      return;
    }

    if (!title.trim()) {
      toast.error("Section title is required.");

      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one collection.");

      return;
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (!item.title?.trim()) {
        toast.error(`Collection ${index + 1} needs a title.`);

        return;
      }

      if (!item.assetId) {
        toast.error(`Choose an image for "${item.title}".`);

        return;
      }

      if (!item.buttonUrl?.trim()) {
        toast.error(`"${item.title}" needs a destination URL.`);

        return;
      }
    }

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          eyebrow: eyebrow.trim(),

          title: title.trim(),

          description: description.trim(),

          items: items.map((item) => ({
            title: item.title.trim(),

            description: item.description?.trim() ?? "",

            assetId: item.assetId,

            imageAlt: item.imageAlt?.trim() ?? "",

            imagePosition: item.imagePosition || "center",

            buttonUrl: item.buttonUrl.trim(),
          })),
        },
      });

      toast.success("Collections updated successfully.");

      onSaved?.(updatedSection);

      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update Collections.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close Collections editor"
          disabled={isSaving}
          onClick={onClose}
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
                <CollectionsRoundedIcon />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Homepage section
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-950">
                  Edit Collections
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
                h-10 w-10
                items-center
                justify-center
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

          <div className="flex-1 space-y-7 overflow-y-auto p-6">
            {/* SECTION CONTENT */}
            <section className="rounded-2xl border border-gray-200 p-5">
              <h4 className="font-bold text-gray-950">Section content</h4>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                    value={eyebrow}
                    disabled={isSaving}
                    onChange={(event) => setEyebrow(event.target.value)}
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
                  value={title}
                  disabled={isSaving}
                  onChange={(event) => setTitle(event.target.value)}
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
                  value={description}
                  disabled={isSaving}
                  onChange={(event) => setDescription(event.target.value)}
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
            </section>

            {/* COLLECTION CARDS */}
            <section className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-950">Collection cards</h4>

                  <p className="mt-1 text-xs text-gray-500">
                    {items.length}
                    /6 collections
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={isSaving || items.length >= MAX_COLLECTIONS}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:border-gray-950
                    hover:text-gray-950
                    disabled:opacity-40
                  "
                >
                  <AddRoundedIcon fontSize="small" />
                  Add collection
                </button>
              </div>

              {items.length === 0 ? (
                <button
                  type="button"
                  onClick={addItem}
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
                    text-gray-600
                    transition
                    hover:border-gray-950
                  "
                >
                  <CollectionsRoundedIcon />

                  <span className="mt-3 text-sm font-semibold">
                    Add your first collection
                  </span>
                </button>
              ) : (
                <div className="mt-5 space-y-4">
                  {items.map((item, index) => {
                    const asset = item.assetId
                      ? assetById.get(item.assetId)
                      : null;

                    return (
                      <article
                        key={`${item.assetId ?? "collection"}-${index}`}
                        className="
                            grid
                            gap-5
                            rounded-2xl
                            border
                            border-gray-200
                            bg-gray-50
                            p-4

                            lg:grid-cols-[11rem_minmax(0,1fr)_auto]
                          "
                      >
                        {/* IMAGE */}
                        <div>
                          <div className="relative overflow-hidden rounded-xl bg-gray-200">
                            {asset?.imageUrl ? (
                              <img
                                src={asset.imageUrl}
                                alt={item.imageAlt || asset.fileName}
                                className="
                                    aspect-[4/5]
                                    w-full
                                    object-cover
                                  "
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => setMediaTargetIndex(index)}
                                className="
                                    flex
                                    aspect-[4/5]
                                    w-full
                                    flex-col
                                    items-center
                                    justify-center
                                    text-gray-400
                                  "
                              >
                                <ImageOutlinedIcon />

                                <span className="mt-2 text-xs font-semibold">
                                  Choose image
                                </span>
                              </button>
                            )}
                          </div>

                          {asset && (
                            <button
                              type="button"
                              onClick={() => setMediaTargetIndex(index)}
                              className="
                                  mt-2
                                  inline-flex
                                  w-full
                                  items-center
                                  justify-center
                                  gap-1.5
                                  rounded-xl
                                  border
                                  border-gray-300
                                  bg-white
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-gray-700
                                "
                            >
                              <EditRoundedIcon
                                sx={{
                                  fontSize: 15,
                                }}
                              />
                              Replace image
                            </button>
                          )}
                        </div>

                        {/* FIELDS */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                              Collection {index + 1}
                            </p>
                          </div>

                          <label className="block">
                            <span className="text-xs font-semibold text-gray-700">
                              Title
                            </span>

                            <input
                              value={item.title ?? ""}
                              disabled={isSaving}
                              onChange={(event) =>
                                updateItem(index, {
                                  title: event.target.value,
                                })
                              }
                              placeholder="Everyday Essentials"
                              className="
                                  mt-1
                                  w-full
                                  rounded-xl
                                  border
                                  border-gray-300
                                  bg-white
                                  px-3
                                  py-2.5
                                  text-sm
                                  outline-none
                                  focus:border-gray-950
                                "
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-semibold text-gray-700">
                              Description
                            </span>

                            <textarea
                              rows={3}
                              value={item.description ?? ""}
                              disabled={isSaving}
                              onChange={(event) =>
                                updateItem(index, {
                                  description: event.target.value,
                                })
                              }
                              className="
                                  mt-1
                                  w-full
                                  resize-none
                                  rounded-xl
                                  border
                                  border-gray-300
                                  bg-white
                                  px-3
                                  py-2.5
                                  text-sm
                                  leading-5
                                  outline-none
                                  focus:border-gray-950
                                "
                            />
                          </label>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label>
                              <span className="text-xs font-semibold text-gray-700">
                                Destination
                              </span>

                              <input
                                value={item.buttonUrl ?? ""}
                                disabled={isSaving}
                                onChange={(event) =>
                                  updateItem(index, {
                                    buttonUrl: event.target.value,
                                  })
                                }
                                placeholder="/products"
                                className="
                                    mt-1
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-gray-950
                                  "
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold text-gray-700">
                                Image position
                              </span>

                              <select
                                value={item.imagePosition ?? "center"}
                                disabled={isSaving}
                                onChange={(event) =>
                                  updateItem(index, {
                                    imagePosition: event.target.value,
                                  })
                                }
                                className="
                                    mt-1
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-gray-950
                                  "
                              >
                                {IMAGE_POSITIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <label className="block">
                            <span className="text-xs font-semibold text-gray-700">
                              Image alt text
                            </span>

                            <input
                              value={item.imageAlt ?? ""}
                              disabled={isSaving}
                              onChange={(event) =>
                                updateItem(index, {
                                  imageAlt: event.target.value,
                                })
                              }
                              className="
                                  mt-1
                                  w-full
                                  rounded-xl
                                  border
                                  border-gray-300
                                  bg-white
                                  px-3
                                  py-2.5
                                  text-sm
                                  outline-none
                                  focus:border-gray-950
                                "
                            />
                          </label>
                        </div>

                        {/* ORDER */}
                        <div className="flex gap-1 lg:flex-col">
                          <button
                            type="button"
                            disabled={index === 0 || isSaving}
                            onClick={() => moveItem(index, -1)}
                            title="Move up"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                          >
                            <ArrowUpwardRoundedIcon fontSize="small" />
                          </button>

                          <button
                            type="button"
                            disabled={index === items.length - 1 || isSaving}
                            onClick={() => moveItem(index, 1)}
                            title="Move down"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                          >
                            <ArrowDownwardRoundedIcon fontSize="small" />
                          </button>

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => removeItem(index)}
                            title="Delete collection"
                            className="
                                inline-flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-white
                                text-red-600
                                hover:bg-red-50
                              "
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
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

              {isSaving ? "Saving..." : "Save collections"}
            </button>
          </footer>
        </form>
      </div>

      {mediaTargetIndex !== null && (
        <MediaPickerDialog
          onClose={() => setMediaTargetIndex(null)}
          onSelect={handleSelectImage}
        />
      )}
    </>
  );
}

export default CollectionsSectionEditor;
