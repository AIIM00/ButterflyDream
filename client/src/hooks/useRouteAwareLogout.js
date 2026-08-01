import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAppContext from "../context/app/useAppContext.js";
import getApiErrorMessage from "../utils/getApiErrorMessage.js";

function useRouteAwareLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { logout } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    const isAdminRoute =
      location.pathname === "/admin" || location.pathname.startsWith("/admin/");

    const destination = isAdminRoute ? "/admin/login" : "/";

    try {
      await logout();

      toast.success(
        isAdminRoute
          ? "Admin logged out successfully."
          : "Logged out successfully.",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "The local session was cleared, but the server could not be reached.",
        ),
      );
    } finally {
      setIsLoggingOut(false);

      navigate(destination, {
        replace: true,
      });
    }
  }, [isLoggingOut, location.pathname, logout, navigate]);

  return {
    handleLogout,
    isLoggingOut,
  };
}

export default useRouteAwareLogout;
