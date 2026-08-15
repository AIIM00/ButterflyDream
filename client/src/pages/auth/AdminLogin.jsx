import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// MUI Icons
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import LoginForm from "../../components/LoginForm.jsx";
import useAppContext from "../../context/app/useAppContext.js";
import { loginAdmin } from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function AdminLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated, authLoading, setAuthenticatedUser } =
    useAppContext();

  const navigate = useNavigate();

  /* =========================================================
     SESSION CHECK
  ========================================================= */

  if (authLoading) {
    return (
      <div
        role="status"
        className="
          flex
          min-h-[220px]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <span
            className="
              mx-auto
              flex
              h-11
              w-11

              items-center
              justify-center

              rounded-full

              bg-slate-100

              text-slate-600
            "
          >
            <AdminPanelSettingsOutlinedIcon
              sx={{
                fontSize: 21,
              }}
            />
          </span>

          <p
            className="
              mt-4

              text-sm
              font-medium

              text-slate-500
            "
          >
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ALREADY AUTHENTICATED ADMIN
  ========================================================= */

  if (isAuthenticated && user?.role === "ADMIN") {
    return (
      <Navigate
        to={
          user.mustChangePassword
            ? "/admin/change-password"
            : "/admin/dashboard"
        }
        replace
      />
    );
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  async function handleAdminLogin(credentials) {
    setIsSubmitting(true);

    try {
      const response = await loginAdmin(credentials);

      if (response.user?.role !== "ADMIN") {
        throw new Error(
          "The server did not return a valid administrator session.",
        );
      }

      setAuthenticatedUser(response.user);

      toast.success("Admin signed in successfully.");

      navigate(
        response.user.mustChangePassword
          ? "/admin/change-password"
          : "/admin/dashboard",
        {
          replace: true,
        },
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  }

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
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          border-b
          border-slate-100

          px-6
          pb-6
          pt-7

          sm:px-8
          sm:pb-7
          sm:pt-8
        "
      >
        <div
          className="
            flex
            items-start

            gap-4
          "
        >
          {/* ADMIN ICON */}

          <span
            className="
              flex
              h-12
              w-12
              shrink-0

              items-center
              justify-center

              rounded-[0.9rem]

              bg-slate-950

              text-white

              shadow-sm
            "
          >
            <AdminPanelSettingsOutlinedIcon
              sx={{
                fontSize: 23,
              }}
            />
          </span>

          <div className="min-w-0">
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase

                tracking-[0.18em]

                text-slate-500
              "
            >
              Butterfly Dream Administration
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
              Admin sign in
            </h1>
          </div>
        </div>

        <p
          className="
            mt-5

            max-w-md

            text-sm
            leading-6

            text-slate-500
          "
        >
          Enter your administrator credentials to continue to the management
          portal.
        </p>
      </div>

      {/* ==================================================
          FORM
      ================================================== */}

      <div
        className="
          px-6
          pb-7

          sm:px-8
          sm:pb-8
        "
      >
        <LoginForm
          onSubmit={handleAdminLogin}
          isSubmitting={isSubmitting}
          submitLabel="Sign in"
          emailAutoFocus
        />
      </div>

      {/* ==================================================
          SECURITY NOTE
      ================================================== */}

      <div
        className="
          flex
          items-start

          gap-3

          border-t
          border-slate-100

          bg-slate-50

          px-6
          py-4

          sm:px-8
        "
      >
        <span
          className="
            mt-0.5

            flex
            h-8
            w-8
            shrink-0

            items-center
            justify-center

            rounded-full

            bg-white

            text-slate-500

            ring-1
            ring-slate-200
          "
        >
          <LockOutlinedIcon
            sx={{
              fontSize: 16,
            }}
          />
        </span>

        <div>
          <p
            className="
              text-xs
              font-semibold

              text-slate-700
            "
          >
            Restricted access
          </p>

          <p
            className="
              mt-0.5

              text-[0.7rem]
              leading-5

              text-slate-500
            "
          >
            This portal is intended for authorized administrators only.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
