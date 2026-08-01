import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordField from "./PasswordField.jsx";
import useAppContext from "../../context/app/useAppContext.js";
import { registerCustomer } from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import validatePassword from "../../utils/validatePassword.js";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationMessage, setValidationMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, authLoading, setAuthenticatedUser } =
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

  if (isAuthenticated) {
    const destination =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.emailVerifiedAt
          ? "/"
          : "/verify-email";

    return <Navigate to={destination} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  function validateForm() {
    const fullName = formData.fullName.trim();

    const email = formData.email.trim().toLowerCase();

    if (fullName.length < 2 || fullName.length > 120) {
      return "Full name must contain between 2 and 120 characters.";
    }

    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please provide a valid email address.";
    }

    const passwordError = validatePassword(formData.password);

    if (passwordError) {
      return passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
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
      const response = await registerCustomer({
        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        password: formData.password,
      });

      if (response.user?.role !== "CUSTOMER") {
        throw new Error("The server did not return a valid customer account.");
      }

      setAuthenticatedUser(response.user);

      if (response.verificationEmailSent) {
        toast.success(
          "Account created. Check your email for the verification code.",
        );
      } else {
        toast.warning(
          "Account created, but the verification email could not be sent. Request a new code.",
        );
      }

      navigate("/verify-email", {
        replace: true,

        state: {
          expiresAt: response.verificationCodeExpiresAt,
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create the account."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Customer account
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        Create your account
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Save products, manage your cart, and track your orders.
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
            htmlFor="register-full-name"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Full name
          </label>

          <input
            id="register-full-name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            autoFocus
            disabled={isSubmitting}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Email address
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={isSubmitting}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <PasswordField
          id="register-password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Create a strong password"
          disabled={isSubmitting}
        />

        <PasswordField
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Enter the password again"
          disabled={isSubmitting}
        />

        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
          Use at least 12 characters with uppercase, lowercase, number, and
          special-character combinations.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-gray-900 underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}

export default Register;
