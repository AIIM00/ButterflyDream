import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordField from "./PasswordField.jsx";
import useAppContext from "../../context/app/useAppContext.js";
import { confirmPasswordReset } from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import validatePassword from "../../utils/validatePassword.js";

function ResetPassword() {
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationMessage, setValidationMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, authLoading, clearAuthenticatedUser } =
    useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const returnTo =
    location.state?.returnTo === "/admin/login" ? "/admin/login" : "/login";

  const accountEmail = location.state?.email;

  if (authLoading) {
    return (
      <div
        role="status"
        className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm"
      >
        Checking your session...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/"} replace />
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
  }

  function validateForm() {
    if (!/^\d{6}$/.test(formData.otp)) {
      return "Enter the six-digit password-reset code.";
    }

    const passwordError = validatePassword(formData.newPassword);

    if (passwordError) {
      return passwordError;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return "The passwords do not match.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formValidationError = validateForm();

    if (formValidationError) {
      setValidationMessage(formValidationError);

      return;
    }

    setValidationMessage("");
    setIsSubmitting(true);

    try {
      const response = await confirmPasswordReset({
        otp: formData.otp,

        newPassword: formData.newPassword,
      });

      clearAuthenticatedUser();

      toast.success(response.message);

      navigate(returnTo, {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to reset the password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Password recovery
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        Set a new password
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Enter the six-digit code sent
        {accountEmail ? ` to ${accountEmail}` : " to your email"}, then create a
        new password.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {validationMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {validationMessage}
          </div>
        )}

        <div>
          <label
            htmlFor="password-reset-otp"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Password-reset code
          </label>

          <input
            id="password-reset-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={formData.otp}
            onChange={handleChange}
            disabled={isSubmitting}
            autoFocus
            placeholder="000000"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <PasswordField
          id="reset-new-password"
          name="newPassword"
          label="New password"
          value={formData.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Create a strong password"
          disabled={isSubmitting}
        />

        <PasswordField
          id="reset-confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Enter the new password again"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating password..." : "Reset password"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <Link
          to="/forgot-password"
          state={{
            returnTo,
          }}
          className="block font-semibold text-gray-900 underline underline-offset-4"
        >
          Request a new code
        </Link>

        <Link
          to={returnTo}
          className="block font-medium text-gray-600 hover:text-gray-900"
        >
          Return to login
        </Link>
      </div>
    </section>
  );
}

export default ResetPassword;
