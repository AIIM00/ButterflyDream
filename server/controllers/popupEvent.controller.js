import {
  getPublicPopupComments,
  getPublicPopupEvents,
} from "../services/popupEventService.js";

import {
  parsePopupCommentsQuery,
  parsePopupEventId,
  parsePublicPopupQuery,
  PopupEventValidationError,
} from "../utils/popupEventValidation.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

function handlePopupError(error, response, next) {
  if (error instanceof PopupEventValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function listPublicPopupEvents(request, response, next) {
  try {
    const query = parsePublicPopupQuery(request.query);

    const result = await getPublicPopupEvents(query);

    return successResponse(
      response,
      200,
      "Popup events retrieved successfully.",
      result,
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function listPublicPopupComments(request, response, next) {
  try {
    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const query = parsePopupCommentsQuery(request.query);

    const result = await getPublicPopupComments(popupEventId, query);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    return successResponse(
      response,
      200,
      "Popup comments retrieved successfully.",
      {
        comments: result.comments,

        commentsEnabled: result.commentsEnabled,

        pagination: result.pagination,
      },
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}
