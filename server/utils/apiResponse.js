export function successResponse(response, statusCode, message, data = {}) {
  return response.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
}

export function errorResponse(response, statusCode, message, data = {}) {
  return response.status(statusCode).json({
    success: false,
    message,
    ...data,
  });
}
