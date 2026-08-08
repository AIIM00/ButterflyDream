import apiClient from "./apiClient.js";

export async function fetchInStoreSaleProducts({
  search = "",
  limit = 20,
  signal,
} = {}) {
  const response = await apiClient.get("/admin/in-store-sales/products", {
    params: {
      search,
      limit,
    },
    signal,
  });

  return response.data;
}

export async function createInStoreSale(payload) {
  const response = await apiClient.post("/admin/in-store-sales", payload);

  return response.data;
}

export async function fetchInStoreSales(params = {}, { signal } = {}) {
  const response = await apiClient.get("/admin/in-store-sales", {
    params,
    signal,
  });

  return response.data;
}
