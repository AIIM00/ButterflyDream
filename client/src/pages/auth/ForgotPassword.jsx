import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAppContext from "../../context/app/useAppContext.js";
import { requestPasswordReset } from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [validationMessage, setValidationMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, authLoading } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const returnTo =
    location.state?.returnTo === "/admin/login" ? "/admin/login" : "/login";

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

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setValidationMessage("Please provide a valid email address.");

      return;
    }

    setValidationMessage("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(normalizedEmail);

      toast.success(response.message);

      navigate("/reset-password", {
        replace: true,

        state: {
          email: normalizedEmail,

          returnTo,
        },
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to request a password reset."),
      );
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
        Forgot your password?
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Enter your account email. If an eligible account exists, we will send a
        password-reset code.
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
            htmlFor="forgot-password-email"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Email address
          </label>

          <input
            id="forgot-password-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{" "}
        <Link
          to={returnTo}
          className="font-semibold text-gray-900 underline underline-offset-4"
        >
          Return to login
        </Link>
      </p>
    </section>
  );
}

export default ForgotPassword;
