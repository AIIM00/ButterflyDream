import { useCallback, useEffect, useMemo, useState } from "react";

//Services
import { getCurrentUser, logoutUser } from "../../services/authApi.js";

//Context
import AppContext from "./AppContext.js";

const allowedRoles = new Set(["CUSTOMER", "ADMIN"]);

function validateUser(userData) {
  return (
    userData !== null &&
    typeof userData === "object" &&
    !Array.isArray(userData) &&
    typeof userData.id === "string" &&
    userData.id.length > 0 &&
    allowedRoles.has(userData.role)
  );
}

function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const isAuthenticated = user !== null;

  const setAuthenticatedUser = useCallback((userData) => {
    if (!validateUser(userData)) {
      throw new TypeError(
        "setAuthenticatedUser expects a valid CUSTOMER or ADMIN user.",
      );
    }

    setUser(userData);
  }, []);

  const clearAuthenticatedUser = useCallback(() => {
    setUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    setAuthLoading(true);

    try {
      const response = await getCurrentUser();

      if (!validateUser(response.user)) {
        setUser(null);
        return null;
      }

      setUser(response.user);

      return response.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      return await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let ignoreResult = false;

    async function restoreSession() {
      try {
        const response = await getCurrentUser();

        if (ignoreResult) {
          return;
        }

        if (validateUser(response.user)) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!ignoreResult) {
          setUser(null);
        }
      } finally {
        if (!ignoreResult) {
          setAuthLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      ignoreResult = true;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      authLoading,
      setAuthenticatedUser,
      clearAuthenticatedUser,
      refreshCurrentUser,
      logout,
    }),
    [
      user,
      isAuthenticated,
      authLoading,
      setAuthenticatedUser,
      clearAuthenticatedUser,
      refreshCurrentUser,
      logout,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export default AppProvider;
