import apiClient from "./apiClient.js";

export async function fetchAdminDeliveryGovernorates({ signal } = {}) {
  const response = await apiClient.get("/admin/delivery-governorates", {
    signal,
  });

  return response.data;
}

export async function updateAdminDeliveryGovernorate(
  governorateId,
  governorateData,
) {
  const response = await apiClient.patch(
    `/admin/delivery-governorates/${governorateId}`,
    governorateData,
  );

  return response.data;
}
