import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAppContext from "../../context/app/useAppContext.js";

function LoadingAuthentication() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div
        role="status"
        className="rounded-xl border border-gray-200 bg-white px-6 py-5 text-sm font-medium text-gray-600 shadow-sm"
      >
        Checking your session...
      </div>
    </main>
  );
}

function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, authLoading } = useAppContext();

  const location = useLocation();

  if (authLoading) {
    return <LoadingAuthentication />;
  }

  const isAdminRoute = allowedRoles.includes("ADMIN");

  if (!isAuthenticated) {
    return (
      <Navigate
        to={isAdminRoute ? "/admin/login" : "/login"}
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/"} replace />
    );
  }

  /*
   * An ADMIN using the one-time temporary password may
   * authenticate, but cannot enter the normal admin portal.
   *
   * The backend independently enforces this restriction for
   * /api/admin/* routes.
   */
  if (
    user.role === "ADMIN" &&
    user.mustChangePassword === true &&
    location.pathname !== "/admin/change-password"
  ) {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
