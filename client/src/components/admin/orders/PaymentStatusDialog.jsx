import { useState } from "react";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import { formatOrderStatus } from "../../../utils/adminOrderWorkflow.js";

/* =========================================================
   FORM
========================================================= */

function PaymentStatusForm({
  currentStatus,
  allowedStatuses,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [selectedStatus, setSelectedStatus] = useState(
    () => allowedStatuses[0] ?? "",
  );

  const [note, setNote] = useState("");

  const characterCount = note.length;

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
                text-gray-400
              "
            >
              Payment
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
              Update payment status
            </h2>

            <p
              className="
                mt-1.5
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              Record the latest payment state for this order.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close payment status dialog"
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
          {/* CURRENT PAYMENT STATUS */}
          <div
            className="
              flex
              items-center
              gap-2.5
              rounded-[1rem]
              border
              border-gray-200
              bg-gray-50/70
              px-3.5
              py-3
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
                text-gray-500
                shadow-sm
                ring-1
                ring-gray-200
              "
            >
              <PaymentsOutlinedIcon sx={{ fontSize: 18 }} />
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-[0.6rem]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-gray-400
                "
              >
                Current payment status
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-sm
                  font-bold
                  text-gray-950
                "
              >
                {formatOrderStatus(currentStatus)}
              </p>
            </div>
          </div>

          {/* =================================================
              NEW PAYMENT STATUS
          ================================================= */}
          <div className="mt-5">
            <label
              htmlFor="payment-status"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              New payment status
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
              Select one of the valid payment transitions for this order.
            </p>

            <div className="relative mt-3">
              <select
                id="payment-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={isSubmitting}
                className="
                  min-h-12
                  w-full
                  appearance-none
                  rounded-[0.95rem]
                  border
                  border-gray-200
                  bg-white
                  px-4
                  pr-11
                  text-sm
                  font-semibold
                  text-gray-900
                  outline-none
                  transition

                  focus:border-gray-400
                  focus:ring-4
                  focus:ring-gray-950/[0.035]

                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                  disabled:text-gray-500
                "
              >
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatOrderStatus(status)}
                  </option>
                ))}
              </select>

              <KeyboardArrowDownRoundedIcon
                sx={{ fontSize: 20 }}
                className="
                  pointer-events-none
                  absolute
                  right-3.5
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />
            </div>
          </div>

          {/* =================================================
              PAYMENT NOTE
          ================================================= */}
          <div className="mt-5">
            <label
              htmlFor="payment-note"
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Payment note
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
              Add optional details about how the payment was handled.
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

                focus-within:border-gray-400
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-gray-950/[0.035]
              "
            >
              <textarea
                id="payment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                maxLength={2000}
                disabled={isSubmitting}
                placeholder="Example: Cash collected by courier."
                className="
                  min-h-[7.5rem]
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

                  sm:min-h-[8.5rem]
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
                  Optional
                </span>

                <span
                  className={[
                    "text-[0.65rem] font-medium sm:text-xs",
                    characterCount >= 1900 ? "text-red-600" : "text-gray-400",
                  ].join(" ")}
                >
                  {characterCount.toLocaleString()} / 2,000
                </span>
              </div>
            </div>
          </div>

          {/* PAID INFORMATION */}
          {selectedStatus === "PAID" && (
            <div
              className="
                mt-5
                flex
                items-start
                gap-3
                rounded-[1rem]
                border
                border-emerald-200/80
                bg-emerald-50/70
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
                  text-emerald-600
                  shadow-sm
                  ring-1
                  ring-emerald-100
                "
              >
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              </span>

              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Payment will be marked as received
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-emerald-700

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Use this status only after payment for the order has been
                  successfully collected.
                </p>
              </div>
            </div>
          )}

          {/* REFUNDED INFORMATION */}
          {selectedStatus === "REFUNDED" && (
            <div
              className="
                mt-5
                flex
                items-start
                gap-3
                rounded-[1rem]
                border
                border-gray-200
                bg-gray-50
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
                  text-gray-600
                  shadow-sm
                  ring-1
                  ring-gray-200
                "
              >
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              </span>

              <div>
                <p className="text-sm font-bold text-gray-900">
                  Payment will be marked as refunded
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-gray-500

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Make sure any required refund has been completed before
                  recording this status.
                </p>
              </div>
            </div>
          )}
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
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selectedStatus}
            className="
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              rounded-full
              bg-gray-950
              px-5
              text-sm
              font-bold
              text-white
              transition-colors

              hover:bg-gray-800

              disabled:cursor-not-allowed
              disabled:bg-gray-200
              disabled:text-gray-400

              sm:min-w-[10rem]
              sm:w-auto
            "
          >
            {isSubmitting ? "Updating..." : "Update payment"}
          </button>
        </div>
      </DialogActions>
    </form>
  );
}

/* =========================================================
   DIALOG
========================================================= */

function PaymentStatusDialog({
  open,
  currentStatus,
  allowedStatuses = [],
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
        <PaymentStatusForm
          currentStatus={currentStatus}
          allowedStatuses={allowedStatuses}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

export default PaymentStatusDialog;
