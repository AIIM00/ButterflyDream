import apiClient from "./apiClient.js";

export async function fetchCustomerWishlist({ signal } = {}) {
  const response = await apiClient.get("/customer/wishlist", {
    signal,
  });

  return response.data;
}

export async function addCustomerWishlistProduct(productId) {
  const response = await apiClient.post("/customer/wishlist/items", {
    productId,
  });

  return response.data;
}

export async function removeCustomerWishlistProduct(productId) {
  const response = await apiClient.delete(
    `/customer/wishlist/items/${encodeURIComponent(productId)}`,
  );

  return response.data;
}
