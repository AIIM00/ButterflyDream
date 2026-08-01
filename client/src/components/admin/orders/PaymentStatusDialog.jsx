import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

function PaymentStatusDialog({
  open,
  currentStatus,
  allowedStatuses,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [selectedStatus, setSelectedStatus] = useState(
    allowedStatuses[0] ?? "",
  );

  const [note, setNote] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedStatus) {
      return;
    }

    await onSubmit({
      paymentStatus: selectedStatus,

      note: note.trim() || null,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Update payment status</DialogTitle>

        <DialogContent dividers>
          <p className="text-sm text-gray-600">
            Current payment status:{" "}
            <span className="font-bold text-gray-950">
              {formatOrderStatus(currentStatus)}
            </span>
          </p>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-gray-700">
              New payment status
            </span>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            >
              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatOrderStatus(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-gray-700">
              Payment note
            </span>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
              placeholder="Example: Cash collected by courier."
              className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </label>
        </DialogContent>

        <DialogActions className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selectedStatus}
            className="rounded-xl bg-gray-950 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update payment"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PaymentStatusDialog;
