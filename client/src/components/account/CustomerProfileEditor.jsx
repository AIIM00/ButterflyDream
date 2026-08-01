import { useState } from "react";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { toast } from "react-toastify";
import { updateCustomerProfile } from "../../services/customerProfileApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function CustomerProfileEditor({ profile, onUpdated }) {
  const [form, setForm] = useState({
    fullName: profile.fullName ?? "",

    phone: profile.phone ?? "",
  });

  const [isSaving, setIsSaving] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);

    try {
      const response = await updateCustomerProfile({
        fullName: form.fullName.trim(),

        phone: form.phone.trim() || null,
      });

      onUpdated(response.profile);

      setForm({
        fullName: response.profile.fullName ?? "",

        phone: response.profile.phone ?? "",
      });

      toast.success(response.message ?? "Profile updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-gray-950">Personal information</h2>

      <p className="mt-2 text-sm text-gray-500">
        Update the name and phone number associated with your account.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label>
          <span className="text-sm font-semibold text-gray-700">Full name</span>

          <input
            type="text"
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            maxLength={100}
            disabled={isSaving}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-gray-700">
            Phone number
          </span>

          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            maxLength={30}
            disabled={isSaving}
            placeholder="+961..."
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950 disabled:bg-gray-100"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-gray-700">
          Email address
        </span>

        <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <input
            type="email"
            value={profile.email}
            readOnly
            className="min-w-0 flex-1 bg-transparent text-gray-600 outline-none"
          />

          {profile.emailVerified && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
              <VerifiedRoundedIcon fontSize="small" />
              Verified
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Email changes require a separate verification process.
        </p>
      </label>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          <SaveOutlinedIcon fontSize="small" />

          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export default CustomerProfileEditor;
