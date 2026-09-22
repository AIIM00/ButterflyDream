import apiClient from "./apiClient.js";

export async function fetchAdminCustomers(
  {
    page = 1,
    limit = 15,
    search,
    status,
    sort = "newest",
  } = {},
  { signal } = {},
) {
  const response = await apiClient.get("/admin/customers", {
    signal,
    params: {
      page,
      limit,
      search,
      status,
      sort,
    },
  });

  return response.data;
}
