import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

// MUI Icons
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import LoginForm from "../../components/LoginForm.jsx";

import useAppContext from "../../context/app/useAppContext.js";

import { loginCustomer } from "../../services/authApi.js";

import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, authLoading, setAuthenticatedUser } =
    useAppContext();

  const navigate = useNavigate();

  const location = useLocation();

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
     ALREADY AUTHENTICATED
  ========================================================= */

  if (isAuthenticated) {
    const destination = user.emailVerifiedAt ? "/" : "/verify-email";

    return <Navigate to={destination} replace />;
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  async function handleLogin(credentials) {
    setIsSubmitting(true);

    try {
      const response = await loginCustomer(credentials);

      if (!response.user || response.user.role !== "CUSTOMER") {
        throw new Error("The server returned an invalid customer session.");
      }

      setAuthenticatedUser(response.user);

      if (response.requiresEmailVerification) {
        toast.info("Verify your email before using all store features.");

        navigate("/verify-email", {
          replace: true,
        });

        return;
      }

      toast.success("Logged in successfully.");

      const requestedPath = location.state?.from?.pathname;

      const safeDestination =
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : "/";

      navigate(safeDestination, {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to log in."));
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
          Your Butterfly Dream
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
          Welcome back
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
          Sign in to continue your wishlist, cart, profile, and orders.
        </p>

        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <LoginForm
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          submitLabel="Sign in"
          emailAutoFocus
        />

        {/* ==================================================
            ACCOUNT LINKS
        ================================================== */}

        <div
          className="
            mt-6

            border-t
            border-brand-border

            pt-5
          "
        >
          {/* FORGOT PASSWORD */}

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="
                inline-flex
                min-h-10

                items-center
                justify-center

                rounded-full

                px-4

                text-xs
                font-semibold

                text-brand-text-muted

                transition-all
                duration-200

                hover:bg-brand-surface-soft
                hover:text-brand-text

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/30
              "
            >
              Forgot your password?
            </Link>
          </div>

          {/* CREATE ACCOUNT */}

          <div
            className="
              mt-3

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
              New to Butterfly Dream?
            </p>

            <Link
              to="/register"
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
              Create your account
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

export default Login;
