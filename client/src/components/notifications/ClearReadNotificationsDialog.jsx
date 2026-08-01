import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";

function ClearReadNotificationsDialog({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Clear read notifications</DialogTitle>

      <DialogContent dividers>
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <DeleteSweepOutlinedIcon />
          </span>

          <div>
            <h2 className="font-bold text-gray-950">
              Delete all read notifications?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Read notifications will be permanently removed. Unread
              notifications will remain available.
            </p>
          </div>
        </div>
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
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Clearing..." : "Clear read"}
        </button>
      </DialogActions>
    </Dialog>
  );
}

export default ClearReadNotificationsDialog;
