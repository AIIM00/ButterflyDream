import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Components
import DeliveryGovernorateSettings from "../../components/admin/settings/DeliveryGovernorateSettings.jsx";

// MUI Icons
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// Toast
import { toast } from "react-toastify";

// Services
import {
  fetchAdminStoreSettings,
  updateAdminStoreSettings,
} from "../../services/adminDashboardApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   HELPERS
========================================================= */

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function createFormState(setting) {
  return {
    storeName: setting?.storeName ?? "",

    currency: setting?.currency ?? "USD",

    defaultDeliveryFee: setting?.defaultDeliveryFee ?? "0.00",

    ordersEnabled: setting?.ordersEnabled ?? true,
  };
}

function validateSettingsForm(form) {
  if (!form.storeName.trim()) {
    return "Store name is required.";
  }

  if (!/^[A-Za-z]{3}$/.test(form.currency.trim())) {
    return "Currency must contain exactly three letters.";
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(form.defaultDeliveryFee.trim())) {
    return "Delivery fee must be a valid amount with no more than two decimal places.";
  }

  const deliveryFee = Number(form.defaultDeliveryFee);

  if (
    !Number.isFinite(deliveryFee) ||
    deliveryFee < 0 ||
    deliveryFee > 1000000
  ) {
    return "Delivery fee must be between 0 and 1,000,000.";
  }

  return null;
}

/* =========================================================
   STORE SETTINGS FORM
========================================================= */

