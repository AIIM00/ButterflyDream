//MUI Materials
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

//MUI Icons
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

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="category-status-title"
    >
      <DialogTitle id="category-status-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <WarningAmberRoundedIcon />
          </span>

          <div>
            <h2 className="text-xl font-bold text-gray-950">{title}</h2>

            <p className="mt-1 text-sm text-gray-500">{category.name}</p>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        {activating ? (
          <p className="leading-7 text-gray-600">
            This category will become available to the public catalog again when
            it contains active products.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="leading-7 text-gray-600">
              The category will no longer appear in the customer storefront.
            </p>

            {category.productCount > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                This category contains <strong>{category.productCount}</strong>{" "}
                {category.productCount === 1 ? "product" : "products"}.
              </div>
            )}

            {requiresProductConfirmation && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                Deactivating this category will hide its active products from
                the public catalog. Confirm again to continue.
              </div>
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions className="px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={[
            "rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50",
            activating
              ? "bg-emerald-700 hover:bg-emerald-600"
              : "bg-red-700 hover:bg-red-600",
          ].join(" ")}
        >
          {isSubmitting
            ? "Updating..."
            : activating
              ? "Activate"
              : requiresProductConfirmation
                ? "Confirm and deactivate"
                : "Deactivate"}
        </button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryStatusDialog;
