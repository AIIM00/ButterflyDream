import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// MUI Icons
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

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
     CHECK CHANGES
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
     SAVE
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
      <section
        className="
          overflow-hidden
          rounded-[1.4rem]
          border
          border-gray-200/80
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.04)]
        "
      >
        <div
          className="
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-5
            sm:py-5

            lg:px-6
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                h-10
                w-10
                shrink-0
                animate-pulse
                rounded-xl
                bg-gray-100

                sm:h-11
                sm:w-11
              "
            />

            <div className="min-w-0 flex-1">
              <div
                className="
                  h-5
                  w-44
                  max-w-full
                  animate-pulse
                  rounded
                  bg-gray-100
                "
              />

              <div
                className="
                  mt-2
                  h-3.5
                  w-72
                  max-w-full
                  animate-pulse
                  rounded
                  bg-gray-100
                "
              />
            </div>
          </div>
        </div>

        <div
          className="
            grid
            gap-3
            p-4

            sm:grid-cols-2
            sm:gap-4
            sm:p-5

            lg:p-6
          "
        >
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-44
                animate-pulse
                rounded-[1rem]
                bg-gray-100
              "
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
      <section
        className="
          overflow-hidden
          rounded-[1.4rem]
          border
          border-red-200
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.04)]
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
            p-4

            sm:p-5

            lg:p-6
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-600
              ring-1
              ring-red-100

              sm:h-11
              sm:w-11
            "
          >
            <ErrorOutlineRoundedIcon />
          </span>

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-red-500
              "
            >
              Loading error
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
              Delivery fees could not be loaded
            </h2>

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
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gray-950
                px-4
                text-xs
                font-bold
                text-white
                transition-colors

                hover:bg-gray-800

                sm:min-h-11
                sm:px-5
                sm:text-sm
              "
            >
              <RefreshRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     SUMMARY
  ========================================================= */

  const activeCount = governorates.filter(
    (governorate) => drafts[governorate.id]?.isActive ?? governorate.isActive,
  ).length;

  /* =========================================================
     DELIVERY GOVERNORATES
  ========================================================= */

  return (
    <section
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white
        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className="
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
                ring-1
                ring-blue-100

                sm:h-11
                sm:w-11
              "
            >
              <LocalShippingOutlinedIcon
                sx={{
                  fontSize: 21,
                }}
              />
            </span>

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
                Delivery
              </p>

              <h2
                className="
                  mt-0.5
                  text-lg
                  font-bold
                  tracking-[-0.025em]
                  text-gray-950

                  sm:text-xl
                "
              >
                Delivery fees by governorate
              </h2>

              <p
                className="
                  mt-1.5
                  max-w-2xl
                  text-xs
                  leading-5
                  text-gray-500

                  sm:text-sm
                  sm:leading-6
                "
              >
                Set the delivery price for each Lebanese governorate and control
                where Butterfly Dream currently delivers.
              </p>
            </div>
          </div>

          {/* ACTIVE COUNT */}
          <div
            className="
              hidden
              shrink-0
              text-right

              sm:block
            "
          >
            <p
              className="
                text-[0.6rem]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Available
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                text-gray-950
              "
            >
              {activeCount}/{governorates.length}
            </p>
          </div>
        </div>

        {/* MOBILE SUMMARY */}
        <div
          className="
            mt-4
            grid
            grid-cols-2
            divide-x
            divide-gray-200
            rounded-xl
            bg-gray-50
            py-3

            sm:hidden
          "
        >
          <div className="px-3 text-center">
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.08em]
                text-gray-400
              "
            >
              Governorates
            </p>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-gray-950
              "
            >
              {governorates.length}
            </p>
          </div>

          <div className="px-3 text-center">
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.08em]
                text-gray-400
              "
            >
              Available
            </p>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-emerald-700
              "
            >
              {activeCount}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          GOVERNORATES
      ===================================================== */}
      <div
        className="
          grid
          gap-3
          p-4

          sm:grid-cols-2
          sm:gap-4
          sm:p-5

          lg:p-6
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
                    overflow-hidden
                    rounded-[1.15rem]
                    border
                    transition-all
                  `,
                draft.isActive
                  ? `
                      border-gray-200
                      bg-white

                      shadow-[0_4px_14px_rgba(15,23,42,0.025)]
                    `
                  : `
                      border-gray-200
                      bg-gray-50/60
                    `,
              ].join(" ")}
            >
              {/* ===========================================
                    ROW HEADER
                =========================================== */}
              <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-3
                    px-4
                    pt-4

                    sm:px-5
                    sm:pt-5
                  "
              >
                <div
                  className="
                      flex
                      min-w-0
                      items-start
                      gap-2.5
                    "
                >
                  <span
                    className={[
                      `
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ring-1
                        `,
                      draft.isActive
                        ? `
                            bg-emerald-50
                            text-emerald-600
                            ring-emerald-100
                          `
                        : `
                            bg-gray-100
                            text-gray-400
                            ring-gray-200
                          `,
                    ].join(" ")}
                  >
                    <LocationOnOutlinedIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="
                          truncate
                          text-sm
                          font-bold
                          text-gray-950

                          sm:text-base
                        "
                    >
                      {governorate.name}
                    </h3>

                    <div
                      className="
                          mt-1
                          flex
                          items-center
                          gap-1.5
                        "
                    >
                      <span
                        className={[
                          `
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-full
                            `,
                          draft.isActive ? "bg-emerald-500" : "bg-gray-300",
                        ].join(" ")}
                      />

                      <span
                        className={[
                          `
                              text-[0.65rem]
                              font-medium

                              sm:text-xs
                            `,
                          draft.isActive ? "text-emerald-700" : "text-gray-400",
                        ].join(" ")}
                      >
                        {draft.isActive
                          ? "Delivery available"
                          : "Delivery unavailable"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =========================================
                      ACTIVE SWITCH
                  ========================================= */}
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
                        transition-colors

                        focus:outline-none
                        focus:ring-4
                        focus:ring-gray-950/[0.05]

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      `,
                    draft.isActive ? "bg-emerald-600" : "bg-gray-300",
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

              {/* ===========================================
                    DELIVERY FEE
                =========================================== */}
              <div
                className="
                    px-4
                    pb-4
                    pt-5

                    sm:px-5
                    sm:pb-5
                  "
              >
                <label
                  htmlFor={`delivery-fee-${governorate.id}`}
                  className="
                      text-[0.68rem]
                      font-bold
                      text-gray-700

                      sm:text-xs
                    "
                >
                  Delivery fee
                </label>

                <div
                  className="
                      mt-2
                      flex
                      min-h-12
                      overflow-hidden
                      rounded-[0.95rem]
                      border
                      border-gray-200
                      bg-white
                      transition

                      focus-within:border-gray-400
                      focus-within:ring-4
                      focus-within:ring-gray-950/[0.035]
                    "
                >
                  <span
                    className="
                        flex
                        shrink-0
                        items-center
                        border-r
                        border-gray-200
                        bg-gray-50
                        px-3
                        text-[0.65rem]
                        font-bold
                        text-gray-500

                        sm:text-xs
                      "
                  >
                    {currency || "USD"}
                  </span>

                  <input
                    id={`delivery-fee-${governorate.id}`}
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
                        text-sm
                        font-bold
                        text-gray-950
                        outline-none

                        disabled:cursor-not-allowed
                        disabled:bg-gray-100
                      "
                  />
                </div>

                {/* =========================================
                      SAVE STATUS + ACTION
                  ========================================= */}
                <div
                  className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                >
                  {hasChanges ? (
                    <span
                      className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-[0.65rem]
                          font-bold
                          text-amber-700

                          sm:text-xs
                        "
                    >
                      <span
                        className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-amber-500
                          "
                      />
                      Unsaved changes
                    </span>
                  ) : (
                    <span
                      className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-[0.65rem]
                          font-medium
                          text-gray-400

                          sm:text-xs
                        "
                    >
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
                        min-h-10
                        items-center
                        justify-center
                        gap-1.5
                        rounded-full
                        bg-gray-950
                        px-4
                        text-xs
                        font-bold
                        text-white
                        transition-colors

                        hover:bg-gray-800

                        disabled:cursor-not-allowed
                        disabled:bg-gray-200
                        disabled:text-gray-400
                      "
                  >
                    <SaveOutlinedIcon
                      sx={{
                        fontSize: 15,
                      }}
                    />

                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* =====================================================
          NOTE
      ===================================================== */}
      <div
        className="
          border-t
          border-gray-100
          bg-gray-50/60
          px-4
          py-4

          sm:px-5

          lg:px-6
        "
      >
        <p
          className="
            text-[0.68rem]
            leading-5
            text-gray-500

            sm:text-xs
          "
        >
          Disabled governorates are unavailable to customers when choosing a
          delivery address. Delivery fees are validated again by the backend
          before an order is created.
        </p>
      </div>
    </section>
  );
}

export default DeliveryGovernorateSettings;
