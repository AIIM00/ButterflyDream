import apiClient from "./apiClient.js";

export async function fetchCustomerCheckout({ signal } = {}) {
  const response = await apiClient.get("/checkout", {
    signal,
  });

  return response.data;
}

export async function placeCustomerOrder(orderData) {
  const response = await apiClient.post("/checkout/orders", orderData);

  return response.data;
}
