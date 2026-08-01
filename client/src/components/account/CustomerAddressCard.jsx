import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

function CustomerAddressCard({
  address,
  mutationKey,
  onEdit,
  onSetDefault,
  onDelete,
}) {
  const isSettingDefault = mutationKey === `default:${address.id}`;

  const isDeleting = mutationKey === `delete:${address.id}`;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
            <HomeOutlinedIcon />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-gray-950">{address.label}</h3>

              {address.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-950 px-2.5 py-1 text-xs font-bold text-white">
                  <StarRoundedIcon sx={{ fontSize: 14 }} />
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
              <p className="mt-2 text-sm text-gray-500">
                Notes: {address.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => onEdit(address)}
          disabled={Boolean(mutationKey)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
        >
          <EditOutlinedIcon fontSize="small" />
          Edit
        </button>

        {!address.isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(address)}
            disabled={Boolean(mutationKey)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-gray-950 disabled:opacity-50"
          >
            <StarRoundedIcon fontSize="small" />

            {isSettingDefault ? "Updating..." : "Set default"}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(address)}
          disabled={Boolean(mutationKey)}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <DeleteOutlineRoundedIcon fontSize="small" />

          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default CustomerAddressCard;
