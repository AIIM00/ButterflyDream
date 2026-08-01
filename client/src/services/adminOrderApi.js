import apiClient from "./apiClient.js";

export async function fetchAdminOrders(
  { page = 1, limit = 15, search, status, paymentStatus, sort = "newest" } = {},
  { signal } = {},
) {
  const response = await apiClient.get("/admin/orders", {
    signal,

    params: {
      page,
      limit,
      sort,

      ...(search
        ? {
            search,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(paymentStatus
        ? {
            paymentStatus,
          }
        : {}),
    },
  });

  return response.data;
}

export async function fetchAdminOrder(orderId, { signal } = {}) {
  const response = await apiClient.get(
    `/admin/orders/${encodeURIComponent(orderId)}`,
    {
      signal,
    },
  );

  return response.data;
}

export async function updateAdminOrderStatus(orderId, statusData) {
  const response = await apiClient.patch(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    statusData,
  );

  return response.data;
}

export async function cancelAdminOrder(orderId, cancellationData) {
  const response = await apiClient.patch(
    `/admin/orders/${encodeURIComponent(orderId)}/cancel`,
    cancellationData,
  );

  return response.data;
}

export async function updateAdminOrderNote(orderId, adminNote) {
  const response = await apiClient.patch(
    `/admin/orders/${encodeURIComponent(orderId)}/note`,
    {
      adminNote,
    },
  );

  return response.data;
}

export async function updateAdminOrderPayment(orderId, paymentData) {
  const response = await apiClient.patch(
    `/admin/orders/${encodeURIComponent(orderId)}/payment`,
    paymentData,
  );

  return response.data;
}
