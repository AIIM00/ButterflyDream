import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is missing. Add it to the client .env file.");
}

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ""),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default apiClient;
