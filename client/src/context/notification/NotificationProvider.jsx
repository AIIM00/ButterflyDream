import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import useAppContext from "../app/useAppContext.js";
import {
  deleteCustomerNotification,
  deleteReadCustomerNotifications,
  fetchUnreadNotificationCount,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "../../services/notificationApi.js";
import NotificationContext from "./NotificationContext.js";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

export function NotificationProvider({ children }) {
  const location = useLocation();

  const { user, isAuthenticated, authLoading } = useAppContext();

  const [notificationState, setNotificationState] = useState({
    status: "loading",
    unreadCount: 0,
    error: null,
  });

  const [mutationKey, setMutationKey] = useState(null);

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const applyUnreadCount = useCallback((unreadCount) => {
    setNotificationState({
      status: "ready",
      unreadCount: Number(unreadCount ?? 0),
      error: null,
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function synchronizeNotifications() {
      await Promise.resolve();

      if (controller.signal.aborted || authLoading) {
        return;
      }

      if (!isCustomer) {
        setNotificationState({
          status: "guest",
          unreadCount: 0,
          error: null,
        });

        return;
      }

      try {
        const response = await fetchUnreadNotificationCount({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        applyUnreadCount(response.unreadCount);
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          setNotificationState({
            status: "guest",
            unreadCount: 0,
            error: null,
          });

          return;
        }

        setNotificationState({
          status: "error",
          unreadCount: 0,
          error,
        });
      }
    }

    void synchronizeNotifications();

    return () => {
      controller.abort();
    };
  }, [applyUnreadCount, authLoading, isCustomer, location.pathname, user?.id]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isCustomer) {
      setNotificationState({
        status: "guest",
        unreadCount: 0,
        error: null,
      });

      return null;
    }

    try {
      const response = await fetchUnreadNotificationCount();

      applyUnreadCount(response.unreadCount);

      return response;
    } catch (error) {
      if (isAuthenticationError(error)) {
        setNotificationState({
          status: "guest",
          unreadCount: 0,
          error: null,
        });
      } else {
        setNotificationState((currentState) => ({
          ...currentState,
          status: "error",
          error,
        }));
      }

      throw error;
    }
  }, [applyUnreadCount, isCustomer]);

  const markAsRead = useCallback(
    async (notificationId) => {
      setMutationKey(`read:${notificationId}`);

      try {
        const response = await markCustomerNotificationRead(notificationId);

        applyUnreadCount(response.unreadCount);

        return response;
      } finally {
        setMutationKey(null);
      }
    },
    [applyUnreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    setMutationKey("read-all");

    try {
      const response = await markAllCustomerNotificationsRead();

      applyUnreadCount(response.unreadCount);

      return response;
    } finally {
      setMutationKey(null);
    }
  }, [applyUnreadCount]);

  const removeNotification = useCallback(
    async (notificationId) => {
      setMutationKey(`delete:${notificationId}`);

      try {
        const response = await deleteCustomerNotification(notificationId);

        applyUnreadCount(response.unreadCount);

        return response;
      } finally {
        setMutationKey(null);
      }
    },
    [applyUnreadCount],
  );

  const clearReadNotifications = useCallback(async () => {
    setMutationKey("clear-read");

    try {
      const response = await deleteReadCustomerNotifications();

      applyUnreadCount(response.unreadCount);

      return response;
    } finally {
      setMutationKey(null);
    }
  }, [applyUnreadCount]);

  const value = useMemo(
    () => ({
      status: notificationState.status,

      error: notificationState.error,

      unreadCount: notificationState.unreadCount,

      mutationKey,

      isLoading: notificationState.status === "loading",

      isGuest: notificationState.status === "guest",

      applyUnreadCount,
      refreshUnreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearReadNotifications,
    }),
    [
      notificationState,
      mutationKey,
      applyUnreadCount,
      refreshUnreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearReadNotifications,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
