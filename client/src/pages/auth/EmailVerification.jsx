import { useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// MUI Icons
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import useAppContext from "../../context/app/useAppContext.js";

import {
  resendCustomerEmailVerification,
  verifyCustomerEmail,
} from "../../services/authApi.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   HELPERS
========================================================= */

function formatExpiry(expiresAt) {
  if (typeof expiresAt !== "string" || !expiresAt) {
    return null;
  }

  const expiryDate = parseISO(expiresAt);

  if (!isValid(expiryDate)) {
    return null;
  }

  return format(expiryDate, "h:mm a");
}

/* =========================================================
   EMAIL VERIFICATION
========================================================= */

function EmailVerification() {
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const [newExpiry, setNewExpiry] = useState(null);

  const { user, isAuthenticated, authLoading, setAuthenticatedUser, logout } =
    useAppContext();

  const location = useLocation();

  const navigate = useNavigate();

  const expiryText = useMemo(
    () => formatExpiry(newExpiry ?? location.state?.expiresAt),
    [newExpiry, location.state],
  );

  /* =======================================================
     SESSION LOADING
  ======================================================= */

  if (authLoading) {
    return (
      <div
        role="status"
        className="
          flex
          min-h-[240px]

          items-center
          justify-center

          rounded-[1.5rem]

          border
          border-brand-border

          bg-brand-surface
        "
      >
        <div className="text-center">
          <span
            className="
              mx-auto

              inline-flex
              h-12
              w-12

              items-center
              justify-center

              rounded-full

              bg-brand-accent-soft

              text-brand-accent-text
            "
          >
            <MarkEmailReadOutlinedIcon
              sx={{
                fontSize: 22,
              }}
            />
          </span>

          <p
            className="
              mt-4

              text-sm
              font-medium

              text-brand-text-muted
            "
          >
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     REDIRECTS
  ======================================================= */

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.emailVerifiedAt) {
    return <Navigate to="/" replace />;
  }

  /* =======================================================
     VERIFY CODE
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the six-digit verification code.");

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyCustomerEmail(otp);

      if (response.user) {
        setAuthenticatedUser(response.user);
      }

      toast.success(response.message ?? "Email verified successfully.");

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to verify your email."));
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =======================================================
     RESEND
  ======================================================= */

  async function handleResend() {
    setIsResending(true);

    try {
      const response = await resendCustomerEmailVerification();

      if (response.user?.emailVerifiedAt) {
        setAuthenticatedUser(response.user);

        toast.success("Your email is already verified.");

        navigate("/", {
          replace: true,
        });

        return;
      }

      setNewExpiry(response.expiresAt ?? null);

      toast.success("A new verification code was sent.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to resend the code."));
    } finally {
      setIsResending(false);
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  }

  return (
    <section
      className="
        relative

        overflow-hidden

        rounded-[1.75rem]

        border
        border-brand-border

        bg-brand-surface

        px-5
        py-7

        shadow-[0_18px_50px_rgba(0,0,0,0.05)]

        sm:px-8
        sm:py-9
      "
    >
      {/* ==================================================
          DECORATIVE ACCENT
      ================================================== */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          -right-16
          -top-16

          h-40
          w-40

          rounded-full

          border
          border-brand-accent-fill/20
        "
      />

      <div className="relative z-10">
        {/* ==================================================
            INTRO
        ================================================== */}

        <span
          className="
            inline-flex
            h-12
            w-12

            items-center
            justify-center

            rounded-full

            bg-brand-accent-soft

            text-brand-accent-text
          "
        >
          <MarkEmailReadOutlinedIcon
            sx={{
              fontSize: 23,
            }}
          />
        </span>

        <p
          className="
            mt-5

            text-[0.6rem]
            font-bold
            uppercase

            tracking-[0.2em]

            text-brand-accent-text
          "
        >
          Email verification
        </p>

        <h1
          className="
            mt-2

            font-display

            text-[2rem]
            font-medium

            leading-tight

            tracking-[-0.04em]

            text-brand-text

            sm:text-[2.35rem]
          "
        >
          Check your email
        </h1>

        <p
          className="
            mt-3

            max-w-md

            text-sm
            leading-6

            text-brand-text-muted
          "
        >
          Enter the six-digit verification code sent to{" "}
          <strong className="font-semibold text-brand-text">
            {user.email}
          </strong>
          .
        </p>

        {/* EXPIRY */}

        {expiryText && (
          <div
            className="
              mt-4

              inline-flex

              items-center

              gap-2

              rounded-full

              bg-brand-surface-soft

              px-3
              py-2

              text-xs
              font-medium

              text-brand-text-muted
            "
          >
            <AccessTimeRoundedIcon
              sx={{
                fontSize: 16,
              }}
            />

            <span>
              Code expires at{" "}
              <strong className="font-semibold text-brand-text">
                {expiryText}
              </strong>
            </span>
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form className="mt-7" onSubmit={handleSubmit}>
          <label
            htmlFor="customer-verification-otp"
            className="
              mb-2

              block

              text-[0.68rem]
              font-semibold
              uppercase

              tracking-[0.12em]

              text-brand-text
            "
          >
            Verification code
          </label>

          <input
            id="customer-verification-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            disabled={isSubmitting}
            autoFocus
            placeholder="000000"
            className="
              min-h-[4rem]
              w-full

              rounded-[1.1rem]

              border
              border-brand-border

              bg-brand-surface-soft

              px-4
              py-4

              text-center

              font-body
              text-[1.6rem]
              font-bold

              tracking-[0.38em]

              text-brand-text

              outline-none

              transition-all
              duration-200

              placeholder:text-brand-text-muted/25

              hover:border-brand-text/20

              focus:border-brand-accent-fill
              focus:bg-brand-surface
              focus:ring-2
              focus:ring-brand-accent-fill/15

              disabled:cursor-not-allowed
              disabled:opacity-55

              sm:text-[1.8rem]
            "
          />

          {/* PROGRESS */}

          <div
            className="
              mt-2.5

              flex
              items-center
              justify-between

              gap-3

              text-[0.62rem]

              text-brand-text-muted
            "
          >
            <span>{otp.length} of 6 digits entered</span>

            {otp.length === 6 && (
              <span
                className="
                  font-semibold

                  text-brand-success
                "
              >
                Ready to verify
              </span>
            )}
          </div>

          {/* VERIFY */}

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="
              mt-5

              inline-flex
              min-h-12
              w-full

              items-center
              justify-center

              rounded-full

              bg-brand-primary

              px-6

              text-sm
              font-semibold

              text-brand-surface

              transition-all
              duration-200

              hover:bg-brand-primary-hover

              active:scale-[0.985]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-accent-fill/40
              focus-visible:ring-offset-2
              focus-visible:ring-offset-brand-surface

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        {/* ==================================================
            SECONDARY ACTIONS
        ================================================== */}

        <div
          className="
            mt-6

            border-t
            border-brand-border

            pt-5
          "
        >
          <div
            className="
              flex
              flex-col

              items-center

              gap-2
            "
          >
            {/* RESEND */}

            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting || isResending}
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                gap-2

                rounded-full

                px-4

                text-sm
                font-semibold

                text-brand-accent-text

                transition-all
                duration-200

                hover:bg-brand-accent-soft

                active:scale-[0.97]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/35

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshRoundedIcon
                className={isResending ? "animate-spin" : ""}
                sx={{
                  fontSize: 18,
                }}
              />

              {isResending ? "Sending..." : "Send a new code"}
            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSubmitting || isResending}
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                gap-2

                rounded-full

                px-4

                text-xs
                font-medium

                text-brand-text-muted

                transition-all

                hover:bg-brand-surface-soft
                hover:text-brand-text

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/30

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <LogoutRoundedIcon
                sx={{
                  fontSize: 16,
                }}
              />
              Sign out and use another account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmailVerification;
