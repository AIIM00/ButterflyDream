import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import CheckoutOrderItem from "../../components/checkout/CheckoutOrderItem.jsx";
import useAppContext from "../../context/app/useAppContext.js";
import useCart from "../../context/cart/useCart.js";
import {
  fetchCheckoutOptions,
  fetchCustomerCheckout,
  placeCustomerManualOrder,
  placeCustomerOrder,
  placeGuestOrder,
  previewCheckout,
  saveCustomerCheckoutAddress,
} from "../../services/checkoutApi.js";
import formatCurrency from "../../utils/formatCurrency.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

const EMPTY_ADDRESS = {
  recipientName: "",
  phone: "",
  governorate: "",
  city: "",
  street: "",
  building: "",
  floor: "",
  landmark: "",
  notes: "",
};

const EMPTY_GUEST = {
  fullName: "",
  email: "",
  phone: "",
};

function cartItemsPayload(cart) {
  return (cart?.items ?? []).map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));
}

function hasRequiredAddress(address) {
  return Boolean(
    address.recipientName.trim() &&
      address.phone.trim() &&
      address.governorate.trim() &&
      address.city.trim() &&
      address.street.trim(),
  );
}

function fieldClass() {
  return "min-h-12 w-full rounded-[1rem] border border-brand-border bg-brand-surface px-4 text-sm text-brand-text outline-none transition focus:border-brand-accent-fill focus:ring-2 focus:ring-brand-accent-fill/15 disabled:cursor-not-allowed disabled:opacity-60";
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="rounded-[1.6rem] border border-brand-border bg-brand-surface p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)] sm:p-6">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-brand-accent-text">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-display text-2xl font-medium tracking-[-0.03em] text-brand-text">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AddressForm({
  value,
  onChange,
  disabled,
  governorates,
  currency,
  optionsLoading,
}) {
  function update(event) {
    const { name, value: nextValue } = event.target;
    onChange((current) => ({ ...current, [name]: nextValue }));
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Recipient name
        </label>
        <input
          name="recipientName"
          value={value.recipientName}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
          autoComplete="name"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Phone
        </label>
        <input
          name="phone"
          value={value.phone}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
          autoComplete="tel"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Governorate
        </label>
        <select
          name="governorate"
          value={value.governorate}
          onChange={update}
          disabled={disabled || optionsLoading || governorates.length === 0}
          className={fieldClass()}
          autoComplete="address-level1"
        >
          <option value="">
            {optionsLoading
              ? "Loading governorates..."
              : governorates.length === 0
                ? "No delivery governorates available"
                : "Choose governorate"}
          </option>
          {governorates.map((governorate) => (
            <option key={governorate.id} value={governorate.name}>
              {governorate.name} — {formatCurrency(governorate.deliveryFee, currency)} delivery
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[0.65rem] leading-5 text-brand-text-muted">
          Only governorates currently served by Butterfly Dream can be selected.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          City / town
        </label>
        <input
          name="city"
          value={value.city}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
          autoComplete="address-level2"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Street / area
        </label>
        <input
          name="street"
          value={value.street}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
          autoComplete="street-address"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Building <span className="font-normal text-brand-text-muted">(optional)</span>
        </label>
        <input
          name="building"
          value={value.building}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Floor <span className="font-normal text-brand-text-muted">(optional)</span>
        </label>
        <input
          name="floor"
          value={value.floor}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Landmark <span className="font-normal text-brand-text-muted">(optional)</span>
        </label>
        <input
          name="landmark"
          value={value.landmark}
          onChange={update}
          disabled={disabled}
          className={fieldClass()}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-brand-text">
          Delivery notes <span className="font-normal text-brand-text-muted">(optional)</span>
        </label>
        <textarea
          name="notes"
          value={value.notes}
          onChange={update}
          disabled={disabled}
          rows={3}
          className={`${fieldClass()} py-3`}
        />
      </div>
    </div>
  );
}

function CheckoutGuestEnabled() {
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading } = useAppContext();
  const { cart, isLoading: cartLoading, clearCart, reloadCart } = useCart();

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const [checkoutOptions, setCheckoutOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [addressMode, setAddressMode] = useState("manual");
  const [savedCheckout, setSavedCheckout] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [manualAddress, setManualAddress] = useState(EMPTY_ADDRESS);
  const [guestInfo, setGuestInfo] = useState(EMPTY_GUEST);
  const [manualPreview, setManualPreview] = useState(null);
  const [customerNote, setCustomerNote] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemPayload = useMemo(() => cartItemsPayload(cart), [cart]);
  const governorates = checkoutOptions?.governorates ?? [];

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const response = await fetchCheckoutOptions({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setCheckoutOptions(response.checkoutOptions ?? null);
        }
      } catch (error) {
        if (error?.code !== "ERR_CANCELED") {
          toast.error(
            getApiErrorMessage(
              error,
              "Unable to load the available delivery governorates.",
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setOptionsLoading(false);
        }
      }
    }

    void loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isCustomer || authLoading) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadSavedCheckout() {
      setIsLoadingCheckout(true);
      try {
        const response = await fetchCustomerCheckout({ signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }

        setSavedCheckout(response.checkout);
        const defaultId = response.checkout?.defaultAddressId ?? "";
        setSelectedAddressId(defaultId);
        setAddressMode(response.checkout?.addresses?.length ? "saved" : "manual");
      } catch (error) {
        if (error?.code !== "ERR_CANCELED") {
          toast.error(getApiErrorMessage(error, "Unable to load saved addresses."));
          setAddressMode("manual");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCheckout(false);
        }
      }
    }

    void loadSavedCheckout();
    return () => controller.abort();
  }, [authLoading, isCustomer]);

  useEffect(() => {
    if (addressMode !== "manual" || !hasRequiredAddress(manualAddress)) {
      setManualPreview(null);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsPreviewing(true);
      try {
        const response = await previewCheckout(
          {
            items: itemPayload,
            deliveryAddress: manualAddress,
          },
          { signal: controller.signal },
        );

        if (!controller.signal.aborted) {
          setManualPreview(response.checkout);
        }
      } catch (error) {
        if (error?.code !== "ERR_CANCELED") {
          setManualPreview(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsPreviewing(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [addressMode, itemPayload, manualAddress]);

  async function selectSavedAddress(addressId) {
    setSelectedAddressId(addressId);
    setIsLoadingCheckout(true);

    try {
      const response = await fetchCustomerCheckout({ addressId });
      setSavedCheckout(response.checkout);
      setSelectedAddressId(response.checkout?.selectedAddressId ?? addressId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update delivery."));
    } finally {
      setIsLoadingCheckout(false);
    }
  }

  const checkout = addressMode === "saved" ? savedCheckout : manualPreview;
  const displayItems = checkout?.cart?.items ?? cart?.items ?? [];
  const summary = checkout?.cart?.summary ?? cart?.summary;
  const currency =
    checkout?.currency ?? checkoutOptions?.currency ?? cart?.currency ?? "USD";

  const guestInfoValid = Boolean(
    guestInfo.fullName.trim() &&
      guestInfo.email.trim() &&
      guestInfo.phone.trim(),
  );
  const manualAddressValid = hasRequiredAddress(manualAddress);
  const savedAddressValid = Boolean(selectedAddressId);
  const canPlace =
    !isSubmitting &&
    !isPreviewing &&
    itemPayload.length > 0 &&
    (addressMode === "saved"
      ? savedAddressValid && Boolean(summary?.canPlaceOrder)
      : manualAddressValid && Boolean(summary?.canPlaceOrder)) &&
    (isCustomer || guestInfoValid);

  async function submitOrder() {
    if (!canPlace) {
      toast.error("Complete the delivery and contact information first.");
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      if (isCustomer && addressMode === "saved") {
        response = await placeCustomerOrder({
          addressId: selectedAddressId,
          customerNote: customerNote.trim() || null,
        });
      } else if (isCustomer) {
        if (saveAddress) {
          try {
            await saveCustomerCheckoutAddress({
              label: addressLabel.trim() || "Home",
              ...manualAddress,
              isDefault: false,
            });
          } catch (error) {
            toast.warning(
              getApiErrorMessage(
                error,
                "The order can continue, but this address could not be saved.",
              ),
            );
          }
        }

        response = await placeCustomerManualOrder({
          deliveryAddress: manualAddress,
          customerNote: customerNote.trim() || null,
        });
      } else {
        response = await placeGuestOrder({
          items: itemPayload,
          customer: guestInfo,
          deliveryAddress: manualAddress,
          customerNote: customerNote.trim() || null,
        });
      }

      if (isCustomer) {
        await reloadCart().catch(() => undefined);
      } else {
        await clearCart().catch(() => undefined);
      }

      toast.success(response.message ?? "Order placed successfully.");
      navigate(`/checkout/success/${response.order.id}`, {
        replace: true,
        state: {
          order: response.order,
          guest: !isCustomer,
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to place your order."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <section className="min-h-screen bg-brand-page px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-20 rounded-[1.5rem] bg-brand-surface-soft" />
          <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <div className="h-[34rem] rounded-[1.5rem] bg-brand-surface-soft" />
            <div className="h-[28rem] rounded-[1.5rem] bg-brand-surface-soft" />
          </div>
        </div>
      </section>
    );
  }

  if (itemPayload.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center bg-brand-page px-4 py-12">
        <div className="mx-auto max-w-xl text-center">
          <ShoppingBagOutlinedIcon
            sx={{ fontSize: 44 }}
            className="text-brand-accent-text"
          />
          <h1 className="mt-4 font-display text-4xl font-medium text-brand-text">
            Your bag is empty.
          </h1>
          <Link
            to="/products"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-brand-page text-brand-text">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-7 sm:px-6 lg:px-8 lg:pt-12">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-text-muted hover:text-brand-text"
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} /> Back to bag
        </Link>

        <header className="mt-5 max-w-3xl">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-brand-accent-text">
            Simple checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
            Finish your order your way.
          </h1>
          <p className="mt-3 text-sm leading-7 text-brand-text-muted sm:text-base">
            {isCustomer
              ? "Use a saved address or enter a different delivery address for this order."
              : "No account is required. Continue as a guest, or sign in to keep your orders and addresses together."}
          </p>
        </header>

        {!isCustomer && (
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border-2 border-brand-primary bg-brand-surface p-4">
              <CheckCircleOutlineRoundedIcon className="text-brand-accent-text" />
              <p className="mt-2 text-sm font-bold">Continue as guest</p>
              <p className="mt-1 text-xs leading-5 text-brand-text-muted">
                Enter your details below. No password needed.
              </p>
            </div>

            <Link
              to="/login"
              state={{ from: { pathname: "/checkout" } }}
              className="rounded-[1.35rem] border border-brand-border bg-brand-surface p-4 transition hover:border-brand-accent-fill"
            >
              <AccountCircleOutlinedIcon className="text-brand-accent-text" />
              <p className="mt-2 text-sm font-bold">Sign in</p>
              <p className="mt-1 text-xs leading-5 text-brand-text-muted">
                Your guest bag will move into your account.
              </p>
            </Link>

            <Link
              to="/register"
              state={{ from: { pathname: "/checkout" } }}
              className="rounded-[1.35rem] border border-brand-border bg-brand-surface p-4 transition hover:border-brand-accent-fill"
            >
              <PersonAddAltOutlinedIcon className="text-brand-accent-text" />
              <p className="mt-2 text-sm font-bold">Create an account</p>
              <p className="mt-1 text-xs leading-5 text-brand-text-muted">
                Save addresses and manage future orders faster.
              </p>
            </Link>
          </section>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
          <div className="space-y-5">
            {!isCustomer && (
              <Section eyebrow="Step 1" title="Contact information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold">
                      Full name
                    </label>
                    <input
                      value={guestInfo.fullName}
                      onChange={(event) => {
                        const fullName = event.target.value;
                        setGuestInfo((current) => ({ ...current, fullName }));
                        setManualAddress((current) =>
                          current.recipientName
                            ? current
                            : { ...current, recipientName: fullName },
                        );
                      }}
                      className={fieldClass()}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">
                      Email
                    </label>
                    <input
                      type="email"
                      value={guestInfo.email}
                      onChange={(event) =>
                        setGuestInfo((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className={fieldClass()}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">
                      Phone
                    </label>
                    <input
                      value={guestInfo.phone}
                      onChange={(event) => {
                        const phone = event.target.value;
                        setGuestInfo((current) => ({ ...current, phone }));
                        setManualAddress((current) =>
                          current.phone ? current : { ...current, phone },
                        );
                      }}
                      className={fieldClass()}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </Section>
            )}

            <Section
              eyebrow={isCustomer ? "Delivery" : "Step 2"}
              title="Delivery address"
            >
              {isCustomer && (
                <div className="mb-5 flex rounded-full bg-brand-surface-soft p-1">
                  <button
                    type="button"
                    onClick={() => setAddressMode("saved")}
                    disabled={!savedCheckout?.addresses?.length}
                    className={`min-h-10 flex-1 rounded-full px-4 text-xs font-bold transition ${
                      addressMode === "saved"
                        ? "bg-brand-primary text-white"
                        : "text-brand-text-muted"
                    } disabled:opacity-40`}
                  >
                    Saved addresses
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode("manual")}
                    className={`min-h-10 flex-1 rounded-full px-4 text-xs font-bold transition ${
                      addressMode === "manual"
                        ? "bg-brand-primary text-white"
                        : "text-brand-text-muted"
                    }`}
                  >
                    Enter manually
                  </button>
                </div>
              )}

              {isCustomer && addressMode === "saved" ? (
                <div className="space-y-3">
                  {(savedCheckout?.addresses ?? []).map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => void selectSavedAddress(address.id)}
                      className={`w-full rounded-[1.15rem] border p-4 text-left transition ${
                        selectedAddressId === address.id
                          ? "border-brand-primary bg-brand-surface-soft"
                          : "border-brand-border hover:border-brand-accent-fill"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold">{address.label}</p>
                          <p className="mt-1 text-sm text-brand-text-muted">
                            {address.recipientName} · {address.phone}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-brand-text-muted">
                            {address.street}, {address.city}, {address.governorate}
                          </p>
                        </div>
                        {selectedAddressId === address.id && (
                          <CheckCircleOutlineRoundedIcon className="text-brand-accent-text" />
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAddressMode("manual")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent-text"
                  >
                    <AddLocationAltOutlinedIcon sx={{ fontSize: 18 }} /> Use a
                    different address
                  </button>
                </div>
              ) : (
                <>
                  <AddressForm
                    value={manualAddress}
                    onChange={setManualAddress}
                    disabled={isSubmitting}
                    governorates={governorates}
                    currency={currency}
                    optionsLoading={optionsLoading}
                  />

                  {isCustomer && (
                    <div className="mt-5 rounded-[1rem] bg-brand-surface-soft p-4">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(event) => setSaveAddress(event.target.checked)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-semibold">
                            Save this address to my account
                          </span>
                          <span className="mt-1 block text-xs text-brand-text-muted">
                            Optional — you can also use it only for this order.
                          </span>
                        </span>
                      </label>

                      {saveAddress && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold">
                            Address label
                          </label>
                          <input
                            value={addressLabel}
                            onChange={(event) => setAddressLabel(event.target.value)}
                            placeholder="Home, Work..."
                            className={fieldClass()}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Section>

            <Section
              eyebrow={isCustomer ? "Order note" : "Step 3"}
              title="Anything we should know?"
            >
              <textarea
                value={customerNote}
                onChange={(event) =>
                  setCustomerNote(event.target.value.slice(0, 1000))
                }
                rows={4}
                placeholder="Optional note for your order or delivery"
                className={`${fieldClass()} py-3`}
              />
              <p className="mt-2 text-right text-[0.65rem] text-brand-text-muted">
                {customerNote.length}/1000
              </p>
            </Section>

            <Section
              eyebrow="Your bag"
              title={`${displayItems.length} item${displayItems.length === 1 ? "" : "s"}`}
            >
              <div className="-my-5">
                {displayItems.map((item) => (
                  <CheckoutOrderItem key={item.id} item={item} />
                ))}
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[1.6rem] border border-brand-border bg-brand-surface p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)] sm:p-6">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-brand-accent-text">
                Order summary
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-brand-text-muted">Subtotal</span>
                  <strong>
                    {formatCurrency(summary?.subtotal ?? 0, currency)}
                  </strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-brand-text-muted">Delivery</span>
                  <strong>
                    {summary?.deliveryFee == null
                      ? "Choose address"
                      : formatCurrency(summary.deliveryFee, currency)}
                  </strong>
                </div>

                <div className="border-t border-brand-border pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-3xl font-semibold tracking-[-0.04em]">
                      {formatCurrency(
                        summary?.totalAmount ?? summary?.subtotal ?? 0,
                        currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {checkoutOptions?.ordersEnabled === false && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                  Online orders are temporarily paused.
                </div>
              )}

              {governorates.length === 0 && !optionsLoading && addressMode === "manual" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                  No delivery governorates are currently enabled. Please contact the store before ordering.
                </div>
              )}

              {(summary?.hasUnavailableItems || summary?.hasInsufficientStock) && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  One or more bag items need attention before the order can be placed.
                </div>
              )}

              <button
                type="button"
                onClick={() => void submitOrder()}
                disabled={!canPlace || isLoadingCheckout || optionsLoading}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
              >
                <LockOutlinedIcon sx={{ fontSize: 17 }} />
                {isSubmitting
                  ? "Placing order..."
                  : isPreviewing || isLoadingCheckout || optionsLoading
                    ? "Updating total..."
                    : "Place order"}
              </button>

              <div className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-brand-text-muted">
                <LocalShippingOutlinedIcon
                  sx={{ fontSize: 17 }}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  Cash on delivery. Stock and prices are checked again when you
                  place the order.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CheckoutGuestEnabled;
