import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { toast } from "react-toastify";
import {
  fetchAdminStoreSettings,
  updateAdminStoreSettings,
} from "../../services/adminDashboardApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

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

  const [form, setForm] = useState(() => createFormState(null));

  const [isSaving, setIsSaving] = useState(false);

  const isLoading = settingState.requestKey !== requestKey;

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

        setForm(createFormState(response.setting));
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

      setSettingState((currentState) => ({
        ...currentState,
        setting: response.setting,
        error: null,
      }));

      setForm(createFormState(response.setting));

      toast.success(response.message ?? "Store settings updated successfully.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update store settings."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />

        <div className="mt-8 h-[34rem] animate-pulse rounded-2xl bg-gray-100" />
      </section>
    );
  }

  if (settingState.error) {
    return (
      <section className="py-16 text-center">
        <ErrorOutlineRoundedIcon
          className="text-red-500"
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          Store settings could not be loaded
        </h1>

        <p className="mt-3 text-gray-600">
          {getApiErrorMessage(
            settingState.error,
            "Unable to load store settings.",
          )}
        </p>

        <button
          type="button"
          onClick={() => setReloadToken((currentValue) => currentValue + 1)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          <RefreshRoundedIcon />
          Try again
        </button>
      </section>
    );
  }

  return (
    <section>
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-950">
          Store settings
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Control the store identity, checkout currency, delivery fee, and
          whether customers can place new orders.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
              <StorefrontOutlinedIcon />
            </span>

            <div>
              <h2 className="text-xl font-bold text-gray-950">
                Store information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Basic information used across the storefront and checkout.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Store name
              </span>

              <input
                type="text"
                value={form.storeName}
                onChange={(event) =>
                  updateField("storeName", event.target.value)
                }
                maxLength={120}
                disabled={isSaving}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
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
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 uppercase outline-none focus:border-gray-950 disabled:bg-gray-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Use a three-letter currency code such as USD.
              </p>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <LocalShippingOutlinedIcon />
            </span>

            <div>
              <h2 className="text-xl font-bold text-gray-950">
                Delivery settings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The delivery fee is added to every new order during checkout.
              </p>
            </div>
          </div>

          <label className="mt-6 block max-w-md">
            <span className="text-sm font-semibold text-gray-700">
              Default delivery fee
            </span>

            <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-gray-950">
              <span className="flex items-center border-r border-gray-300 bg-gray-50 px-4 text-sm font-bold text-gray-600">
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
                className="min-w-0 flex-1 px-4 py-3 outline-none disabled:bg-gray-100"
              />
            </div>
          </label>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                form.ordersEnabled
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700",
              ].join(" ")}
            >
              <SettingsOutlinedIcon />
            </span>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-950">
                Customer ordering
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Disable this setting when the store cannot accept new orders.
                Browsing, carts, accounts, and wishlists will remain available.
              </p>

              <button
                type="button"
                role="switch"
                aria-checked={form.ordersEnabled}
                onClick={() =>
                  updateField("ordersEnabled", !form.ordersEnabled)
                }
                disabled={isSaving}
                className={[
                  "relative mt-5 inline-flex h-8 w-14 items-center rounded-full transition disabled:opacity-50",
                  form.ordersEnabled ? "bg-green-600" : "bg-gray-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-6 w-6 rounded-full bg-white shadow-sm transition",
                    form.ordersEnabled ? "translate-x-7" : "translate-x-1",
                  ].join(" ")}
                />
              </button>

              <p className="mt-3 text-sm font-semibold text-gray-700">
                {form.ordersEnabled
                  ? "Customers can place new orders."
                  : "New customer orders are disabled."}
              </p>
            </div>
          </div>

          {!form.ordersEnabled && (
            <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <WarningAmberRoundedIcon className="shrink-0 text-amber-700" />

              <p className="text-sm leading-6 text-amber-800">
                Checkout will show that the store is not accepting orders, and
                the backend will reject order creation.
              </p>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <SaveOutlinedIcon />

            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminSettings;
