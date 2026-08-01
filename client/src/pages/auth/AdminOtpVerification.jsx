import { useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAppContext from "../../context/app/useAppContext.js";
import {
  resendAdminLoginOtp,
  verifyAdminLoginOtp,
} from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function getFormattedExpiry(expiresAt) {
  if (typeof expiresAt !== "string" || !expiresAt) {
    return null;
  }

  const expiryDate = parseISO(expiresAt);

  if (!isValid(expiryDate)) {
    return null;
  }

  return format(expiryDate, "h:mm a");
}

function AdminOtpVerification() {
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const [newExpiry, setNewExpiry] = useState(null);

  const { user, isAuthenticated, authLoading, setAuthenticatedUser, logout } =
    useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const maskedEmail = location.state?.email ?? "your admin email";

  const displayedExpiry = useMemo(
    () => getFormattedExpiry(newExpiry ?? location.state?.expiresAt),
    [newExpiry, location.state],
  );

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

    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.error("Enter the six-digit verification code.");

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyAdminLoginOtp(normalizedOtp);

      if (response.user?.role !== "ADMIN") {
        throw new Error(
          "The server did not return a valid administrator session.",
        );
      }

      setAuthenticatedUser(response.user);

      toast.success("Admin login verified successfully.");

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to verify the code."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);

    try {
      const response = await resendAdminLoginOtp();

      setNewExpiry(response.expiresAt ?? null);

      toast.success("A new verification code was sent.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to resend the code."));
    } finally {
      setIsResending(false);
    }
  }

  async function handleStartOver() {
    try {
      await logout();
    } catch {
      // Local authentication state is
      // cleared by the provider.
    }

    navigate("/admin/login", {
      replace: true,
    });
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Two-step verification
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        Check your email
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Enter the six-digit code sent to{" "}
        <strong className="text-gray-900">{maskedEmail}</strong>.
      </p>

      {displayedExpiry && (
        <p className="mt-2 text-sm text-gray-500">
          The current code expires at {displayedExpiry}.
        </p>
      )}

      <form className="mt-8" onSubmit={handleSubmit}>
        <label
          htmlFor="admin-otp"
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          Verification code
        </label>

        <input
          id="admin-otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => {
            const numericValue = event.target.value.replace(/\D/g, "");

            setOtp(numericValue.slice(0, 6));
          }}
          disabled={isSubmitting}
          autoFocus
          placeholder="000000"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={isSubmitting || otp.length !== 6}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Verifying..." : "Verify and sign in"}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || isSubmitting}
          className="font-semibold text-gray-900 underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Send a new code"}
        </button>

        <button
          type="button"
          onClick={handleStartOver}
          disabled={isSubmitting || isResending}
          className="block w-full font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Return to admin login
        </button>
      </div>
    </section>
  );
}

export default AdminOtpVerification;
