import apiClient from "./apiClient.js";

export async function fetchCustomerNotifications(
  { page = 1, limit = 20, status = "all", type } = {},
  { signal } = {},
) {
  const response = await apiClient.get("/customer/notifications", {
    signal,

    params: {
      page,
      limit,
      status,

      ...(type
        ? {
            type,
          }
        : {}),
    },
  });

  return response.data;
}

export async function fetchUnreadNotificationCount({ signal } = {}) {
  const response = await apiClient.get("/customer/notifications/unread-count", {
    signal,
  });

  return response.data;
}

export async function markCustomerNotificationRead(notificationId) {
  const response = await apiClient.patch(
    `/customer/notifications/${encodeURIComponent(notificationId)}/read`,
  );

  return response.data;
}

export async function markAllCustomerNotificationsRead() {
  const response = await apiClient.patch("/customer/notifications/read-all");

  return response.data;
}

export async function deleteCustomerNotification(notificationId) {
  const response = await apiClient.delete(
    `/customer/notifications/${encodeURIComponent(notificationId)}`,
  );

  return response.data;
}

export async function deleteReadCustomerNotifications() {
  const response = await apiClient.delete("/customer/notifications/read");

  return response.data;
}
