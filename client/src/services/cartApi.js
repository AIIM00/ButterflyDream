import apiClient from "./apiClient.js";

export async function fetchCustomerCart({ signal } = {}) {
  const response = await apiClient.get("/cart", {
    signal,
  });

  return response.data;
}

export async function addCustomerCartItem(itemData) {
  const response = await apiClient.post("/cart/items", itemData);

  return response.data;
}

export async function updateCustomerCartItem(cartItemId, quantity) {
  const response = await apiClient.patch(
    `/cart/items/${encodeURIComponent(cartItemId)}`,
    {
      quantity,
    },
  );

  return response.data;
}

export async function removeCustomerCartItem(cartItemId) {
  const response = await apiClient.delete(
    `/cart/items/${encodeURIComponent(cartItemId)}`,
  );

  return response.data;
}

export async function clearCustomerCart() {
  const response = await apiClient.delete("/cart");

  return response.data;
}

export async function refreshCustomerCartPrices() {
  const response = await apiClient.post("/cart/refresh-prices");

  return response.data;
}
