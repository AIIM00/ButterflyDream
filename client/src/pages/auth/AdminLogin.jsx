import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginForm from "../../components/LoginForm.jsx";
import useAppContext from "../../context/app/useAppContext.js";
import { loginAdmin } from "../../services/authApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function AdminLogin() {
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

  if (isAuthenticated && user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleAdminLogin(credentials) {
    setIsSubmitting(true);

    try {
      const response = await loginAdmin(credentials);

      if (response.requiresOtp !== true) {
        throw new Error("The server did not begin admin verification.");
      }

      /*
       * The backend clears any existing
       * customer authentication cookie when
       * valid admin credentials are accepted.
       */
      clearAuthenticatedUser();

      toast.success("A verification code was sent to the admin email.");

      navigate("/admin/verify-otp", {
        replace: true,

        state: {
          email: response.email,
          expiresAt: response.expiresAt,
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to begin admin login."));
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
        Enter the administrator credentials. A verification code will then be
        sent to the admin email.
      </p>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        Admin access requires the correct password and a one-time email code.
      </div>

      <LoginForm
        onSubmit={handleAdminLogin}
        isSubmitting={isSubmitting}
        submitLabel="Continue securely"
        emailAutoFocus
      />
    </section>
  );
}

export default AdminLogin;
