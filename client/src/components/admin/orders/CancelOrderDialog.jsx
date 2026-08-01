import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function CancelOrderDialog({
  open,
  orderNumber,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");

  const normalizedReason = reason.trim();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!normalizedReason) {
      return;
    }

    await onSubmit({
      reason: normalizedReason,
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
        <DialogTitle>Cancel order</DialogTitle>

        <DialogContent dividers>
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <WarningAmberRoundedIcon className="shrink-0 text-red-700" />

            <div>
              <p className="font-bold text-red-900">Cancel {orderNumber}?</p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                The order status will become cancelled, the customer will be
                notified, and purchased quantities will be restored to
                inventory.
              </p>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-gray-700">
              Cancellation reason
            </span>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              maxLength={1000}
              disabled={isSubmitting}
              placeholder="Explain why this order is being cancelled."
              className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
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
            Keep order
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !normalizedReason}
            className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Cancelling..." : "Cancel order"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CancelOrderDialog;
