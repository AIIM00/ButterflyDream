import {
  confirmPopupAttendance,
  createPopupComment,
  deleteOwnPopupComment,
  getCustomerPopupInteractions,
  likePopupEvent,
  removePopupAttendance,
  unlikePopupEvent,
} from "../services/popupEventService.js";

import {
  parsePopupCommentBody,
  parsePopupCommentId,
  parsePopupEventId,
  parsePopupInteractionIds,
  PopupEventValidationError,
} from "../utils/popupEventValidation.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

function getUserId(request) {
  return request.user?.id ?? null;
}

function handlePopupError(error, response, next) {
  if (error instanceof PopupEventValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function getPopupInteractions(request, response, next) {
  try {
    const userId = getUserId(request);

    const ids = parsePopupInteractionIds(request.query);

    const result = await getCustomerPopupInteractions(userId, ids);

    return successResponse(
      response,
      200,
      "Popup interactions retrieved successfully.",
      result,
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function likePopup(request, response, next) {
  try {
    const userId = getUserId(request);

    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const result = await likePopupEvent(userId, popupEventId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    return successResponse(
      response,
      200,
      result.status === "ALREADY_LIKED"
        ? "Popup event is already liked."
        : "Popup event liked.",
      {
        liked: result.liked,

        likeCount: result.likeCount,
      },
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function unlikePopup(request, response, next) {
  try {
    const userId = getUserId(request);

    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const result = await unlikePopupEvent(userId, popupEventId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    return successResponse(response, 200, "Popup event unliked.", {
      liked: result.liked,

      likeCount: result.likeCount,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function confirmAttendance(request, response, next) {
  try {
    const userId = getUserId(request);

    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const result = await confirmPopupAttendance(userId, popupEventId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    return successResponse(
      response,
      200,
      result.status === "ALREADY_CONFIRMED"
        ? "Your attendance is already confirmed."
        : "Attendance confirmed.",
      {
        attended: result.attended,

        attendanceCount: result.attendanceCount,
      },
    );
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function removeAttendance(request, response, next) {
  try {
    const userId = getUserId(request);

    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const result = await removePopupAttendance(userId, popupEventId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    return successResponse(response, 200, "Attendance confirmation removed.", {
      attended: result.attended,

      attendanceCount: result.attendanceCount,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function addPopupComment(request, response, next) {
  try {
    const userId = getUserId(request);

    const popupEventId = parsePopupEventId(request.params.popupEventId);

    const { comment } = parsePopupCommentBody(request.body);

    const result = await createPopupComment(userId, popupEventId, comment);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Popup event not found.");
    }

    if (result.status === "COMMENTS_DISABLED") {
      return errorResponse(
        response,
        403,
        "Comments are disabled for this popup event.",
      );
    }

    return successResponse(response, 201, "Comment posted successfully.", {
      comment: result.comment,

      commentCount: result.commentCount,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}

export async function deletePopupComment(request, response, next) {
  try {
    const userId = getUserId(request);

    const commentId = parsePopupCommentId(request.params.commentId);

    const result = await deleteOwnPopupComment(userId, commentId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Comment not found.");
    }

    return successResponse(response, 200, "Comment deleted successfully.", {
      popupEventId: result.popupEventId,

      commentCount: result.commentCount,
    });
  } catch (error) {
    return handlePopupError(error, response, next);
  }
}
