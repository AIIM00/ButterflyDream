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
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Customer account
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          My account
        </h1>
      </header>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
            <PersonOutlineRoundedIcon />
          </span>

          <div>
            <h2 className="text-xl font-bold text-gray-950">
              {displayedProfile?.fullName ?? "Customer"}
            </h2>

            <p className="mt-1 text-gray-600">{displayedProfile?.email}</p>

            {displayedProfile?.phone && (
              <p className="mt-1 text-sm text-gray-500">
                {displayedProfile.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {accountState.status === "loading" && (
        <div className="mt-8 space-y-6">
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />

          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      )}

      {accountState.status === "error" && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{
              fontSize: 48,
            }}
          />

          <h2 className="mt-3 text-xl font-bold text-red-900">
            Your account could not be loaded
          </h2>

          <p className="mt-2 text-red-700">
            {getApiErrorMessage(
              accountState.error,
              "Unable to load your account information.",
            )}
          </p>

          <button
            type="button"
            onClick={() => void handleRetry()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white"
          >
            <RefreshRoundedIcon />
            Try again
          </button>
        </div>
      )}

      {accountState.status === "ready" && (
        <>
          {accountState.profile && (
            <div className="mt-8 space-y-8">
              <CustomerProfileEditor
                key={accountState.profile.updatedAt}
                profile={accountState.profile}
                onUpdated={handleProfileUpdated}
              />

              <CustomerPasswordForm />
            </div>
          )}

          <section className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <LocationOnOutlinedIcon className="text-gray-600" />

                  <h2 className="text-2xl font-bold text-gray-950">
                    Delivery addresses
                  </h2>
                </div>

                <p className="mt-2 text-gray-600">
                  Save up to 10 delivery addresses.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateDialog}
                disabled={
                  Boolean(mutationKey) || accountState.addresses.length >= 10
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <AddRoundedIcon />
                Add address
              </button>
            </div>

            {accountState.addresses.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                <LocationOnOutlinedIcon
                  className="text-gray-400"
                  sx={{
                    fontSize: 48,
                  }}
                />

                <h3 className="mt-4 text-xl font-bold text-gray-950">
                  No saved addresses
                </h3>

                <p className="mt-2 text-gray-600">
                  Add an address to use during checkout.
                </p>

                <button
                  type="button"
                  onClick={openCreateDialog}
                  disabled={Boolean(mutationKey)}
                  className="mt-6 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Add your first address
                </button>
              </div>
            )}

            {accountState.addresses.length > 0 && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
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
  );
}

export default Account;
