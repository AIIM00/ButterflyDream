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
      PaperProps={{
        sx: {
          borderRadius: "1.5rem",
          overflow: "hidden",
          backgroundColor: "rgb(var(--theme-surface))",
          color: "rgb(var(--theme-text))",
          border: "1px solid rgb(var(--theme-border))",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.16)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.34)",
            backdropFilter: "blur(3px)",
          },
        },
      }}
    >
      {/* ==================================================
          TITLE
      ================================================== */}

      <DialogTitle
        sx={{
          padding: 0,
        }}
      >
        <div
          className="
            border-b
            border-brand-border

            px-5
            py-4

            sm:px-6
            sm:py-5
          "
        >
          <p
            className="
              text-[0.58rem]
              font-bold
              uppercase

              tracking-[0.16em]

              text-brand-error
            "
          >
            Notification cleanup
          </p>

          <h2
            className="
              mt-1

              font-display

              text-[1.35rem]
              font-medium

              tracking-[-0.03em]

              text-brand-text
            "
          >
            Clear read notifications
          </h2>
        </div>
      </DialogTitle>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <DialogContent
        sx={{
          padding: 0,
        }}
      >
        <div
          className="
            flex
            items-start

            gap-3.5

            px-5
            py-5

            sm:gap-4
            sm:px-6
            sm:py-6
          "
        >
          {/* ICON */}

          <span
            className="
              inline-flex
              h-11
              w-11
              shrink-0

              items-center
              justify-center

              rounded-full

              bg-brand-error/10

              text-brand-error
            "
          >
            <DeleteSweepOutlinedIcon
              sx={{
                fontSize: 21,
              }}
            />
          </span>

          {/* MESSAGE */}

          <div className="min-w-0">
            <h3
              className="
                font-display

                text-[1.05rem]
                font-medium

                tracking-[-0.02em]

                text-brand-text
              "
            >
              Delete all read notifications?
            </h3>

            <p
              className="
                mt-2

                text-sm
                leading-6

                text-brand-text-muted
              "
            >
              Read notifications will be permanently removed. Unread
              notifications will remain available.
            </p>

            <div
              className="
                mt-4

                rounded-[1rem]

                border
                border-brand-error/15

                bg-brand-error/5

                px-3.5
                py-3
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  leading-5

                  text-brand-error
                "
              >
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <DialogActions
        sx={{
          padding: 0,
        }}
      >
        <div
          className="
            flex
            w-full

            flex-col-reverse

            gap-2.5

            border-t
            border-brand-border

            bg-brand-surface-soft

            px-5
            py-4

            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              inline-flex
              min-h-11

              items-center
              justify-center

              rounded-full

              border
              border-brand-border

              bg-brand-surface

              px-5

              text-sm
              font-semibold

              text-brand-text

              transition-all
              duration-200

              hover:border-brand-text/20
              hover:bg-brand-surface-soft

              active:scale-[0.98]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-accent-fill/35

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="
              inline-flex
              min-h-11

              items-center
              justify-center

              rounded-full

              bg-brand-error

              px-5

              text-sm
              font-semibold

              text-brand-surface

              transition-all
              duration-200

              hover:bg-brand-error/90

              active:scale-[0.98]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-error/35
              focus-visible:ring-offset-2

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Clearing..." : "Clear read"}
          </button>
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default ClearReadNotificationsDialog;
