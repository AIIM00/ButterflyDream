import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

// MUI Icons
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

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

  /* =========================================================
     SESSION LOADING
  ========================================================= */

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
            <PersonOutlineRoundedIcon
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

  /* =========================================================
     AUTHENTICATED REDIRECT
  ========================================================= */

  if (isAuthenticated) {
    const destination =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.emailVerifiedAt
          ? "/"
          : "/verify-email";

    return <Navigate to={destination} replace />;
  }

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,

      [name]: value,
    }));
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

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

  /* =========================================================
     SUBMIT
  ========================================================= */

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
          DECORATIVE DETAILS
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

      <span
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          -bottom-20
          -left-20

          h-44
          w-44

          rounded-full

          border
          border-brand-border/70
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
          <AutoAwesomeOutlinedIcon
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
          Join Butterfly Dream
        </p>

        <h1
          className="
            mt-2

            font-display

            text-[2.15rem]
            font-medium

            leading-[1]

            tracking-[-0.045em]

            text-brand-text

            sm:text-[2.5rem]
          "
        >
          Create your account
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
          Save the pieces you love, manage your cart, and follow your orders
          from one place.
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
          {/* VALIDATION */}

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

          {/* ==================================================
              FULL NAME
          ================================================== */}

          <div>
            <label
              htmlFor="register-full-name"
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
              Full name
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
                <PersonOutlineRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </span>

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

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div>
            <label
              htmlFor="register-email"
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

            <input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isSubmitting}
              placeholder="name@example.com"
              className="
                min-h-12
                w-full

                rounded-[1rem]

                border
                border-brand-border

                bg-brand-surface

                px-4

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

          {/* ==================================================
              PASSWORD
          ================================================== */}

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

          {/* ==================================================
              PASSWORD GUIDANCE
          ================================================== */}

          <div
            className="
              flex
              items-start

              gap-3

              rounded-[1rem]

              bg-brand-surface-soft

              px-4
              py-3.5
            "
          >
            <span
              className="
                mt-0.5

                inline-flex
                h-7
                w-7
                shrink-0

                items-center
                justify-center

                rounded-full

                bg-brand-accent-soft

                text-brand-accent-text
              "
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 14,
                }}
              />
            </span>

            <p
              className="
                text-xs
                leading-5

                text-brand-text-muted
              "
            >
              Use at least{" "}
              <strong className="font-semibold text-brand-text">
                12 characters
              </strong>{" "}
              with uppercase, lowercase, a number, and a special character.
            </p>
          </div>

          {/* ==================================================
              SUBMIT
          ================================================== */}

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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* ==================================================
            EXISTING ACCOUNT
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
              rounded-[1.15rem]

              bg-brand-surface-soft

              px-4
              py-4

              text-center
            "
          >
            <p
              className="
                text-xs
                leading-5

                text-brand-text-muted
              "
            >
              Already part of Butterfly Dream?
            </p>

            <Link
              to="/login"
              className="
                group

                mt-1

                inline-flex
                min-h-9

                items-center
                justify-center

                gap-1.5

                rounded-full

                px-3

                text-sm
                font-semibold

                text-brand-accent-text

                transition-colors

                hover:text-brand-accent-text-hover

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/35
              "
            >
              Sign in
              <ArrowForwardRoundedIcon
                className="
                  transition-transform
                  duration-200

                  group-hover:translate-x-0.5
                "
                sx={{
                  fontSize: 17,
                }}
              />
            </Link>
          </div>
        </div>

        {/* ==================================================
            BRAND NOTE
        ================================================== */}

        <p
          className="
            mt-6

            text-center

            text-[0.54rem]
            font-semibold
            uppercase

            tracking-[0.17em]

            text-brand-text-muted/70
          "
        >
          Jewelry made part of your story
        </p>
      </div>
    </section>
  );
}

export default Register;
