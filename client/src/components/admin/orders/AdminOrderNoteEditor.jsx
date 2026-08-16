import { useState } from "react";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

/* =========================================================
   NOTE FORM
========================================================= */

function AdminOrderNoteForm({ initialNote, isSubmitting, onSubmit }) {
  const normalizedInitialNote = initialNote ?? "";

  const [adminNote, setAdminNote] = useState(() => normalizedInitialNote);

  const [savedNote, setSavedNote] = useState(() =>
    normalizedInitialNote.trim(),
  );

  const characterCount = adminNote.length;

  const normalizedNote = adminNote.trim();

  const hasChanges = normalizedNote !== savedNote;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasChanges || isSubmitting) {
      return;
    }

    const nextNote = normalizedNote || null;

    await onSubmit(nextNote);

    /*
     * Once onSubmit resolves successfully, use the submitted
     * value as the new local baseline.
     */
    setSavedNote(normalizedNote);
    setAdminNote(normalizedNote);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className="
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <div className="flex items-start gap-3">
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gray-950
              text-white
              shadow-sm
            "
          >
            <LockOutlinedIcon
              sx={{
                fontSize: 18,
              }}
            />
          </span>

          <div className="min-w-0">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.13em]
                text-gray-400
              "
            >
              Private
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                tracking-[-0.025em]
                text-gray-950

                sm:text-xl
              "
            >
              Internal admin note
            </h2>

            <p
              className="
                mt-1.5
                max-w-xl
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
            >
              Add internal information about delivery, communication, or
              follow-up. Customers cannot see this note.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          EDITOR
      ===================================================== */}
      <div
        className="
          px-4
          py-5

          sm:px-5

          lg:px-6
          lg:py-6
        "
      >
        <div
          className="
            overflow-hidden
            rounded-[1rem]
            border
            border-gray-200
            bg-gray-50/50

            transition

            focus-within:border-gray-400
            focus-within:bg-white
            focus-within:ring-4
            focus-within:ring-gray-950/[0.035]
          "
        >
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={6}
            maxLength={2000}
            disabled={isSubmitting}
            placeholder="Add a private note about this order..."
            className="
              min-h-[9rem]
              w-full
              resize-y
              border-0
              bg-transparent
              px-3.5
              py-3.5
              text-sm
              leading-6
              text-gray-900
              outline-none

              placeholder:text-gray-400

              disabled:cursor-not-allowed
              disabled:bg-gray-100/70

              sm:min-h-[10rem]
              sm:px-4
              sm:py-4
            "
          />

          {/* CHARACTER COUNT */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-t
              border-gray-100
              px-3.5
              py-2.5

              sm:px-4
            "
          >
            <p
              className="
                text-[0.65rem]
                text-gray-400

                sm:text-xs
              "
            >
              Internal use only
            </p>

            <span
              className={[
                `
                  text-[0.65rem]
                  font-medium

                  sm:text-xs
                `,
                characterCount >= 1900 ? "text-red-600" : "text-gray-400",
              ].join(" ")}
            >
              {characterCount.toLocaleString()} / 2,000
            </span>
          </div>
        </div>

        {/* ===================================================
            ACTION
        =================================================== */}
        <div
          className="
            mt-4
            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              min-h-5
              text-xs
              text-gray-400
            "
          >
            {hasChanges ? "You have unsaved changes." : "Note is up to date."}
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-950
              px-5
              text-sm
              font-bold
              text-white

              transition-all

              hover:bg-gray-800

              disabled:cursor-not-allowed
              disabled:bg-gray-200
              disabled:text-gray-400

              sm:w-auto
              sm:min-w-[8.5rem]
            "
          >
            <SaveOutlinedIcon
              sx={{
                fontSize: 17,
              }}
            />

            {isSubmitting ? "Saving..." : "Save note"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* =========================================================
   EDITOR
========================================================= */

function AdminOrderNoteEditor({ initialNote, isSubmitting, onSubmit }) {
  return (
    <AdminOrderNoteForm
      key={initialNote ?? "__empty-note__"}
      initialNote={initialNote}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}

export default AdminOrderNoteEditor;