function StoreSettingsForm({ setting, onSettingUpdated }) {
  const [form, setForm] = useState(() => createFormState(setting));

  const [isSaving, setIsSaving] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateSettingsForm(form);

    if (validationError) {
      toast.error(validationError);

      return;
    }

    setIsSaving(true);

    try {
      const response = await updateAdminStoreSettings({
        storeName: form.storeName.trim(),

        currency: form.currency.trim().toUpperCase(),

        defaultDeliveryFee: Number(form.defaultDeliveryFee).toFixed(2),

        ordersEnabled: form.ordersEnabled,
      });

      const nextSetting = response.setting;

      onSettingUpdated(nextSetting);

      setForm(createFormState(nextSetting));

      toast.success(response.message ?? "Store settings updated successfully.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update store settings."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-5

        sm:space-y-6
      "
    >
      {/* =====================================================
          STORE INFORMATION
      ===================================================== */}
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
        {/* HEADER */}
        <div
          className="
            flex
            items-start
            gap-3
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-5
            sm:py-5

            lg:px-6
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
              bg-gray-950
              text-white
            "
          >
            <StorefrontOutlinedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </span>

          <div>
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Store identity
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                text-gray-950

                sm:text-xl
              "
            >
              Store information
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              Basic information used across the storefront and checkout.
            </p>
          </div>
        </div>

        {/* FIELDS */}
        <div
          className="
            grid
            gap-4
            p-4

            sm:p-5

            md:grid-cols-2

            lg:p-6
          "
        >
          {/* STORE NAME */}
          <label>
            <span
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Store name
            </span>

            <input
              type="text"
              value={form.storeName}
              onChange={(event) => updateField("storeName", event.target.value)}
              maxLength={120}
              disabled={isSaving}
              className="
                mt-2
                min-h-12
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                text-gray-900
                outline-none
                transition

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]

                disabled:cursor-not-allowed
                disabled:bg-gray-100
              "
            />
          </label>

          {/* CURRENCY */}
          <label>
            <span
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Currency
            </span>

            <input
              type="text"
              value={form.currency}
              onChange={(event) =>
                updateField("currency", event.target.value.toUpperCase())
              }
              maxLength={3}
              disabled={isSaving}
              placeholder="USD"
              className="
                mt-2
                min-h-12
                w-full
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-semibold
                uppercase
                text-gray-900
                outline-none
                transition

                placeholder:text-gray-400

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]

                disabled:cursor-not-allowed
                disabled:bg-gray-100
              "
            />

            <p
              className="
                mt-1.5
                text-[0.65rem]
                leading-5
                text-gray-400

                sm:text-xs
              "
            >
              Three-letter currency code, for example USD.
            </p>
          </label>
        </div>
      </section>

      {/* =====================================================
          GOVERNORATE DELIVERY
      ===================================================== */}
      <DeliveryGovernorateSettings currency={form.currency || "USD"} />

      {/* =====================================================
          TEMPORARY DELIVERY FALLBACK
      ===================================================== */}
      <section
        className="
          overflow-hidden
          rounded-[1.4rem]
          border
          border-amber-200
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-start
            gap-3
            border-b
            border-amber-100
            bg-amber-50/50
            px-4
            py-4

            sm:px-5
            sm:py-5

            lg:px-6
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
              bg-amber-100
              text-amber-700
            "
          >
            <LocalShippingOutlinedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </span>

          <div>
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-amber-600
              "
            >
              Temporary fallback
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                text-gray-950

                sm:text-xl
              "
            >
              Current checkout fallback
            </h2>

            <p
              className="
                mt-1
                max-w-2xl
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
            >
              Customer checkout currently uses this global delivery fee.
              Governorate pricing will replace it in the next implementation
              step.
            </p>
          </div>
        </div>

        <div
          className="
            p-4

            sm:p-5

            lg:p-6
          "
        >
          <label
            className="
              block
              max-w-md
            "
          >
            <span
              className="
                text-xs
                font-bold
                text-gray-800

                sm:text-sm
              "
            >
              Default delivery fee
            </span>

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
                  px-3.5
                  text-xs
                  font-bold
                  text-gray-500
                "
              >
                {form.currency || "USD"}
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={form.defaultDeliveryFee}
                onChange={(event) =>
                  updateField("defaultDeliveryFee", event.target.value)
                }
                disabled={isSaving}
                className="
                  min-w-0
                  flex-1
                  bg-white
                  px-4
                  text-sm
                  text-gray-900
                  outline-none

                  disabled:bg-gray-100
                "
              />
            </div>
          </label>

          <div
            className="
              mt-4
              flex
              items-start
              gap-2.5
              rounded-[1rem]
              bg-amber-50
              p-3.5
            "
          >
            <WarningAmberRoundedIcon
              sx={{
                fontSize: 17,
              }}
              className="
                mt-0.5
                shrink-0
                text-amber-600
              "
            />

            <p
              className="
                text-[0.68rem]
                leading-5
                text-amber-800

                sm:text-xs
              "
            >
              Temporary only. Keep this setting until checkout has been switched
              completely to governorate-based pricing.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CUSTOMER ORDERING
      ===================================================== */}
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
            flex
            items-start
            gap-3
            border-b
            border-gray-100
            px-4
            py-4

            sm:px-5
            sm:py-5

            lg:px-6
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
                rounded-xl
              `,
              form.ordersEnabled
                ? `
                  bg-emerald-50
                  text-emerald-700
                `
                : `
                  bg-amber-50
                  text-amber-700
                `,
            ].join(" ")}
          >
            <SettingsOutlinedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </span>

          <div className="min-w-0">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
            >
              Checkout availability
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                text-gray-950

                sm:text-xl
              "
            >
              Customer ordering
            </h2>

            <p
              className="
                mt-1
                max-w-2xl
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
            >
              Disable new purchases when the store cannot accept orders.
              Browsing, carts, accounts, and wishlists remain available.
            </p>
          </div>
        </div>

        <div
          className="
            p-4

            sm:p-5

            lg:p-6
          "
        >
          {/* SWITCH PANEL */}
          <div
            className={[
              `
                flex
                items-center
                justify-between
                gap-4
                rounded-[1rem]
                border
                p-3.5

                sm:p-4
              `,
              form.ordersEnabled
                ? `
                  border-emerald-200
                  bg-emerald-50/50
                `
                : `
                  border-amber-200
                  bg-amber-50/50
                `,
            ].join(" ")}
          >
            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className={[
                    `
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                    `,
                    form.ordersEnabled ? "bg-emerald-500" : "bg-amber-500",
                  ].join(" ")}
                />

                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {form.ordersEnabled
                    ? "Ordering enabled"
                    : "Ordering disabled"}
                </p>
              </div>

              <p
                className="
                  mt-1
                  text-[0.68rem]
                  leading-5
                  text-gray-500

                  sm:text-xs
                "
              >
                {form.ordersEnabled
                  ? "Customers can currently place new orders."
                  : "Customers cannot currently complete checkout."}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.ordersEnabled}
              aria-label="Toggle customer ordering"
              onClick={() => updateField("ordersEnabled", !form.ordersEnabled)}
              disabled={isSaving}
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

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `,
                form.ordersEnabled ? "bg-emerald-600" : "bg-gray-300",
              ].join(" ")}
            >
              <span
                className={[
                  `
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-transform
                  `,
                  form.ordersEnabled ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </div>

          {!form.ordersEnabled && (
            <div
              className="
                mt-4
                flex
                items-start
                gap-2.5
                rounded-[1rem]
                border
                border-amber-200
                bg-amber-50
                p-3.5
              "
            >
              <WarningAmberRoundedIcon
                sx={{
                  fontSize: 18,
                }}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-700
                "
              />

              <p
                className="
                  text-xs
                  leading-5
                  text-amber-800

                  sm:text-sm
                  sm:leading-6
                "
              >
                Checkout will tell customers that the store is not accepting
                orders, and the backend will reject new order creation.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SAVE
      ===================================================== */}
      <div
        className="
          flex
          justify-end
          pb-2
        "
      >
        <button
          type="submit"
          disabled={isSaving}
          className="
            inline-flex
            min-h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-gray-950
            px-6
            text-sm
            font-bold
            text-white
            transition-colors

            hover:bg-gray-800

            disabled:cursor-not-allowed
            disabled:bg-gray-200
            disabled:text-gray-400

            sm:w-auto
            sm:min-w-[10rem]
          "
        >
          <SaveOutlinedIcon
            sx={{
              fontSize: 18,
            }}
          />

          {isSaving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   PAGE
========================================================= */

function AdminSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reloadToken, setReloadToken] = useState(0);

  const requestKey = useMemo(() => String(reloadToken), [reloadToken]);

  const [settingState, setSettingState] = useState({
    requestKey: null,
    setting: null,
    error: null,
  });

  const isLoading = settingState.requestKey !== requestKey;

  /* =======================================================
     LOAD SETTINGS
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const response = await fetchAdminStoreSettings({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setSettingState({
          requestKey,
          setting: response.setting,
          error: null,
        });
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

        setSettingState({
          requestKey,
          setting: null,
          error,
        });
      }
    }

    void loadSettings();

    return () => {
      controller.abort();
    };
  }, [location.pathname, location.search, navigate, requestKey]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section
        className="
          mx-auto
          w-full
          max-w-6xl
        "
      >
        <div>
          <div
            className="
              h-3
              w-28
              animate-pulse
              rounded-full
              bg-gray-100
            "
          />

          <div
            className="
              mt-3
              h-8
              w-48
              animate-pulse
              rounded-lg
              bg-gray-100
            "
          />

          <div
            className="
              mt-3
              h-4
              w-80
              max-w-full
              animate-pulse
              rounded
              bg-gray-100
            "
          />
        </div>

        <div className="mt-5 space-y-4 sm:mt-6">
          <div className="h-64 animate-pulse rounded-[1.4rem] bg-gray-100" />

          <div className="h-96 animate-pulse rounded-[1.4rem] bg-gray-100" />

          <div className="h-72 animate-pulse rounded-[1.4rem] bg-gray-100" />

          <div className="h-64 animate-pulse rounded-[1.4rem] bg-gray-100" />
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (settingState.error || !settingState.setting) {
    return (
      <section
        className="
          mx-auto
          flex
          min-h-[60vh]
          w-full
          max-w-xl
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full
            rounded-[1.4rem]
            border
            border-red-200
            bg-white
            p-5
            text-center
            shadow-[0_8px_24px_rgba(15,23,42,0.04)]

            sm:p-8
          "
        >
          <span
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-600
              ring-1
              ring-red-100
            "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 26,
              }}
            />
          </span>

          <p
            className="
              mt-5
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.12em]
              text-red-500
            "
          >
            Loading error
          </p>

          <h1
            className="
              mt-1.5
              text-xl
              font-bold
              tracking-[-0.025em]
              text-gray-950

              sm:text-2xl
            "
          >
            Store settings could not be loaded
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            {getApiErrorMessage(
              settingState.error,
              "Unable to load store settings.",
            )}
          </p>

          <button
            type="button"
            onClick={() => setReloadToken((currentValue) => currentValue + 1)}
            className="
              mt-5
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-950
              px-5
              text-sm
              font-bold
              text-white
              transition-colors

              hover:bg-gray-800
            "
          >
            <RefreshRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Try again
          </button>
        </div>
      </section>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-6xl
        space-y-5

        sm:space-y-6
      "
    >
      {/* HEADER */}
      <header>
        <p
          className="
            text-[0.62rem]
            font-bold
            uppercase
            tracking-[0.13em]
            text-gray-400
          "
        >
          Administration
        </p>

        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-[-0.035em]
            text-gray-950

            sm:text-3xl
          "
        >
          Store settings
        </h1>

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
          Control store identity, checkout currency, delivery pricing, and
          whether customers can place new orders.
        </p>
      </header>

      <StoreSettingsForm
        key={
          settingState.setting.updatedAt ??
          settingState.setting.id ??
          requestKey
        }
        setting={settingState.setting}
        onSettingUpdated={(nextSetting) =>
          setSettingState((currentState) => ({
            ...currentState,
            setting: nextSetting,
            error: null,
          }))
        }
      />
    </section>
  );
}

export default AdminSettings;
