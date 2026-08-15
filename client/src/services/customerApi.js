import apiClient from "./apiClient.js";

export async function fetchCustomerDeliveryGovernorates({ signal } = {}) {
  const response = await apiClient.get("/customer/delivery-governorates", {
    signal,
  });

  return response.data;
}

export async function fetchCustomerAddresses({ signal } = {}) {
  const response = await apiClient.get("/customer/addresses", {
    signal,
  });

  return response.data;
}

export async function createCustomerAddress(addressData) {
  const response = await apiClient.post("/customer/addresses", addressData);

  return response.data;
}

export async function updateCustomerAddress(addressId, addressData) {
  const response = await apiClient.patch(
    `/customer/addresses/${encodeURIComponent(addressId)}`,
    addressData,
  );

  return response.data;
}

export async function setDefaultCustomerAddress(addressId) {
  const response = await apiClient.patch(
    `/customer/addresses/${encodeURIComponent(addressId)}/default`,
  );

  return response.data;
}

export async function deleteCustomerAddress(addressId) {
  const response = await apiClient.delete(
    `/customer/addresses/${encodeURIComponent(addressId)}`,
  );

  return response.data;
}

export async function fetchCustomerOrders(
  { page = 1, limit = 10, status, sort = "newest" } = {},
  { signal } = {},
) {
  const response = await apiClient.get("/customer/orders", {
    signal,

    params: {
      page,
      limit,
      sort,

      ...(status
        ? {
            status,
          }
        : {}),
    },
  });

  return response.data;
}

export async function fetchCustomerOrder(orderId, { signal } = {}) {
  const response = await apiClient.get(
    `/customer/orders/${encodeURIComponent(orderId)}`,
    {
      signal,
    },
  );

  return response.data;
}
