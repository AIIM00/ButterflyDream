import apiClient from "./apiClient.js";

export async function fetchAdminProducts(params, { signal } = {}) {
  const response = await apiClient.get("/admin/products", {
    params,
    signal,
  });

  return response.data;
}

export async function fetchAdminProduct(productId, { signal } = {}) {
  const response = await apiClient.get(
    `/admin/products/${encodeURIComponent(productId)}`,
    {
      signal,
    },
  );

  return response.data;
}

export async function createAdminProduct(productData) {
  const response = await apiClient.post("/admin/products", productData);

  return response.data;
}

export async function updateAdminProduct(productId, productData) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}`,
    productData,
  );

  return response.data;
}

export async function updateAdminProductStatus(productId, status) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/status`,
    {
      status,
    },
  );

  return response.data;
}

export async function archiveAdminProduct(productId) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/archive`,
  );

  return response.data;
}

export async function createAdminVariant(productId, variantData) {
  const response = await apiClient.post(
    `/admin/products/${encodeURIComponent(productId)}/variants`,
    variantData,
  );

  return response.data;
}

export async function updateAdminVariant(productId, variantId, variantData) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    variantData,
  );

  return response.data;
}

export async function updateAdminVariantStatus(productId, variantId, isActive) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/status`,
    {
      isActive,
    },
  );

  return response.data;
}

export async function updateAdminVariantInventory(
  productId,
  variantId,
  inventoryData,
) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/inventory`,
    inventoryData,
  );

  return response.data;
}

export async function archiveAdminVariant(productId, variantId) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/archive`,
  );

  return response.data;
}

export async function createAdminProductImage(productId, imageData) {
  const response = await apiClient.post(
    `/admin/products/${encodeURIComponent(productId)}/images`,
    imageData,
  );

  return response.data;
}

export async function updateAdminProductImage(productId, imageId, imageData) {
  const response = await apiClient.patch(
    `/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    imageData,
  );

  return response.data;
}

export async function deleteAdminProductImage(productId, imageId) {
  const response = await apiClient.delete(
    `/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
  );

  return response.data;
}
