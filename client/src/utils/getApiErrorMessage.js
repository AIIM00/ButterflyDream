import axios from "axios";

function getApiErrorMessage(
  error,
  fallbackMessage = "An unexpected error occurred.",
) {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }

    if (!error.response) {
      return "Unable to connect to the server. Check that the backend is running.";
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

export default getApiErrorMessage;
