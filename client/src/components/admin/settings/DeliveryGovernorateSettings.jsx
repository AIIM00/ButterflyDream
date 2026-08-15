import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// MUI Icons
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

// React Toastify
import { toast } from "react-toastify";

// Services
import {
  fetchAdminDeliveryGovernorates,
  updateAdminDeliveryGovernorate,
} from "../../../services/adminDeliveryGovernorateApi.js";

// Utils
import getApiErrorMessage from "../../../utils/getApiErrorMessage.js";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function isValidDeliveryFee(value) {
  const normalizedValue = String(value ?? "").trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    return false;
  }

  const numericValue = Number(normalizedValue);

  return (
    Number.isFinite(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 1000000
  );
}

function createDrafts(governorates) {
  return Object.fromEntries(
    governorates.map((governorate) => [
      governorate.id,
      {
        deliveryFee: governorate.deliveryFee ?? "0.00",
        isActive: Boolean(governorate.isActive),
      },
    ]),
  );
}

function DeliveryGovernorateSettings({ currency = "USD" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [governorates, setGovernorates] = useState([]);

  const [drafts, setDrafts] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [savingId, setSavingId] = useState(null);

  const [reloadToken, setReloadToken] = useState(0);

  /* =======================================================
     LOAD GOVERNORATES
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadGovernorates() {
      setIsLoading(true);

      try {
        const response = await fetchAdminDeliveryGovernorates({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const nextGovernorates = Array.isArray(response.governorates)
          ? response.governorates
          : [];

        setGovernorates(nextGovernorates);

        setDrafts(createDrafts(nextGovernorates));

        setLoadError(null);
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          navigate("/admin/login", {
            replace: true,

            state: {
              from: `${location.pathname}${location.search}`,
            },
          });

          return;
        }

        setLoadError(error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadGovernorates();

    return () => {
      controller.abort();
    };
  }, [location.pathname, location.search, navigate, reloadToken]);

  /* =======================================================
     UPDATE LOCAL DRAFT
  ======================================================= */

  function updateDraft(governorateId, field, value) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,

      [governorateId]: {
        ...currentDrafts[governorateId],

        [field]: value,
      },
    }));
  }

  /* =======================================================
     CHECK WHETHER ROW CHANGED
  ======================================================= */

  function rowHasChanges(governorate) {
    const draft = drafts[governorate.id];

    if (!draft) {
      return false;
    }

    const originalFee = Number(governorate.deliveryFee ?? 0).toFixed(2);

    const draftFee = isValidDeliveryFee(draft.deliveryFee)
      ? Number(draft.deliveryFee).toFixed(2)
      : String(draft.deliveryFee);

    return (
      originalFee !== draftFee ||
      Boolean(governorate.isActive) !== Boolean(draft.isActive)
    );
  }

  /* =======================================================
     SAVE GOVERNORATE
  ======================================================= */

  async function handleSave(governorate) {
    if (savingId) {
      return;
    }

    const draft = drafts[governorate.id];

    if (!draft) {
      return;
    }

    if (!isValidDeliveryFee(draft.deliveryFee)) {
      toast.error(
        "Delivery fee must be a valid amount with no more than two decimal places.",
      );

      return;
    }

    const formattedFee = Number(draft.deliveryFee).toFixed(2);

    setSavingId(governorate.id);

    try {
      const response = await updateAdminDeliveryGovernorate(governorate.id, {
        deliveryFee: formattedFee,
        isActive: Boolean(draft.isActive),
      });

      const updatedGovernorate = response.governorate;

      setGovernorates((currentGovernorates) =>
        currentGovernorates.map((currentGovernorate) =>
          currentGovernorate.id === governorate.id
            ? updatedGovernorate
            : currentGovernorate,
        ),
      );

      setDrafts((currentDrafts) => ({
        ...currentDrafts,

        [governorate.id]: {
          deliveryFee: updatedGovernorate.deliveryFee,
          isActive: Boolean(updatedGovernorate.isActive),
        },
      }));

      toast.success(
        response.message ??
          `${updatedGovernorate.name} delivery settings updated.`,
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update the delivery fee."),
      );
    } finally {
      setSavingId(null);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />

          <div className="flex-1">
            <div className="h-6 w-52 animate-pulse rounded bg-gray-100" />

            <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (loadError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ErrorOutlineRoundedIcon />
          </span>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-950">
              Delivery fees could not be loaded
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {getApiErrorMessage(
                loadError,
                "Unable to load governorate delivery fees.",
              )}
            </p>

            <button
              type="button"
              onClick={() => setReloadToken((currentValue) => currentValue + 1)}
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gray-950
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-gray-800
              "
            >
              <RefreshRoundedIcon fontSize="small" />
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     DELIVERY GOVERNORATES
  ========================================================= */

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <span
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-blue-700
            "
          >
            <LocalShippingOutlinedIcon />
          </span>

          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Delivery fees by governorate
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Set the delivery price for each Lebanese governorate and choose
              where Butterfly Dream currently delivers.
            </p>
          </div>
        </div>
      </div>

      {/* GOVERNORATES */}

      <div
        className="
          grid
          gap-4
          p-5

          md:grid-cols-2
          md:p-6
        "
      >
        {governorates.map((governorate) => {
          const draft = drafts[governorate.id] ?? {
            deliveryFee: governorate.deliveryFee ?? "0.00",
            isActive: Boolean(governorate.isActive),
          };

          const hasChanges = rowHasChanges(governorate);

          const isSaving = savingId === governorate.id;

          return (
            <article
              key={governorate.id}
              className={[
                `
                  rounded-xl
                  border
                  p-5
                  transition
                `,

                draft.isActive
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50/70",
              ].join(" ")}
            >
              {/* ROW HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-950">
                    {governorate.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={[
                        "h-2 w-2 rounded-full",

                        draft.isActive ? "bg-green-500" : "bg-gray-300",
                      ].join(" ")}
                    />

                    <p
                      className={[
                        "text-xs font-medium",

                        draft.isActive ? "text-green-700" : "text-gray-500",
                      ].join(" ")}
                    >
                      {draft.isActive
                        ? "Delivery available"
                        : "Delivery unavailable"}
                    </p>
                  </div>
                </div>

                {/* ACTIVE SWITCH */}

                <button
                  type="button"
                  role="switch"
                  aria-label={`${
                    draft.isActive ? "Disable" : "Enable"
                  } delivery to ${governorate.name}`}
                  aria-checked={draft.isActive}
                  disabled={Boolean(savingId)}
                  onClick={() =>
                    updateDraft(governorate.id, "isActive", !draft.isActive)
                  }
                  className={[
                    `
                      relative
                      inline-flex
                      h-7
                      w-12
                      shrink-0
                      items-center
                      rounded-full
                      transition

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    `,

                    draft.isActive ? "bg-green-600" : "bg-gray-300",
                  ].join(" ")}
                >
                  <span
                    className={[
                      `
                        inline-block
                        h-5
                        w-5
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                      `,

                      draft.isActive ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* FEE */}

              <label className="mt-5 block">
                <span className="text-xs font-semibold text-gray-700">
                  Delivery fee
                </span>

                <div
                  className="
                    mt-2
                    flex
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    transition
                    focus-within:border-gray-950
                    focus-within:ring-1
                    focus-within:ring-gray-950
                  "
                >
                  <span
                    className="
                      flex
                      shrink-0
                      items-center
                      border-r
                      border-gray-300
                      bg-gray-50
                      px-3
                      text-xs
                      font-bold
                      text-gray-600
                    "
                  >
                    {currency || "USD"}
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={draft.deliveryFee}
                    disabled={Boolean(savingId)}
                    onChange={(event) =>
                      updateDraft(
                        governorate.id,
                        "deliveryFee",
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="
                      min-w-0
                      flex-1
                      bg-white
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      text-gray-950
                      outline-none

                      disabled:cursor-not-allowed
                      disabled:bg-gray-100
                    "
                  />
                </div>
              </label>

              {/* SAVE */}

              <div className="mt-5 flex items-center justify-between gap-3">
                {hasChanges ? (
                  <span className="text-xs font-medium text-amber-700">
                    Unsaved changes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                    <CheckCircleOutlineRoundedIcon
                      sx={{
                        fontSize: 15,
                      }}
                    />
                    Saved
                  </span>
                )}

                <button
                  type="button"
                  disabled={!hasChanges || Boolean(savingId)}
                  onClick={() => void handleSave(governorate)}
                  className="
                    inline-flex
                    min-h-9
                    items-center
                    justify-center
                    gap-1.5
                    rounded-lg
                    bg-gray-950
                    px-3
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-gray-800

                    disabled:cursor-not-allowed
                    disabled:bg-gray-200
                    disabled:text-gray-500
                  "
                >
                  <SaveOutlinedIcon
                    sx={{
                      fontSize: 16,
                    }}
                  />

                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* NOTE */}

      <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 md:px-6">
        <p className="text-xs leading-5 text-gray-500">
          Inactive governorates will eventually be unavailable during customer
          checkout. Delivery fees are always validated by the backend before an
          order is created.
        </p>
      </div>
    </section>
  );
}

export default DeliveryGovernorateSettings;
