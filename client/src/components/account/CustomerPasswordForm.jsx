import { useState } from "react";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import { toast } from "react-toastify";
import { changeCustomerPassword } from "../../services/customerProfileApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function CustomerPasswordForm() {
  const [form, setForm] = useState(emptyForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirmation do not match.");

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await changeCustomerPassword(form);

      setForm(emptyForm);

      toast.success(response.message ?? "Password changed successfully.");

      window.setTimeout(() => {
        window.location.assign("/login");
      }, 700);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to change your password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
          <LockResetRoundedIcon />
        </span>

        <div>
          <h2 className="text-xl font-bold text-gray-950">Change password</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Changing your password signs your account out on every device.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Current password
          </span>

          <input
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) =>
              updateField("currentPassword", event.target.value)
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            New password
          </span>

          <input
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
            disabled={isSubmitting}
            minLength={8}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
          />

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Use at least eight characters with uppercase, lowercase, number, and
            special character.
          </p>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-700">
            Confirm new password
          </span>

          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
            disabled={isSubmitting}
            minLength={8}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !form.currentPassword ||
            !form.newPassword ||
            !form.confirmPassword
          }
          className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Changing password..." : "Change password"}
        </button>
      </div>
    </form>
  );
}

export default CustomerPasswordForm;
