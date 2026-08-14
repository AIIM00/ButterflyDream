import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// React Toastify
import { toast } from "react-toastify";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

// Components
import AddressEditorDialog from "../../components/account/AddressEditorDialog.jsx";
import CustomerAddressCard from "../../components/account/CustomerAddressCard.jsx";
import CustomerPasswordForm from "../../components/account/CustomerPasswordForm.jsx";
import CustomerProfileEditor from "../../components/account/CustomerProfileEditor.jsx";

// Context
import useAppContext from "../../context/app/useAppContext.js";

// Services
import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "../../services/customerApi.js";

import { fetchCustomerProfile } from "../../services/customerProfileApi.js";

// Utilities
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function Account() {
  const navigate = useNavigate();

  const location = useLocation();

  const { user } = useAppContext();

  const [accountState, setAccountState] = useState({
    status: "loading",
    profile: null,
    addresses: [],
    error: null,
  });

  const [dialog, setDialog] = useState({
    open: false,
    address: null,
    key: 0,
  });

  const [mutationKey, setMutationKey] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      try {
        const [profileResponse, addressResponse] = await Promise.all([
          fetchCustomerProfile({
            signal: controller.signal,
          }),

          fetchCustomerAddresses({
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setAccountState({
          status: "ready",

          profile: profileResponse.profile ?? null,

          addresses: addressResponse.addresses ?? [],

          error: null,
        });
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          navigate("/login", {
            replace: true,

            state: {
              from: `${location.pathname}${location.search}`,
            },
          });

          return;
        }

        setAccountState({
          status: "error",
          profile: null,
          addresses: [],
          error,
        });
      }
    }

    void loadAccount();

    return () => {
      controller.abort();
    };
  }, [location.pathname, location.search, navigate]);

  function openCreateDialog() {
    setDialog((currentDialog) => ({
      open: true,

      address: null,

      key: currentDialog.key + 1,
    }));
  }

  function openEditDialog(address) {
    setDialog((currentDialog) => ({
      open: true,

      address,

      key: currentDialog.key + 1,
    }));
  }

  function closeDialog() {
    if (mutationKey) {
      return;
    }

    setDialog((currentDialog) => ({
      ...currentDialog,

      open: false,

      address: null,
    }));
  }

  function handleProfileUpdated(updatedProfile) {
    setAccountState((currentState) => ({
      ...currentState,

      profile: updatedProfile,
    }));
  }

  async function handleDialogSubmit(payload) {
    const isEditing = Boolean(dialog.address);

    setMutationKey(isEditing ? `edit:${dialog.address.id}` : "create");

    try {
      const response = isEditing
        ? await updateCustomerAddress(dialog.address.id, payload)
        : await createCustomerAddress(payload);

      setAccountState((currentState) => ({
        ...currentState,

        status: "ready",

        addresses: response.addresses ?? [],

        error: null,
      }));

      setDialog((currentDialog) => ({
        ...currentDialog,

        open: false,

        address: null,
      }));

      toast.success(
        response.message ??
          (isEditing ? "Address updated." : "Address created."),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save address."));
    } finally {
      setMutationKey(null);
    }
  }

  async function handleSetDefault(address) {
    setMutationKey(`default:${address.id}`);

    try {
      const response = await setDefaultCustomerAddress(address.id);

      setAccountState((currentState) => ({
        ...currentState,

        status: "ready",

        addresses: response.addresses ?? [],

        error: null,
      }));

      toast.success(response.message ?? "Default address updated.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update default address."),
      );
    } finally {
      setMutationKey(null);
    }
  }

  async function handleDelete(address) {
    const confirmed = window.confirm(`Delete the "${address.label}" address?`);

    if (!confirmed) {
      return;
    }

    setMutationKey(`delete:${address.id}`);

    try {
      const response = await deleteCustomerAddress(address.id);

      setAccountState((currentState) => ({
        ...currentState,

        status: "ready",

        addresses: response.addresses ?? [],

        error: null,
      }));

      toast.success(response.message ?? "Address deleted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete address."));
    } finally {
      setMutationKey(null);
    }
  }

  async function handleRetry() {
    setAccountState((currentState) => ({
      ...currentState,

      status: "loading",

      error: null,
    }));

    try {
      const [profileResponse, addressResponse] = await Promise.all([
        fetchCustomerProfile(),

        fetchCustomerAddresses(),
      ]);

      setAccountState({
        status: "ready",

        profile: profileResponse.profile ?? null,

        addresses: addressResponse.addresses ?? [],

        error: null,
      });
    } catch (error) {
      if (isAuthenticationError(error)) {
        navigate("/login", {
          replace: true,

          state: {
            from: `${location.pathname}${location.search}`,
          },
        });

        return;
      }

      setAccountState((currentState) => ({
        ...currentState,

        status: "error",

        error,
      }));
    }
  }

  const displayedProfile = accountState.profile ?? user;

  return (
    <main className="min-h-screen bg-brand-ivory">
      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          pb-16
          pt-7

          sm:px-6
          sm:pt-10

          lg:px-8
          lg:pb-24
          lg:pt-14
        "
      >
        {/* PAGE INTRO */}
        <header className="max-w-2xl">
          <p
            className="
              text-[0.65rem]
              font-bold
              uppercase
              tracking-[0.22em]
              text-brand-bronze
            "
          >
            Your Butterfly Dream
          </p>

          <h1
            className="
              mt-3
              font-display
              text-[2.65rem]
              font-medium
              leading-[0.95]
              tracking-[-0.045em]
              text-brand-espresso

              sm:text-5xl

              lg:text-6xl
            "
          >
            My account
          </h1>

          <p
            className="
              mt-4
              max-w-xl
              text-sm
              leading-6
              text-brand-muted

              sm:text-base
              sm:leading-7
            "
          >
            Keep your details, delivery addresses, and account preferences close
            at hand.
          </p>
        </header>

        {/* PROFILE INTRO CARD */}
        <section
          className="
            relative
            mt-7
            overflow-hidden
            rounded-[1.75rem]
            bg-brand-espresso
            px-5
            py-6
            text-brand-cream

            sm:px-7
            sm:py-8

            lg:mt-10
            lg:px-9
          "
        >
          {/* Decorative details */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-16
              -top-20
              h-52
              w-52
              rounded-full
              border
              border-brand-champagne/20
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-5
              top-3
              h-28
              w-28
              rounded-full
              border
              border-brand-champagne/10
            "
          />

          <div
            className="
              relative
              z-10
              flex
              items-center
              gap-4

              sm:gap-5
            "
          >
            <span
              className="
                inline-flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-brand-champagne/30
                bg-brand-surface/10
                text-brand-champagne

                sm:h-16
                sm:w-16
              "
            >
              <PersonOutlineRoundedIcon />
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-[0.62rem]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-brand-champagne
                "
              >
                Welcome back
              </p>

              <h2
                className="
                  mt-1
                  truncate
                  font-display
                  text-2xl
                  font-medium
                  tracking-[-0.025em]

                  sm:text-3xl
                "
              >
                {displayedProfile?.fullName ?? "Customer"}
              </h2>

              {displayedProfile?.email && (
                <p
                  className="
                    mt-1
                    truncate
                    text-xs
                    text-brand-cream/70

                    sm:text-sm
                  "
                >
                  {displayedProfile.email}
                </p>
              )}

              {displayedProfile?.phone && (
                <p
                  className="
                    mt-1
                    text-xs
                    text-brand-cream/50
                  "
                >
                  {displayedProfile.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* LOADING */}
        {accountState.status === "loading" && (
          <div className="mt-8 space-y-5">
            <div
              className="
                h-72
                animate-pulse
                rounded-[1.75rem]
                bg-brand-cream
              "
            />

            <div
              className="
                h-96
                animate-pulse
                rounded-[1.75rem]
                bg-brand-cream
              "
            />
          </div>
        )}

        {/* ERROR */}
        {accountState.status === "error" && (
          <div
            className="
              mt-8
              rounded-[1.75rem]
              border
              border-brand-error/20
              bg-brand-surface
              px-6
              py-10
              text-center
            "
          >
            <span
              className="
                mx-auto
                inline-flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-brand-error/10
                text-brand-error
              "
            >
              <ErrorOutlineRoundedIcon
                sx={{
                  fontSize: 30,
                }}
              />
            </span>

            <h2
              className="
                mt-5
                font-display
                text-2xl
                font-medium
                text-brand-espresso
              "
            >
              Your account could not be loaded
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-lg
                text-sm
                leading-6
                text-brand-muted
              "
            >
              {getApiErrorMessage(
                accountState.error,
                "Unable to load your account information.",
              )}
            </p>

            <button
              type="button"
              onClick={() => void handleRetry()}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-brand-espresso
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-brand-emerald
              "
            >
              <RefreshRoundedIcon fontSize="small" />
              Try again
            </button>
          </div>
        )}

        {/* READY */}
        {accountState.status === "ready" && (
          <>
            {accountState.profile && (
              <section className="mt-10">
                <div className="mb-5">
                  <p
                    className="
                      text-[0.65rem]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-brand-bronze
                    "
                  >
                    Personal details
                  </p>

                  <h2
                    className="
                      mt-2
                      font-display
                      text-3xl
                      font-medium
                      tracking-[-0.035em]
                      text-brand-espresso

                      sm:text-4xl
                    "
                  >
                    Your profile
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      leading-6
                      text-brand-muted
                    "
                  >
                    Keep your personal information and password up to date.
                  </p>
                </div>

                <div
                  className="
                    grid
                    gap-5

                    xl:grid-cols-2
                  "
                >
                  <CustomerProfileEditor
                    key={accountState.profile.updatedAt}
                    profile={accountState.profile}
                    onUpdated={handleProfileUpdated}
                  />

                  <CustomerPasswordForm />
                </div>
              </section>
            )}

            {/* ADDRESSES */}
            <section className="mt-14">
              <div
                className="
                  flex
                  flex-col
                  gap-5

                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        inline-flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-brand-pale-champagne
                        text-brand-bronze
                      "
                    >
                      <LocationOnOutlinedIcon fontSize="small" />
                    </span>

                    <p
                      className="
                        text-[0.65rem]
                        font-bold
                        uppercase
                        tracking-[0.2em]
                        text-brand-bronze
                      "
                    >
                      Delivery
                    </p>
                  </div>

                  <h2
                    className="
                      mt-3
                      font-display
                      text-3xl
                      font-medium
                      tracking-[-0.035em]
                      text-brand-espresso

                      sm:text-4xl
                    "
                  >
                    Saved addresses
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      leading-6
                      text-brand-muted
                    "
                  >
                    Save up to 10 delivery addresses for a faster checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateDialog}
                  disabled={
                    Boolean(mutationKey) || accountState.addresses.length >= 10
                  }
                  className="
                    inline-flex
                    w-fit
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-brand-espresso
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-brand-emerald
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <AddRoundedIcon fontSize="small" />
                  Add address
                </button>
              </div>

              {accountState.addresses.length === 0 && (
                <div
                  className="
                    mt-6
                    overflow-hidden
                    rounded-[1.75rem]
                    border
                    border-dashed
                    border-brand-border
                    bg-brand-cream
                    px-6
                    py-12
                    text-center

                    sm:py-16
                  "
                >
                  <span
                    className="
                      mx-auto
                      inline-flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-brand-surface
                      text-brand-bronze
                      shadow-sm
                    "
                  >
                    <LocationOnOutlinedIcon
                      sx={{
                        fontSize: 28,
                      }}
                    />
                  </span>

                  <h3
                    className="
                      mt-5
                      font-display
                      text-2xl
                      font-medium
                      text-brand-espresso
                    "
                  >
                    No saved addresses
                  </h3>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-md
                      text-sm
                      leading-6
                      text-brand-muted
                    "
                  >
                    Add an address now and it will be ready whenever you check
                    out.
                  </p>

                  <button
                    type="button"
                    onClick={openCreateDialog}
                    disabled={Boolean(mutationKey)}
                    className="
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-brand-espresso
                      bg-transparent
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-brand-espresso
                      transition
                      hover:bg-brand-espresso
                      hover:text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <AddRoundedIcon fontSize="small" />
                    Add your first address
                  </button>
                </div>
              )}

              {accountState.addresses.length > 0 && (
                <div
                  className="
                    mt-6
                    grid
                    gap-4

                    md:grid-cols-2

                    xl:grid-cols-3
                  "
                >
                  {accountState.addresses.map((address) => (
                    <CustomerAddressCard
                      key={address.id}
                      address={address}
                      mutationKey={mutationKey}
                      onEdit={openEditDialog}
                      onSetDefault={(selectedAddress) =>
                        void handleSetDefault(selectedAddress)
                      }
                      onDelete={(selectedAddress) =>
                        void handleDelete(selectedAddress)
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {dialog.open && (
          <AddressEditorDialog
            key={dialog.key}
            open={dialog.open}
            address={dialog.address}
            isSubmitting={
              mutationKey === "create" ||
              mutationKey === `edit:${dialog.address?.id}`
            }
            onClose={closeDialog}
            onSubmit={handleDialogSubmit}
          />
        )}
      </section>
    </main>
  );
}

export default Account;
