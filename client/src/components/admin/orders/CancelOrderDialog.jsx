import { useState } from "react";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

/* =========================================================
   FORM
========================================================= */

function CancelOrderForm({ orderNumber, isSubmitting, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  const normalizedReason = reason.trim();
  const characterCount = reason.length;

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
    <form onSubmit={handleSubmit}>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <DialogTitle sx={{ padding: 0 }}>
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-6
            sm:py-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.13em]
                text-red-500
              "
            >
              Destructive action
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                tracking-[-0.025em]
                text-gray-950

                sm:text-xl
              "
            >
              Cancel order
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close cancel order dialog"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition-colors

              hover:bg-gray-100
              hover:text-gray-950

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </DialogTitle>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <DialogContent sx={{ padding: 0 }}>
        <div
          className="
            px-4
            py-5

            sm:px-6
            sm:py-6
          "
        >
          {/* WARNING */}
          <div
            className="
              flex
              items-start
              gap-3
              rounded-[1rem]
              border
              border-red-200/80
              bg-red-50/70
              p-3.5

              sm:p-4
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-red-600
                shadow-sm
                ring-1
                ring-red-100
              "
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 19 }} />
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-bold
                  text-red-950

                  sm:text-[0.95rem]
                "
              >
                Cancel {orderNumber}?
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-red-700

                  sm:text-sm
                  sm:leading-6
                "
              >
                The customer will be notified and purchased quantities will be
                restored to inventory.
              </p>
            </div>
          </div>

          {/* CANCELLATION REASON */}
          <div className="mt-5">
            <label
              htmlFor="cancellation-reason"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Cancellation reason
            </label>

            <p
              className="
                mt-1
                text-[0.68rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              This reason is required before the order can be cancelled.
            </p>

            <div
              className="
                mt-3
                overflow-hidden
                rounded-[1rem]
                border
                border-gray-200
                bg-gray-50/50
                transition

                focus-within:border-red-400
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-red-500/[0.06]
              "
            >
              <textarea
                id="cancellation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={5}
                maxLength={1000}
                disabled={isSubmitting}
                placeholder="Explain why this order is being cancelled..."
                className="
                  min-h-[8rem]
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

                  sm:min-h-[9rem]
                  sm:px-4
                  sm:py-4
                "
              />

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
                <span className="text-[0.65rem] text-gray-400 sm:text-xs">
                  Required
                </span>

                <span
                  className={[
                    "text-[0.65rem] font-medium sm:text-xs",
                    characterCount >= 900 ? "text-red-600" : "text-gray-400",
                  ].join(" ")}
                >
                  {characterCount} / 1,000
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* =====================================================
          ACTIONS
      ===================================================== */}
      <DialogActions sx={{ padding: 0 }}>
        <div
          className="
            flex
            w-full
            flex-col-reverse
            gap-2.5
            border-t
            border-gray-100
            bg-gray-50/60
            px-4
            py-4

            sm:flex-row
            sm:items-center
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
              w-full
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white
              px-5
              text-sm
              font-bold
              text-gray-700
              transition-all

              hover:border-gray-300
              hover:bg-gray-100
              hover:text-gray-950

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:w-auto
            "
          >
            Keep order
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !normalizedReason}
            className="
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              rounded-full
              bg-red-700
              px-5
              text-sm
              font-bold
              text-white
              transition-colors

              hover:bg-red-800

              disabled:cursor-not-allowed
              disabled:bg-red-200
              disabled:text-red-400

              sm:min-w-[9rem]
              sm:w-auto
            "
          >
            {isSubmitting ? "Cancelling..." : "Cancel order"}
          </button>
        </div>
      </DialogActions>
    </form>
  );
}

/* =========================================================
   DIALOG
========================================================= */

function CancelOrderDialog({
  open,
  orderNumber,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          width: "calc(100% - 24px)",
          margin: "12px",
          borderRadius: "22px",
          overflow: "hidden",
        },

        "@media (min-width: 640px)": {
          "& .MuiDialog-paper": {
            width: "100%",
            margin: "32px",
            borderRadius: "24px",
          },
        },
      }}
    >
      {open && (
        <CancelOrderForm
          orderNumber={orderNumber}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

export default CancelOrderDialog;
