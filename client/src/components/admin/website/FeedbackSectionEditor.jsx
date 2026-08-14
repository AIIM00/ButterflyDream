import { useState } from "react";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";

import { toast } from "react-toastify";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

const DEFAULT_CONTENT = {
  eyebrow: "Customer stories",

  title: "What our",

  titleAccent: "customers say.",

  reviewsPerPage: 4,

  sort: "newest",

  showRatingSummary: true,
};

function FeedbackSectionEditor({ section, onClose, onSaved }) {
  const content = {
    ...DEFAULT_CONTENT,
    ...(section.content ?? {}),
  };

  const [name, setName] = useState(section.name ?? "Customer Feedback");

  const [eyebrow, setEyebrow] = useState(content.eyebrow);

  const [title, setTitle] = useState(content.title);

  const [titleAccent, setTitleAccent] = useState(content.titleAccent);

  const [reviewsPerPage, setReviewsPerPage] = useState(
    Number(content.reviewsPerPage) === 8 ? 8 : 4,
  );

  const [sort, setSort] = useState(
    content.sort === "highest_rating" ? "highest_rating" : "newest",
  );

  const [showRatingSummary, setShowRatingSummary] = useState(
    content.showRatingSummary !== false,
  );

  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Section name is required.");

      return;
    }

    if (!title.trim()) {
      toast.error("Feedback title is required.");

      return;
    }

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          eyebrow: eyebrow.trim(),

          title: title.trim(),

          titleAccent: titleAccent.trim(),

          reviewsPerPage,

          sort,

          showRatingSummary,
        },
      });

      toast.success("Feedback section updated successfully.");

      onSaved?.(updatedSection);

      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update the Feedback section.");
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
        aria-label="Close Feedback editor"
        className="absolute inset-0 bg-gray-950/60"
      />

      <form
        onSubmit={handleSubmit}
        className="
          relative z-10
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
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
              <FeedbackRoundedIcon />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Homepage section
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-950">
                Edit Feedback
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
              transition
              hover:bg-gray-100
              hover:text-gray-950
              disabled:opacity-50
            "
          >
            <CloseRoundedIcon />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-gray-800">
              Admin section name
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

          <label className="block">
            <span className="text-sm font-semibold text-gray-800">Eyebrow</span>

            <input
              type="text"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-gray-800">Title</span>

              <input
                type="text"
                value={title}
                disabled={isSaving}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What our"
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
                Accent title
              </span>

              <input
                type="text"
                value={titleAccent}
                disabled={isSaving}
                onChange={(event) => setTitleAccent(event.target.value)}
                placeholder="customers say."
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

              <p className="mt-1 text-xs text-gray-500">
                Displayed in italic below the first line.
              </p>
            </label>
          </div>

          <div className="grid gap-5 border-t border-gray-200 pt-6 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-gray-800">
                Reviews per page
              </span>

              <select
                value={reviewsPerPage}
                disabled={isSaving}
                onChange={(event) =>
                  setReviewsPerPage(Number(event.target.value))
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
                <option value={4}>4 reviews</option>

                <option value={8}>8 reviews</option>
              </select>
            </label>

            <label>
              <span className="text-sm font-semibold text-gray-800">
                Review order
              </span>

              <select
                value={sort}
                disabled={isSaving}
                onChange={(event) => setSort(event.target.value)}
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
                <option value="newest">Newest first</option>

                <option value="highest_rating">Highest rated first</option>
              </select>
            </label>
          </div>

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              gap-5
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              p-4
            "
          >
            <div>
              <p className="text-sm font-bold text-gray-950">Rating summary</p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Show the average star rating and total number of reviews beside
                the section heading.
              </p>
            </div>

            <input
              type="checkbox"
              checked={showRatingSummary}
              disabled={isSaving}
              onChange={(event) => setShowRatingSummary(event.target.checked)}
              className="
                h-5
                w-5
                shrink-0
                accent-gray-950
              "
            />
          </label>

          <div className="rounded-2xl border border-gray-200 bg-brand-ivory p-5">
            <p
              className="
                text-[0.6rem]
                font-bold
                uppercase
                tracking-[0.24em]
                text-brand-bronze
              "
            >
              {eyebrow || "Customer stories"}
            </p>

            <h4
              className="
                mt-3
                font-display
                text-3xl
                font-medium
                leading-none
                tracking-[-0.04em]
                text-brand-espresso
              "
            >
              {title || "What our"}

              {titleAccent && (
                <span className="block italic">{titleAccent}</span>
              )}
            </h4>
          </div>
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

            {isSaving ? "Saving..." : "Save feedback"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default FeedbackSectionEditor;
