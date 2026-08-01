import { useState } from "react";

function AdminOrderNoteEditor({ initialNote, isSubmitting, onSubmit }) {
  const [adminNote, setAdminNote] = useState(initialNote ?? "");

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit(adminNote.trim() || null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-gray-950">Internal admin note</h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        This note is for administrators and is not shown to the customer.
      </p>

      <textarea
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        rows={5}
        maxLength={2000}
        disabled={isSubmitting}
        placeholder="Add private information about delivery, communication, or follow-up."
        className="mt-5 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
      />

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gray-950 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save note"}
        </button>
      </div>
    </form>
  );
}

export default AdminOrderNoteEditor;
