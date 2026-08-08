import apiClient from "./apiClient.js";

export async function registerCustomer(customerData) {
  const response = await apiClient.post("/auth/register", customerData);

  return response.data;
}

export async function loginCustomer(credentials) {
  const response = await apiClient.post("/auth/login", credentials);

  return response.data;
}

export async function loginAdmin(credentials) {
  const response = await apiClient.post("/auth/admin", credentials);

  return response.data;
}
export async function changeAdminInitialPassword({
  newPassword,
  confirmPassword,
}) {
  const response = await apiClient.post("/auth/admin/change-initial-password", {
    newPassword,
    confirmPassword,
  });

  return response.data;
}

export async function verifyCustomerEmail(otp) {
  const response = await apiClient.post("/auth/email-verification/verify", {
    otp,
  });

  return response.data;
}

export async function resendCustomerEmailVerification() {
  const response = await apiClient.post("/auth/email-verification/resend");

  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await apiClient.post("/auth/password-reset/request", {
    email,
  });

  return response.data;
}

export async function confirmPasswordReset({ otp, newPassword }) {
  const response = await apiClient.post("/auth/password-reset/confirm", {
    otp,
    newPassword,
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get("/auth/me");

  return response.data;
}

export async function logoutUser() {
  const response = await apiClient.post("/auth/logout");

  return response.data;
}
