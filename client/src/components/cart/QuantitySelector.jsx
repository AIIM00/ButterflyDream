import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

function QuantitySelector({
  quantity,
  minimum = 1,
  maximum = 99,
  disabled = false,
  onChange,
}) {
  const canDecrease = !disabled && quantity > minimum;
  const canIncrease = !disabled && quantity < maximum;

  return (
    <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
        className="flex h-11 w-11 items-center justify-center rounded-l-xl text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <RemoveRoundedIcon fontSize="small" />
      </button>

      <span className="min-w-12 px-2 text-center font-bold text-gray-950">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={!canIncrease}
        aria-label="Increase quantity"
        className="flex h-11 w-11 items-center justify-center rounded-r-xl text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <AddRoundedIcon fontSize="small" />
      </button>
    </div>
  );
}

export default QuantitySelector;
