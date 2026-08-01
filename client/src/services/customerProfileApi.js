import apiClient from "./apiClient.js";

export async function fetchCustomerProfile({ signal } = {}) {
  const response = await apiClient.get("/customer/profile", {
    signal,
  });

  return response.data;
}

export async function updateCustomerProfile(profileData) {
  const response = await apiClient.patch("/customer/profile", profileData);

  return response.data;
}

export async function changeCustomerPassword(passwordData) {
  const response = await apiClient.patch("/customer/password", passwordData);

  return response.data;
}
