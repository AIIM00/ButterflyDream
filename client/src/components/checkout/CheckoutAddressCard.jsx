import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

function CheckoutAddressCard({
  address,
  selected,
  disabled = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      disabled={disabled}
      className={[
        "relative w-full rounded-2xl border p-5 text-left transition",
        selected
          ? "border-gray-950 bg-gray-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-400",
        disabled ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
    >
      {selected && (
        <CheckCircleRoundedIcon
          className="absolute right-4 top-4 text-gray-950"
          fontSize="small"
        />
      )}

      <div className="flex items-start gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
          <HomeOutlinedIcon fontSize="small" />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-950">{address.label}</h3>

            {address.isDefault && (
              <span className="rounded-full bg-gray-950 px-2.5 py-1 text-xs font-bold text-white">
                Default
              </span>
            )}
          </div>

          <p className="mt-3 font-semibold text-gray-800">
            {address.recipientName}
          </p>

          <p className="mt-1 text-sm text-gray-600">{address.phone}</p>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {address.street}
            {address.building ? `, ${address.building}` : ""}
            {address.floor ? `, Floor ${address.floor}` : ""}
            <br />
            {address.city}, {address.governorate}
          </p>

          {address.landmark && (
            <p className="mt-2 text-sm text-gray-500">
              Landmark: {address.landmark}
            </p>
          )}

          {address.notes && (
            <p className="mt-2 text-sm text-gray-500">Notes: {address.notes}</p>
          )}
        </div>
      </div>
    </button>
  );
}

export default CheckoutAddressCard;
