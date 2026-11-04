import apiClient from "./apiClient.js";

export async function fetchCheckoutOptions({ signal } = {}) {
  const response = await apiClient.get("/checkout/options", { signal });

  return response.data;
}

export async function fetchCustomerCheckout({ addressId, code, signal } = {}) {
  const response = await apiClient.get("/checkout", {
    params: {
      code,
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

export async function previewCheckout({ items, deliveryAddress, code }, { signal } = {}) {
  const response = await apiClient.post(
    "/checkout/preview",
    {
      items,
      deliveryAddress,
      code,
    },
    { signal },
  );

  return response.data;
}

export async function placeCustomerOrder(orderData) {
  const response = await apiClient.post("/checkout/orders", orderData);

  return response.data;
}

export async function placeCustomerManualOrder(orderData) {
  const response = await apiClient.post("/checkout/manual-orders", orderData);

  return response.data;
}

export async function placeGuestOrder(orderData) {
  const response = await apiClient.post("/checkout/guest-orders", orderData);

  return response.data;
}

export async function saveCustomerCheckoutAddress(addressData) {
  const response = await apiClient.post("/customer/addresses", addressData);

  return response.data;
}
