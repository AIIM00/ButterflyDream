import apiClient from "./apiClient.js";

export async function fetchCustomerCheckout({ addressId, signal } = {}) {
  const response = await apiClient.get("/checkout", {
    params: {
      ...(addressId
        ? {
            addressId,
          }
        : {}),
    },

    signal,
  });

  return response.data;
}

export async function placeCustomerOrder(orderData) {
  const response = await apiClient.post("/checkout/orders", orderData);

  return response.data;
}
