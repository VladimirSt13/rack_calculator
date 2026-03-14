/**
 * REST API Response Helper
 * Уніфікований формат відповідей
 */

/**
 * Створення уніфікованої відповіді
 */
export const apiResponse = (
  res,
  statusCode,
  data,
  message = null,
  meta = {},
) => {
  const response = {
    data,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Успішна відповідь (200 OK)
 */
export const success = (res, data, message = "Success") => {
  return apiResponse(res, 200, data, message);
};

/**
 * Створено ресурс (201 Created)
 */
export const created = (
  res,
  data,
  message = "Resource created successfully",
) => {
  return apiResponse(res, 201, data, message);
};

/**
 * Немає вмісту (204 No Content)
 */
export const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Помилка валідації (400 Bad Request)
 */
export const badRequest = (
  res,
  error = "Bad request",
  code = "VALIDATION_ERROR",
) => {
  return apiResponse(res, 400, { error, code });
};

/**
 * Неавторизовано (401 Unauthorized)
 */
export const unauthorized = (
  res,
  error = "Unauthorized",
  code = "UNAUTHORIZED",
) => {
  return apiResponse(res, 401, { error, code });
};

/**
 * Заборонено (403 Forbidden)
 */
export const forbidden = (res, error = "Forbidden", code = "FORBIDDEN") => {
  return apiResponse(res, 403, { error, code });
};

/**
 * Не знайдено (404 Not Found)
 */
export const notFound = (
  res,
  error = "Resource not found",
  code = "NOT_FOUND",
) => {
  return apiResponse(res, 404, { error, code });
};

/**
 * Конфлікт (409 Conflict)
 */
export const conflict = (
  res,
  error = "Resource already exists",
  code = "CONFLICT",
) => {
  return apiResponse(res, 409, { error, code });
};

/**
 * Неприйнятний запит (422 Unprocessable Entity)
 */
export const unprocessable = (
  res,
  error = "Validation failed",
  code = "VALIDATION_ERROR",
  details = null,
) => {
  const data = { error, code };
  if (details) {
    data.details = details;
  }
  return apiResponse(res, 422, data);
};

/**
 * Внутрішня помилка сервера (500 Internal Server Error)
 */
export const serverError = (
  res,
  error = "Internal server error",
  code = "INTERNAL_ERROR",
) => {
  return apiResponse(res, 500, { error, code });
};

/**
 * Занадто багато запитів (429 Too Many Requests)
 */
export const tooManyRequests = (
  res,
  error = "Rate limit exceeded",
  code = "RATE_LIMIT_EXCEEDED",
) => {
  return apiResponse(res, 429, { error, code });
};

export default {
  apiResponse,
  success,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  serverError,
  tooManyRequests,
};
