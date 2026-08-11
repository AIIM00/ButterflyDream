const MIN_RATING = 1;
const MAX_RATING = 5;

function validateRating(value) {
  const rating = Number(value);

  if (!Number.isInteger(rating)) {
    return {
      valid: false,
      message: "Rating must be a whole number.",
    };
  }

  if (rating < MIN_RATING || rating > MAX_RATING) {
    return {
      valid: false,
      message: "Rating must be between 1 and 5.",
    };
  }

  return {
    valid: true,
    value: rating,
  };
}

function validateComment(value) {
  if (typeof value !== "string") {
    return {
      valid: false,
      message: "Comment is required.",
    };
  }

  const comment = value.trim();

  if (!comment) {
    return {
      valid: false,
      message: "Comment is required.",
    };
  }

  return {
    valid: true,
    value: comment,
  };
}

export function validateFeedbackPayload(payload) {
  const ratingResult = validateRating(payload?.rating);

  if (!ratingResult.valid) {
    return {
      valid: false,
      message: ratingResult.message,
    };
  }

  const commentResult = validateComment(payload?.comment);

  if (!commentResult.valid) {
    return {
      valid: false,
      message: commentResult.message,
    };
  }

  return {
    valid: true,
    data: {
      rating: ratingResult.value,
      comment: commentResult.value,
    },
  };
}
