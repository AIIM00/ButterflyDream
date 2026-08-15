import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

// MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";

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

  /*
   * Forgot password is shared by the
   * customer and admin authentication flows.
   *
   * Keep the admin recovery experience
   * independent from the storefront theme.
   */
  const isAdminFlow = returnTo === "/admin/login";

  /* =========================================================
     SESSION
  ========================================================= */

  if (authLoading) {
    return (
      <div
        role="status"
        className={`
          flex
          min-h-[220px]

          items-center
          justify-center

          rounded-[1.5rem]

          border

          ${
            isAdminFlow
              ? `
                  border-slate-200
                  bg-white
                `
              : `
                  border-brand-border
                  bg-brand-surface
                `
          }
        `}
      >
        <div className="text-center">
          <span
            className={`
              mx-auto

              inline-flex
              h-11
              w-11

              items-center
              justify-center

              rounded-full

              ${
                isAdminFlow
                  ? `
                      bg-slate-100
                      text-slate-600
                    `
                  : `
                      bg-brand-accent-soft
                      text-brand-accent-text
                    `
              }
            `}
          >
            <LockResetRoundedIcon
              sx={{
                fontSize: 21,
              }}
            />
          </span>

          <p
            className={`
              mt-4

              text-sm
              font-medium

              ${isAdminFlow ? "text-slate-500" : "text-brand-text-muted"}
            `}
          >
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/"} replace />
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

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

  /* =========================================================
     ADMIN RECOVERY
  ========================================================= */

  if (isAdminFlow) {
    return (
      <section
        className="
          w-full

          overflow-hidden

          rounded-[1.5rem]

          border
          border-slate-200

          bg-white

          shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        "
      >
        {/* INTRO */}

        <div
          className="
            border-b
            border-slate-100

            px-6
            pb-6
            pt-7

            sm:px-8
            sm:pt-8
          "
        >
          <span
            className="
              inline-flex
              h-11
              w-11

              items-center
              justify-center

              rounded-[0.85rem]

              bg-slate-950

              text-white
            "
          >
            <LockResetRoundedIcon
              sx={{
                fontSize: 21,
              }}
            />
          </span>

          <p
            className="
              mt-5

              text-[0.6rem]
              font-bold
              uppercase

              tracking-[0.18em]

              text-slate-500
            "
          >
            Administrator recovery
          </p>

          <h1
            className="
              mt-1.5

              text-2xl
              font-semibold

              tracking-[-0.035em]

              text-slate-950

              sm:text-[1.75rem]
            "
          >
            Forgot your password?
          </h1>

          <p
            className="
              mt-3

              max-w-md

              text-sm
              leading-6

              text-slate-500
            "
          >
            Enter your administrator email. If an eligible account exists, a
            password-reset code will be sent.
          </p>
        </div>

        {/* FORM */}

        <form
          className="
            space-y-5

            px-6
            py-6

            sm:px-8
          "
          onSubmit={handleSubmit}
          noValidate
        >
          {validationMessage && (
            <div
              role="alert"
              className="
                rounded-[0.9rem]

                border
                border-red-200

                bg-red-50

                px-4
                py-3

                text-sm
                font-medium

                text-red-700
              "
            >
              {validationMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="forgot-password-email"
              className="
                mb-2

                block

                text-xs
                font-semibold

                text-slate-700
              "
            >
              Email address
            </label>

            <div className="relative">
              <span
                className="
                  pointer-events-none

                  absolute
                  left-4
                  top-1/2

                  flex
                  -translate-y-1/2

                  text-slate-400
                "
              >
                <EmailOutlinedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </span>

              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                placeholder="admin@example.com"
                className="
                  min-h-12
                  w-full

                  rounded-[0.9rem]

                  border
                  border-slate-300

                  bg-white

                  py-3
                  pl-11
                  pr-4

                  text-sm

                  text-slate-950

                  outline-none

                  transition-all

                  placeholder:text-slate-400

                  focus:border-slate-950
                  focus:ring-2
                  focus:ring-slate-950/10

                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              inline-flex
              min-h-12
              w-full

              items-center
              justify-center

              rounded-full

              bg-slate-950

              px-5

              text-sm
              font-semibold

              text-white

              transition-all

              hover:bg-slate-800

              active:scale-[0.985]

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Sending..." : "Send reset code"}
          </button>
        </form>

        {/* RETURN */}

        <div
          className="
            border-t
            border-slate-100

            bg-slate-50

            px-6
            py-4

            text-center

            sm:px-8
          "
        >
          <Link
            to={returnTo}
            className="
              inline-flex
              min-h-10

              items-center
              justify-center

              gap-1.5

              rounded-full

              px-3

              text-xs
              font-semibold

              text-slate-600

              transition-colors

              hover:text-slate-950
            "
          >
            <ArrowBackRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
            Return to admin login
          </Link>
        </div>
      </section>
    );
  }

  /* =========================================================
     CUSTOMER RECOVERY
  ========================================================= */

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
      {/* DECORATION */}

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
          <LockResetRoundedIcon
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
          Password recovery
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
          Forgot your password?
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
          Enter your account email. If an eligible account exists, we’ll send
          you a password-reset code.
        </p>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="
            mt-7
            space-y-5
          "
          onSubmit={handleSubmit}
          noValidate
        >
          {/* ERROR */}

          {validationMessage && (
            <div
              role="alert"
              className="
                rounded-[1rem]

                border
                border-brand-error/20

                bg-brand-error/5

                px-4
                py-3

                text-sm
                font-medium
                leading-5

                text-brand-error
              "
            >
              {validationMessage}
            </div>
          )}

          {/* EMAIL */}

          <div>
            <label
              htmlFor="forgot-password-email"
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
              Email address
            </label>

            <div className="relative">
              <span
                aria-hidden="true"
                className="
                  pointer-events-none

                  absolute
                  left-4
                  top-1/2

                  inline-flex

                  -translate-y-1/2

                  text-brand-text-muted
                "
              >
                <EmailOutlinedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </span>

              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                placeholder="name@example.com"
                className="
                  min-h-12
                  w-full

                  rounded-[1rem]

                  border
                  border-brand-border

                  bg-brand-surface

                  py-3
                  pl-11
                  pr-4

                  font-body
                  text-sm

                  text-brand-text

                  outline-none

                  transition-all
                  duration-200

                  placeholder:text-brand-text-muted/50

                  hover:border-brand-text/20

                  focus:border-brand-accent-fill
                  focus:ring-2
                  focus:ring-brand-accent-fill/15

                  disabled:cursor-not-allowed
                  disabled:bg-brand-surface-soft
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
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
            {isSubmitting ? "Sending..." : "Send reset code"}
          </button>
        </form>

        {/* ==================================================
            RETURN TO LOGIN
        ================================================== */}

        <div
          className="
            mt-6

            border-t
            border-brand-border

            pt-5

            text-center
          "
        >
          <p
            className="
              text-xs

              text-brand-text-muted
            "
          >
            Remember your password?
          </p>

          <Link
            to={returnTo}
            className="
              mt-1

              inline-flex
              min-h-10

              items-center
              justify-center

              gap-1.5

              rounded-full

              px-3

              text-sm
              font-semibold

              text-brand-accent-text

              transition-all

              hover:bg-brand-accent-soft

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-accent-fill/35
            "
          >
            <ArrowBackRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
            Return to login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
