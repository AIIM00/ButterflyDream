import {
  createCustomerFeedback,
  getCustomerFeedback,
  listPublicFeedback,
  updateCustomerFeedback,
} from "../services/feedbackService.js";

import { errorResponse } from "../utils/apiResponse.js";
import { validateFeedbackPayload } from "../utils/feedbackValidation.js";

function parseFeedbackPage(value) {
  const parsedPage = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return Math.min(parsedPage, 100000);
}
function parseFeedbackLimit(value) {
  const parsedLimit = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return 4;
  }

  return Math.min(parsedLimit, 8);
}

function parseFeedbackSort(value) {
  if (value === "highest_rating") {
    return "highest_rating";
  }

  return "newest";
}
export async function listFeedback(request, response, next) {
  try {
    const page = parseFeedbackPage(request.query.page);

    const limit = parseFeedbackLimit(request.query.limit);

    const sort = parseFeedbackSort(request.query.sort);

    const result = await listPublicFeedback({
      page,
      limit,
      sort,
    });

    return response.status(200).json({
      success: true,

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyFeedback(request, response, next) {
  try {
    const feedback = await getCustomerFeedback(request.user.id);

    return response.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createFeedback(request, response, next) {
  try {
    const validation = validateFeedbackPayload(request.body);

    if (!validation.valid) {
      return errorResponse(response, 400, validation.message);
    }

    const existingFeedback = await getCustomerFeedback(request.user.id);

    if (existingFeedback) {
      return errorResponse(
        response,
        409,
        "You have already shared feedback. You can edit your existing feedback instead.",
      );
    }

    const feedback = await createCustomerFeedback(
      request.user.id,
      validation.data,
    );

    return response.status(201).json({
      success: true,
      message: "Thank you for sharing your feedback.",
      feedback,
    });
  } catch (error) {
    /*
     * Protect against two simultaneous requests getting
     * past the existence check.
     *
     * userId is unique in the Feedback model, so Prisma
     * will throw P2002.
     */
    if (error?.code === "P2002") {
      return errorResponse(response, 409, "You have already shared feedback.");
    }

    return next(error);
  }
}

export async function updateFeedback(request, response, next) {
  try {
    const validation = validateFeedbackPayload(request.body);

    if (!validation.valid) {
      return errorResponse(response, 400, validation.message);
    }

    const existingFeedback = await getCustomerFeedback(request.user.id);

    if (!existingFeedback) {
      return errorResponse(response, 404, "You have not shared feedback yet.");
    }

    const feedback = await updateCustomerFeedback(
      request.user.id,
      validation.data,
    );

    return response.status(200).json({
      success: true,
      message: "Your feedback has been updated.",
      feedback,
    });
  } catch (error) {
    return next(error);
  }
}
