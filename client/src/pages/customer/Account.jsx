import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// React Toastify
import { toast } from "react-toastify";

// MUI
import { Dialog, DialogContent } from "@mui/material";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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

/* =========================================================
   HELPERS
========================================================= */

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function getInitials(profile) {
  const fullName = profile?.fullName?.trim();

  if (!fullName) {
    return "BD";
  }

  const names = fullName.split(/\s+/).filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

/* =========================================================
   ACCOUNT
========================================================= */

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

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const [mutationKey, setMutationKey] = useState(null);

  /* =======================================================
     LOAD ACCOUNT
  ======================================================= */

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

  /* =======================================================
     ADDRESS DIALOG
  ======================================================= */

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

  /* =======================================================
     PASSWORD DIALOG
  ======================================================= */

  function openPasswordDialog() {
    setIsPasswordDialogOpen(true);
  }

  function closePasswordDialog() {
    setIsPasswordDialogOpen(false);
  }

  /* =======================================================
     PROFILE
  ======================================================= */

  function handleProfileUpdated(updatedProfile) {
    setAccountState((currentState) => ({
      ...currentState,

      profile: updatedProfile,
    }));
  }

  /* =======================================================
     SAVE ADDRESS
  ======================================================= */

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

  /* =======================================================
     DEFAULT ADDRESS
  ======================================================= */

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

  /* =======================================================
     DELETE ADDRESS
  ======================================================= */

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

  /* =======================================================
     RETRY
  ======================================================= */

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

  const customerInitials = getInitials(displayedProfile);

  return (
    <main
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
      "
    >
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
        {/* ==================================================
            PAGE INTRO
        ================================================== */}

        <header className="max-w-2xl">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase

              tracking-[0.2em]

              text-brand-accent-text
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

              text-brand-text

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

              text-brand-text-muted

              sm:text-base
              sm:leading-7
            "
          >
            Keep your details, delivery addresses, and account preferences close
            at hand.
          </p>
        </header>

        {/* ==================================================
            PROFILE INTRO
        ================================================== */}

        <section
          className="
            relative

            mt-7

            overflow-hidden

            rounded-[1.75rem]

            bg-brand-dark-surface

            px-5
            py-6

            text-brand-surface

            sm:px-7
            sm:py-8

            lg:mt-10
            lg:px-9
          "
        >
          {/* DECORATION */}

          <span
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
              border-brand-accent-fill/20
            "
          />

          <span
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
              border-brand-accent-fill/10
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
            {/* AVATAR */}

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
                border-brand-accent-fill/30

                bg-brand-surface/10

                text-sm
                font-bold

                tracking-[0.06em]

                text-brand-accent-fill

                sm:h-16
                sm:w-16
              "
            >
              {customerInitials}
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-[0.58rem]
                  font-bold
                  uppercase

                  tracking-[0.2em]

                  text-brand-accent-fill
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

                    text-brand-surface/70

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

                    text-brand-surface/50
                  "
                >
                  {displayedProfile.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            LOADING
        ================================================== */}

        {accountState.status === "loading" && (
          <div className="mt-8 space-y-5">
            <div
              className="
                h-72

                animate-pulse

                rounded-[1.75rem]

                bg-brand-surface-soft
              "
            />

            <div
              className="
                h-96

                animate-pulse

                rounded-[1.75rem]

                bg-brand-surface-soft
              "
            />
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

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

                text-brand-text
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

                text-brand-text-muted
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
                min-h-11

                items-center
                justify-center

                gap-2

                rounded-full

                bg-brand-primary

                px-5

                text-sm
                font-semibold

                text-brand-surface

                transition-all

                hover:bg-brand-primary-hover

                active:scale-[0.98]
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
        )}

        {/* ==================================================
            READY
        ================================================== */}

        {accountState.status === "ready" && (
          <>
            {/* ==============================================
                PROFILE
            ============================================== */}

            {accountState.profile && (
              <section className="mt-10">
                <div
                  className="
                    mb-5

                    flex
                    flex-col

                    gap-4

                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[0.62rem]
                        font-bold
                        uppercase

                        tracking-[0.2em]

                        text-brand-accent-text
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

                        text-brand-text

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

                        text-brand-text-muted
                      "
                    >
                      Keep your personal information up to date.
                    </p>
                  </div>

                  {/* CHANGE PASSWORD */}

                  <button
                    type="button"
                    onClick={openPasswordDialog}
                    className="
                      inline-flex
                      min-h-11
                      w-fit

                      items-center
                      justify-center

                      gap-2

                      rounded-full

                      border
                      border-brand-border

                      bg-brand-surface

                      px-5

                      text-sm
                      font-semibold

                      text-brand-text

                      transition-all
                      duration-200

                      hover:border-brand-accent-fill/50
                      hover:bg-brand-surface-soft

                      active:scale-[0.98]

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-brand-accent-fill/35
                    "
                  >
                    <LockOutlinedIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                    Change password
                  </button>
                </div>

                <CustomerProfileEditor
                  key={accountState.profile.updatedAt}
                  profile={accountState.profile}
                  onUpdated={handleProfileUpdated}
                />
              </section>
            )}

            {/* ==============================================
                ADDRESSES
            ============================================== */}

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
                  <div
                    className="
                      flex
                      items-center

                      gap-2
                    "
                  >
                    <span
                      className="
                        inline-flex
                        h-9
                        w-9

                        items-center
                        justify-center

                        rounded-full

                        bg-brand-accent-soft

                        text-brand-accent-text
                      "
                    >
                      <LocationOnOutlinedIcon
                        sx={{
                          fontSize: 18,
                        }}
                      />
                    </span>

                    <p
                      className="
                        text-[0.62rem]
                        font-bold
                        uppercase

                        tracking-[0.2em]

                        text-brand-accent-text
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

                      text-brand-text

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

                      text-brand-text-muted
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
                    min-h-11
                    w-fit

                    items-center
                    justify-center

                    gap-2

                    rounded-full

                    bg-brand-primary

                    px-5

                    text-sm
                    font-semibold

                    text-brand-surface

                    transition-all
                    duration-200

                    hover:bg-brand-primary-hover

                    active:scale-[0.98]

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <AddRoundedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                  Add address
                </button>
              </div>

              {/* ============================================
                  EMPTY ADDRESSES
              ============================================ */}

              {accountState.addresses.length === 0 && (
                <div
                  className="
                    mt-6

                    overflow-hidden

                    rounded-[1.75rem]

                    border
                    border-dashed
                    border-brand-border

                    bg-brand-surface-soft

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

                      text-brand-accent-text

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

                      text-brand-text
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

                      text-brand-text-muted
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
                      min-h-11

                      items-center
                      justify-center

                      gap-2

                      rounded-full

                      border
                      border-brand-primary

                      bg-transparent

                      px-5

                      text-sm
                      font-semibold

                      text-brand-primary

                      transition-all

                      hover:bg-brand-primary
                      hover:text-brand-surface

                      active:scale-[0.98]

                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <AddRoundedIcon
                      sx={{
                        fontSize: 19,
                      }}
                    />
                    Add your first address
                  </button>
                </div>
              )}

              {/* ============================================
                  ADDRESS GRID
              ============================================ */}

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

        {/* ==================================================
            CHANGE PASSWORD DIALOG
        ================================================== */}

        <Dialog
          open={isPasswordDialogOpen}
          onClose={closePasswordDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: "1.5rem",

              overflow: "hidden",

              backgroundColor: "rgb(var(--theme-surface))",

              color: "rgb(var(--theme-text))",

              border: "1px solid rgb(var(--theme-border))",

              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.16)",
            },
          }}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.34)",

                backdropFilter: "blur(3px)",
              },
            },
          }}
        >
          {/* DIALOG HEADER */}

          <div
            className="
              flex

              items-start
              justify-between

              gap-4

              border-b
              border-brand-border

              px-5
              py-5

              sm:px-6
            "
          >
            <div
              className="
                flex
                min-w-0

                items-start

                gap-3.5
              "
            >
              <span
                className="
                  inline-flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-accent-soft

                  text-brand-accent-text
                "
              >
                <LockOutlinedIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </span>

              <div className="min-w-0">
                <p
                  className="
                    text-[0.57rem]
                    font-bold
                    uppercase

                    tracking-[0.17em]

                    text-brand-accent-text
                  "
                >
                  Account security
                </p>

                <h2
                  className="
                    mt-1

                    font-display

                    text-[1.45rem]
                    font-medium

                    tracking-[-0.035em]

                    text-brand-text
                  "
                >
                  Change password
                </h2>

                <p
                  className="
                    mt-1

                    max-w-sm

                    text-xs
                    leading-5

                    text-brand-text-muted
                  "
                >
                  Update the password you use to access your Butterfly Dream
                  account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closePasswordDialog}
              aria-label="Close change password"
              className="
                inline-flex
                h-10
                w-10
                shrink-0

                items-center
                justify-center

                rounded-full

                bg-transparent

                text-brand-text-muted

                transition-all
                duration-200

                hover:bg-brand-primary/5
                hover:text-brand-text

                active:scale-90

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/35
              "
            >
              <CloseRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </button>
          </div>

          {/* PASSWORD DETAILS */}

          <DialogContent
            sx={{
              padding: 0,
            }}
          >
            <div
              className="
                px-5
                py-5

                sm:px-6
                sm:py-6
              "
            >
              <CustomerPasswordForm />
            </div>
          </DialogContent>
        </Dialog>

        {/* ==================================================
            ADDRESS DIALOG
        ================================================== */}

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
