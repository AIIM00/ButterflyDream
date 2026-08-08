import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginForm from "../../components/LoginForm.jsx";
import useAppContext from "../../context/app/useAppContext.js";
import { loginAdmin } from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function AdminLogin() {
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

  if (isAuthenticated && user.role === "ADMIN") {
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
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Administration
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        Admin sign in
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Enter the administrator email and password to continue.
      </p>

      <LoginForm
        onSubmit={handleAdminLogin}
        isSubmitting={isSubmitting}
        submitLabel="Sign in"
        emailAutoFocus
      />
    </section>
  );
}

export default AdminLogin;
