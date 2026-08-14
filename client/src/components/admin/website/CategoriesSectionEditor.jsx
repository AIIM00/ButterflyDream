import { useEffect, useState } from "react";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { toast } from "react-toastify";

import { fetchAdminCategories } from "../../../services/adminCategoryApi.js";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

const MAX_HOME_CATEGORIES = 8;

const DEFAULT_CONTENT = {
  eyebrow: "Explore the collection",

  title: "Find the piece that feels like you.",

  description:
    "Move through our collections and discover accessories designed for everyday expression, meaningful moments, and personal transformation.",

  buttonText: "View all categories",

  buttonUrl: "/products",

  categoryIds: [],
};

function CategoriesSectionEditor({ section, onClose, onSaved }) {
  const content = {
    ...DEFAULT_CONTENT,
    ...(section.content ?? {}),
  };

  const [name, setName] = useState(section.name ?? "Find What Speaks To You");

  const [eyebrow, setEyebrow] = useState(content.eyebrow);

  const [title, setTitle] = useState(content.title);

  const [description, setDescription] = useState(content.description);

  const [buttonText, setButtonText] = useState(content.buttonText);

  const [buttonUrl, setButtonUrl] = useState(content.buttonUrl);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    Array.isArray(content.categoryIds) ? content.categoryIds : [],
  );

  const [categories, setCategories] = useState([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [categoryError, setCategoryError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminCategories({
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        setCategories(
          Array.isArray(response.categories) ? response.categories : [],
        );

        setCategoryError(null);
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setCategoryError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingCategories(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const selectedCategories = selectedCategoryIds
    .map((categoryId) => categoryById.get(categoryId))
    .filter(Boolean);

  function toggleCategory(category) {
    if (!category.isActive) {
      toast.info(
        "Inactive categories cannot be shown on the customer homepage.",
      );

      return;
    }

    const isSelected = selectedCategoryIds.includes(category.id);

    if (isSelected) {
      setSelectedCategoryIds((current) =>
        current.filter((categoryId) => categoryId !== category.id),
      );

      return;
    }

    if (selectedCategoryIds.length >= MAX_HOME_CATEGORIES) {
      toast.error(
        `You can display up to ${MAX_HOME_CATEGORIES} categories on the homepage.`,
      );

      return;
    }

    setSelectedCategoryIds((current) => [...current, category.id]);
  }

  function moveCategory(index, direction) {
    const destination = index + direction;

    if (destination < 0 || destination >= selectedCategoryIds.length) {
      return;
    }

    setSelectedCategoryIds((current) => {
      const next = [...current];

      [next[index], next[destination]] = [next[destination], next[index]];

      return next;
    });
  }

  function useAutomaticOrder() {
    setSelectedCategoryIds([]);
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

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          eyebrow: eyebrow.trim(),

          title: title.trim(),

          description: description.trim(),

          buttonText: buttonText.trim(),

          buttonUrl: buttonUrl.trim(),

          categoryIds: selectedCategoryIds,
        },
      });

      toast.success("Categories section updated successfully.");

      onSaved?.(updatedSection);

      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update the Categories section.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        aria-label="Close Categories editor"
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
              <CategoryRoundedIcon />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Homepage section
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-950">
                Edit Categories
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

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          {/* Content */}
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
                  "
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Eyebrow
                </span>

                <input
                  value={eyebrow}
                  onChange={(event) => setEyebrow(event.target.value)}
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border border-gray-300
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                  "
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-800">Title</span>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
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
                onChange={(event) => setDescription(event.target.value)}
                className="
                  mt-2
                  w-full
                  resize-none
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
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
                  value={buttonText}
                  onChange={(event) => setButtonText(event.target.value)}
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border border-gray-300
                    px-4 py-3
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
                  value={buttonUrl}
                  onChange={(event) => setButtonUrl(event.target.value)}
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border border-gray-300
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                  "
                />
              </label>
            </div>
          </section>

          {/* Selection */}
          <section className="rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-bold text-gray-950">Homepage categories</h4>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Choose up to 8. Leave the selection empty to automatically use
                  the first 8 active categories in catalog order.
                </p>
              </div>

              {selectedCategoryIds.length > 0 && (
                <button
                  type="button"
                  onClick={useAutomaticOrder}
                  className="
                    w-fit
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-gray-700
                    transition
                    hover:border-gray-950
                  "
                >
                  Use automatic order
                </button>
              )}
            </div>

            {selectedCategoryIds.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Display order
                </p>

                <div className="space-y-2">
                  {selectedCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          p-3
                        "
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-950">
                          {category.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          Position {index + 1}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveCategory(index, -1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                      >
                        <ArrowUpwardRoundedIcon fontSize="small" />
                      </button>

                      <button
                        type="button"
                        disabled={index === selectedCategories.length - 1}
                        onClick={() => moveCategory(index, 1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 disabled:opacity-30"
                      >
                        <ArrowDownwardRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-gray-200 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Available categories
                </p>

                <span className="text-xs text-gray-500">
                  {selectedCategoryIds.length}
                  /8 selected
                </span>
              </div>

              {isLoadingCategories ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : categoryError ? (
                <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {categoryError.message || "Unable to load categories."}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(
                      category.id,
                    );

                    return (
                      <button
                        key={category.id}
                        type="button"
                        disabled={!category.isActive}
                        onClick={() => toggleCategory(category)}
                        className={[
                          "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                          isSelected
                            ? "border-gray-950 bg-gray-950 text-white"
                            : category.isActive
                              ? "border-gray-200 bg-white text-gray-950 hover:border-gray-400"
                              : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60",
                        ].join(" ")}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {category.imageUrl && (
                            <img
                              src={category.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {category.name}
                          </p>

                          <p
                            className={[
                              "mt-1 text-xs",
                              isSelected ? "text-gray-300" : "text-gray-500",
                            ].join(" ")}
                          >
                            {category.isActive
                              ? `${category.productCount ?? 0} products`
                              : "Inactive"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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

            {isSaving ? "Saving..." : "Save categories"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default CategoriesSectionEditor;
