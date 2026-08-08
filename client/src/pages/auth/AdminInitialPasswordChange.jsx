import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import PasswordField from "./PasswordField.jsx";

import useAppContext from "../../context/app/useAppContext.js";

import { changeAdminInitialPassword } from "../../services/authApi.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import validatePassword from "../../utils/validatePassword.js";

function AdminInitialPasswordChange() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [validationMessage, setValidationMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, authLoading, clearAuthenticatedUser } =
    useAppContext();

  const navigate = useNavigate();

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

  if (!isAuthenticated || user.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  function validateForm() {
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
      const response = await changeAdminInitialPassword({
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      /*
       * The backend clears the authentication cookie after
       * replacing the temporary password, so clear the local
       * React authentication state as well.
       */
      clearAuthenticatedUser();

      toast.success(
        response.message ||
          "Password changed successfully. Please sign in again.",
      );

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to change the administrator password.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Administrator security
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        Create your permanent password
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Your administrator account is currently using a temporary password.
        Create a new password before accessing the administration portal.
      </p>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        The new password must be different from your temporary password.
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {validationMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {validationMessage}
          </div>
        )}

        <PasswordField
          id="admin-new-password"
          name="newPassword"
          label="New password"
          value={formData.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Create a strong password"
          disabled={isSubmitting}
        />

        <PasswordField
          id="admin-confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Enter the new password again"
          disabled={isSubmitting}
        />

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-6 text-gray-600">
          <p className="font-semibold text-gray-800">Password requirements</p>

          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>At least 12 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating password..." : "Set permanent password"}
        </button>
      </form>
    </section>
  );
}

export default AdminInitialPasswordChange;
