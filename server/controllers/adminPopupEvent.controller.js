import {
  createAdminPopupEvent,
  deleteAdminPopupComment,
  getAdminPopupEventById,
  listAdminPopupEvents,
  reorderAdminPopupEvents,
  updateAdminPopupEvent,
  updateAdminPopupEventStatus,
} from "../services/adminPopupEventService.js";

import {
  AdminPopupEventValidationError,
  parseCreatePopupEventInput,
  parsePopupCommentId,
  parsePopupEventId,
  parsePopupEventListQuery,
  parsePopupEventReorderInput,
  parsePopupEventStatusInput,
  parseUpdatePopupEventInput,
} from "../utils/adminPopupEventValidation.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

function handlePopupError(error, response, next) {
  if (error instanceof AdminPopupEventValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function getAdminPopupEvents(request, response, next) {
  try {
    const filters = parsePopupEventListQuery(request.query);

    const result = await listAdminPopupEvents(filters);

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

export async function getAdminPopupEvent(request, response, next) {
  try {
    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const popupEvent = await getAdminPopupEventById(popupEventId);

    if (!popupEvent) {
      return errorResponse(response, 404, "Popup event not found.");
    }

    return successResponse(
      response,
      200,
      "Popup event retrieved successfully.",
      {
        popupEvent,
      },
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function createPopupEvent(request, response, next) {
  try {
    const input = parseCreatePopupEventInput(request.body);

    const result = await createAdminPopupEvent(request.user.id, input);

    if (result.status === "MEDIA_NOT_FOUND") {
      return errorResponse(
        response,
        404,
        "One or more Media Library images could not be found.",
      );
    }

    return successResponse(response, 201, "Popup draft created successfully.", {
      popupEvent: result.popupEvent,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function updatePopupEvent(request, response, next) {
  try {
    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const input = parseUpdatePopupEventInput(request.body);

    const result = await updateAdminPopupEvent(popupEventId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    if (result.status === "MEDIA_NOT_FOUND") {
      return errorResponse(
        response,
        404,
        "One or more Media Library images could not be found.",
      );
    }

    return successResponse(response, 200, "Popup event updated successfully.", {
      popupEvent: result.popupEvent,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function changePopupEventStatus(request, response, next) {
  try {
    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const { status } = parsePopupEventStatusInput(request.body);

    const result = await updateAdminPopupEventStatus(popupEventId, status);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    if (result.status === "NO_IMAGES") {
      return errorResponse(
        response,
        409,
        "Add at least one image before publishing the popup.",
      );
    }

    if (result.status === "INCOMPLETE") {
      return errorResponse(
        response,
        409,
        "Complete the popup title and caption before publishing.",
      );
    }

    return successResponse(
      response,
      200,
      status === "PUBLISHED"
        ? "Popup published successfully."
        : status === "ARCHIVED"
          ? "Popup archived successfully."
          : "Popup moved to draft successfully.",
      {
        popupEvent: result.popupEvent,
      },
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function reorderPopupEvents(request, response, next) {
  try {
    const { ids } = parsePopupEventReorderInput(request.body);

    const result = await reorderAdminPopupEvents(ids);

    if (result.status === "NOT_FOUND") {
      return errorResponse(
        response,
        404,
        "One or more popup events were not found.",
      );
    }

    return successResponse(
      response,
      200,
      "Popup events reordered successfully.",
      {
        popupEvents: result.popupEvents,
      },
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function removePopupCommentAsAdmin(request, response, next) {
  try {
    const commentId = parsePopupCommentId(request.params.commentId);

    const result = await deleteAdminPopupComment(commentId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Comment not found.");
    }

    return successResponse(response, 200, "Comment removed successfully.", {
      popupEventId: result.popupEventId,

      commentCount: result.commentCount,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}
