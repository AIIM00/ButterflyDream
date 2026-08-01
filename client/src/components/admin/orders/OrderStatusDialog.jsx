import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

function OrderStatusDialog({
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
      status: selectedStatus,
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
        <DialogTitle>Update order status</DialogTitle>

        <DialogContent dividers>
          <p className="text-sm text-gray-600">
            Current status:{" "}
            <span className="font-bold text-gray-950">
              {formatOrderStatus(currentStatus)}
            </span>
          </p>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-gray-700">
              New status
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
              Status note
            </span>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
              placeholder="Optional internal or customer-facing status note."
              className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </label>

          {selectedStatus === "RETURNED" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Marking this order as returned will restore its product quantities
              to inventory.
            </div>
          )}
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
            {isSubmitting ? "Updating..." : "Update status"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default OrderStatusDialog;
