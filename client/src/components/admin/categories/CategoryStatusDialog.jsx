// MUI Materials
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

// MUI Icons
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function CategoryStatusDialog({
  open,
  category,
  requiresProductConfirmation,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  if (!category) {
    return null;
  }

  const activating = !category.isActive;

  const title = activating ? "Activate category?" : "Deactivate category?";

  const actionLabel = isSubmitting
    ? "Updating..."
    : activating
      ? "Activate category"
      : requiresProductConfirmation
        ? "Confirm and deactivate"
        : "Deactivate category";

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="category-status-title"
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
      {/* =====================================================
          HEADER
      ===================================================== */}
      <DialogTitle
        id="category-status-title"
        sx={{
          padding: 0,
        }}
      >
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

            sm:px-5
            sm:py-5
          "
        >
          <div
            className="
              flex
              min-w-0
              items-start
              gap-3
            "
          >
            <span
              className={[
                `
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center

                  rounded-full

                  ring-1

                  sm:h-11
                  sm:w-11
                `,
                activating
                  ? `
                    bg-emerald-50
                    text-emerald-600
                    ring-emerald-100
                  `
                  : `
                    bg-red-50
                    text-red-600
                    ring-red-100
                  `,
              ].join(" ")}
            >
              {activating ? (
                <CheckCircleOutlineRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              ) : (
                <WarningAmberRoundedIcon
                  sx={{
                    fontSize: 21,
                  }}
                />
              )}
            </span>

            <div className="min-w-0">
              <p
                className={[
                  `
                    text-[0.6rem]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                  `,
                  activating ? "text-emerald-600" : "text-red-500",
                ].join(" ")}
              >
                {activating ? "Storefront visibility" : "Visibility warning"}
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
                {title}
              </h2>

              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  font-medium
                  text-gray-500

                  sm:text-sm
                "
              >
                {category.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close category status dialog"
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
            <CloseRoundedIcon
              sx={{
                fontSize: 20,
              }}
            />
          </button>
        </div>
      </DialogTitle>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <DialogContent
        sx={{
          padding: 0,
        }}
      >
        <div
          className="
            px-4
            py-5

            sm:px-5
            sm:py-6
          "
        >
          {activating ? (
            /* =================================================
               ACTIVATE
            ================================================= */
            <div
              className="
                rounded-[1rem]

                border
                border-emerald-200

                bg-emerald-50/60

                p-4
              "
            >
              <p
                className="
                  text-sm
                  font-bold
                  text-emerald-900
                "
              >
                Make this category visible again?
              </p>

              <p
                className="
                  mt-1.5
                  text-xs
                  leading-5
                  text-emerald-700

                  sm:text-sm
                  sm:leading-6
                "
              >
                This category can appear in the public catalog again when it
                contains active products.
              </p>
            </div>
          ) : (
            /* =================================================
               DEACTIVATE
            ================================================= */
            <div className="space-y-4">
              <div
                className="
                  rounded-[1rem]

                  border
                  border-gray-200

                  bg-gray-50/70

                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Hide this category from the storefront?
                </p>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-gray-500

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Customers will no longer see this category in the public
                  storefront while it is inactive.
                </p>
              </div>

              {/* PRODUCT COUNT */}
              {category.productCount > 0 && (
                <div
                  className="
                    flex
                    items-start
                    gap-3

                    rounded-[1rem]

                    border
                    border-amber-200

                    bg-amber-50/70

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
                      text-amber-600

                      shadow-sm
                      ring-1
                      ring-amber-100
                    "
                  >
                    <Inventory2OutlinedIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  </span>

                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-amber-900
                      "
                    >
                      Products in this category
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-amber-700

                        sm:text-sm
                        sm:leading-6
                      "
                    >
                      This category currently contains{" "}
                      <strong>{category.productCount}</strong>{" "}
                      {category.productCount === 1 ? "product" : "products"}.
                    </p>
                  </div>
                </div>
              )}

              {/* EXTRA CONFIRMATION */}
              {requiresProductConfirmation && (
                <div
                  className="
                    flex
                    items-start
                    gap-3

                    rounded-[1rem]

                    border
                    border-red-200

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
                    <WarningAmberRoundedIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  </span>

                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-red-900
                      "
                    >
                      Active products will be hidden
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
                      Deactivating this category will also hide its active
                      products from the public catalog. Confirm again if you
                      want to continue.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      {/* =====================================================
          ACTIONS
      ===================================================== */}
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
            border-gray-100

            bg-gray-50/60

            px-4
            py-4

            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:px-5
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
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={[
              `
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center

                rounded-full

                px-5

                text-sm
                font-bold
                text-white

                transition-colors

                disabled:cursor-not-allowed
                disabled:bg-gray-200
                disabled:text-gray-400

                sm:min-w-[10rem]
                sm:w-auto
              `,
              activating
                ? `
                  bg-emerald-700
                  hover:bg-emerald-800
                `
                : `
                  bg-red-700
                  hover:bg-red-800
                `,
            ].join(" ")}
          >
            {actionLabel}
          </button>
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryStatusDialog;
