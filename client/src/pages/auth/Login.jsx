import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
    const destination = user.emailVerifiedAt ? "/" : "/verify-email";

    return <Navigate to={destination} replace />;
  }

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
        typeof requestedPath === "string" && requestedPath.startsWith("/")
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
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        Welcome back
      </h1>

      <p className="mt-3 leading-7 text-gray-600">
        Sign in to manage your wishlist, cart, profile, and orders.
      </p>

      <LoginForm
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        submitLabel="Sign in"
        emailAutoFocus
      />

      <div className="mt-6 space-y-3 text-center text-sm">
        <Link
          to="/forgot-password"
          className="block font-medium text-gray-700 hover:text-gray-900"
        >
          Forgot your password?
        </Link>

        <p className="text-gray-600">
          Do not have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-gray-900 underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
