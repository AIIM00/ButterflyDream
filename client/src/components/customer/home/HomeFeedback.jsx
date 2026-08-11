import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import { toast } from "react-toastify";

import {
  createFeedback,
  fetchFeedbacks,
  fetchMyFeedback,
  updateMyFeedback,
} from "../../../services/feedbackApi.js";

import getApiErrorMessage from "../../../utils/getApiErrorMessage.js";

const STAR_VALUES = [1, 2, 3, 4, 5];

function formatReviewDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function Stars({
  rating,
  size = 18,
  interactive = false,
  onSelect,
  disabled = false,
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? "radiogroup" : undefined}
      aria-label={
        interactive ? "Choose your rating" : `${rating} out of 5 stars`
      }
    >
      {STAR_VALUES.map((value) => {
        const filled = value <= rating;

        if (!interactive) {
          return filled ? (
            <StarRoundedIcon
              key={value}
              aria-hidden="true"
              sx={{
                fontSize: size,
              }}
              className="text-brand-bronze"
            />
          ) : (
            <StarBorderRoundedIcon
              key={value}
              aria-hidden="true"
              sx={{
                fontSize: size,
              }}
              className="text-brand-bronze/35"
            />
          );
        }

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
            disabled={disabled}
            onClick={() => onSelect?.(value)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-full

              text-brand-bronze

              transition
              duration-200

              hover:bg-brand-pale-champagne
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-bronze/30

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {filled ? (
              <StarRoundedIcon
                sx={{
                  fontSize: 27,
                }}
              />
            ) : (
              <StarBorderRoundedIcon
                sx={{
                  fontSize: 27,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ feedback }) {
  return (
    <article
      className="
        flex
        min-h-[220px]
        flex-col
        border
        border-brand-border
        bg-white
        p-4

        sm:min-h-[240px]
        sm:p-5

        lg:min-h-[280px]
        lg:p-6
      "
    >
      <Stars rating={feedback.rating} size={17} />

      <blockquote
        className="
          mt-5
          flex-1
          break-words

          font-display
          text-[1.05rem]
          font-medium
          leading-[1.35]
          tracking-[-0.02em]
          text-brand-espresso

          sm:text-[1.2rem]
          lg:text-[1.32rem]
        "
      >
        “{feedback.comment}”
      </blockquote>

      <div
        className="
          mt-6
          border-t
          border-brand-border
          pt-4
        "
      >
        <p
          className="
            text-[0.7rem]
            font-bold
            uppercase
            tracking-[0.13em]
            text-brand-espresso
          "
        >
          {feedback.customerName}
        </p>

        {feedback.createdAt && (
          <p
            className="
              mt-1
              text-[0.65rem]
              uppercase
              tracking-[0.1em]
              text-brand-espresso/45
            "
          >
            {formatReviewDate(feedback.createdAt)}
          </p>
        )}
      </div>
    </article>
  );
}

function ReviewSkeleton() {
  return (
    <div
      className="
        min-h-[220px]
        animate-pulse
        border
        border-brand-border
        bg-white
        p-4

        sm:min-h-[240px]
        sm:p-5

        lg:min-h-[280px]
        lg:p-6
      "
    >
      <div className="h-4 w-24 bg-brand-pale-champagne" />

      <div className="mt-7 space-y-3">
        <div className="h-4 w-full bg-brand-pale-champagne" />
        <div className="h-4 w-[85%] bg-brand-pale-champagne" />
        <div className="h-4 w-[65%] bg-brand-pale-champagne" />
      </div>

      <div className="mt-16 h-px bg-brand-border" />

      <div className="mt-4 h-3 w-20 bg-brand-pale-champagne" />
    </div>
  );
}

function EmptyReviews() {
  return (
    <div
      className="
        col-span-2
        flex
        min-h-[260px]
        flex-col
        items-center
        justify-center

        border
        border-brand-border
        bg-white

        px-6
        text-center

        lg:col-span-4
      "
    >
      <p
        className="
          text-[0.62rem]
          font-bold
          uppercase
          tracking-[0.2em]
          text-brand-bronze
        "
      >
        Be the first
      </p>

      <h3
        className="
          mt-4
          max-w-sm
          font-display
          text-[2rem]
          font-medium
          leading-[1]
          tracking-[-0.04em]
          text-brand-espresso
        "
      >
        Share your Butterfly Dream experience.
      </h3>

      <p
        className="
          mt-4
          max-w-xs
          text-sm
          leading-6
          text-brand-espresso/55
        "
      >
        Customer stories help others discover Butterfly Dream with confidence.
      </p>
    </div>
  );
}

function FeedbackForm({
  rating,
  comment,
  existingFeedback,
  isSubmitting,
  onRatingChange,
  onCommentChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="
              text-[0.6rem]
              font-bold
              uppercase
              tracking-[0.2em]
              text-brand-bronze
            "
          >
            {existingFeedback ? "Your feedback" : "Share your experience"}
          </p>

          <h3
            className="
              mt-2
              font-display
              text-[1.9rem]
              font-medium
              leading-[1]
              tracking-[-0.04em]
              text-brand-espresso

              sm:text-[2.3rem]
            "
          >
            {existingFeedback ? (
              <>
                Your story,
                <span className="italic"> your words.</span>
              </>
            ) : (
              <>
                How was your
                <span className="italic"> experience?</span>
              </>
            )}
          </h3>
        </div>

        {existingFeedback && (
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-full

              bg-brand-pale-champagne
              text-brand-bronze
            "
            aria-hidden="true"
          >
            <EditRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
          </span>
        )}
      </div>

      <div className="mt-7">
        <p
          className="
            mb-2
            text-[0.68rem]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-brand-espresso/60
          "
        >
          Your rating
        </p>

        <Stars
          rating={rating}
          interactive
          onSelect={onRatingChange}
          disabled={isSubmitting}
        />
      </div>

      <label className="mt-7 block">
        <span
          className="
            text-[0.68rem]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-brand-espresso/60
          "
        >
          Your comment
        </span>

        <textarea
          rows={4}
          value={comment}
          disabled={isSubmitting}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Tell us about your Butterfly Dream experience..."
          className="
            mt-3
            min-h-[120px]
            w-full
            resize-none

            border
            border-brand-border
            bg-white

            px-4
            py-4

            text-sm
            leading-6
            text-brand-espresso

            outline-none

            transition-colors

            placeholder:text-brand-espresso/30

            focus:border-brand-bronze

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0 || !comment.trim()}
        className="
          mt-5
          inline-flex
          min-h-11
          items-center
          justify-center
          gap-2

          rounded-full

          bg-brand-forest

          px-6

          text-[0.68rem]
          font-bold
          uppercase
          tracking-[0.14em]
          text-white

          transition

          hover:opacity-90

          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        {isSubmitting
          ? "Saving..."
          : existingFeedback
            ? "Update feedback"
            : "Share feedback"}

        {!isSubmitting && (
          <ArrowForwardRoundedIcon
            aria-hidden="true"
            sx={{
              fontSize: 17,
            }}
          />
        )}
      </button>
    </form>
  );
}

function GuestReviewInvitation() {
  return (
    <div>
      <p
        className="
          text-[0.6rem]
          font-bold
          uppercase
          tracking-[0.2em]
          text-brand-bronze
        "
      >
        Your experience matters
      </p>

      <h3
        className="
          mt-3
          max-w-sm
          font-display
          text-[2rem]
          font-medium
          leading-[0.98]
          tracking-[-0.045em]
          text-brand-espresso

          sm:text-[2.5rem]
        "
      >
        Have something
        <span className="italic"> to share?</span>
      </h3>

      <p
        className="
          mt-5
          max-w-sm
          text-sm
          leading-6
          text-brand-espresso/55
        "
      >
        Sign in to your customer account to rate your Butterfly Dream experience
        and leave a comment.
      </p>

      <Link
        to="/auth/login"
        className="
          group
          mt-6
          inline-flex
          items-center
          gap-2

          border-b
          border-brand-espresso

          pb-1

          text-[0.68rem]
          font-bold
          uppercase
          tracking-[0.14em]
          text-brand-espresso
        "
      >
        Sign in to leave feedback
        <ArrowForwardRoundedIcon
          className="
            transition-transform
            duration-200
            group-hover:translate-x-0.5
          "
          sx={{
            fontSize: 17,
          }}
        />
      </Link>
    </div>
  );
}

function HomeFeedback() {
  const [page, setPage] = useState(1);

  const [feedbackState, setFeedbackState] = useState({
    loading: true,
    feedbacks: [],
    summary: {
      averageRating: 0,
      totalFeedbacks: 0,
    },
    pagination: {
      page: 1,
      limit: 4,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    error: null,
  });

  const [viewerState, setViewerState] = useState("checking");

  const [myFeedback, setMyFeedback] = useState(null);

  const [rating, setRating] = useState(0);

  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * Public feedback.
   *
   * Every page contains up to four reviews.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadFeedbacks() {
      setFeedbackState((currentState) => ({
        ...currentState,
        loading: true,
        error: null,
      }));

      try {
        const response = await fetchFeedbacks(page, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setFeedbackState({
          loading: false,

          feedbacks: Array.isArray(response.feedbacks)
            ? response.feedbacks
            : [],

          summary: response.summary ?? {
            averageRating: 0,
            totalFeedbacks: 0,
          },

          pagination: response.pagination ?? {
            page,
            limit: 4,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          },

          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setFeedbackState((currentState) => ({
          ...currentState,
          loading: false,
          error,
        }));
      }
    }

    void loadFeedbacks();

    return () => {
      controller.abort();
    };
  }, [page, refreshKey]);

  /*
   * Check whether the current visitor is an
   * authenticated customer and load their review.
   *
   * 401 = normal guest visitor.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadMyFeedback() {
      try {
        const response = await fetchMyFeedback({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const feedback = response.feedback ?? null;

        setViewerState("customer");
        setMyFeedback(feedback);
        setRating(feedback?.rating ?? 0);
        setComment(feedback?.comment ?? "");
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        const status = error?.response?.status;

        if (status === 401 || status === 403) {
          setViewerState("guest");
          return;
        }

        setViewerState("unavailable");
      }
    }

    void loadMyFeedback();

    return () => {
      controller.abort();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error("Please choose a rating from 1 to 5 stars.");
      return;
    }

    const normalizedComment = comment.trim();

    if (!normalizedComment) {
      toast.error("Please write a comment.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        rating,
        comment: normalizedComment,
      };

      const response = myFeedback
        ? await updateMyFeedback(payload)
        : await createFeedback(payload);

      setMyFeedback(response.feedback);

      setRating(response.feedback?.rating ?? rating);

      setComment(response.feedback?.comment ?? normalizedComment);

      toast.success(
        response.message ||
          (myFeedback
            ? "Your feedback has been updated."
            : "Thank you for sharing your feedback."),
      );

      /*
       * New/updated reviews are ordered by newest.
       * Return to page one and refresh public reviews.
       */
      setPage(1);
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          myFeedback
            ? "Unable to update your feedback."
            : "Unable to share your feedback.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const { loading, feedbacks, summary, pagination, error } = feedbackState;

  const averageRating = Number(summary.averageRating ?? 0);

  const totalFeedbacks = Number(summary.totalFeedbacks ?? 0);

  return (
    <section
      className="
        relative
        overflow-hidden
        border-y
        border-brand-border
        bg-brand-ivory

        px-4
        py-14

        sm:px-6
        sm:py-20

        lg:px-10
        lg:py-24
      "
      aria-labelledby="customer-feedback-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* --------------------------------
            HEADER
        --------------------------------- */}

        <div
          className="
            flex
            flex-col
            gap-7

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[0.6rem]
                font-bold
                uppercase
                tracking-[0.24em]
                text-brand-bronze
              "
            >
              Customer stories
            </p>

            <h2
              id="customer-feedback-heading"
              className="
                mt-3
                max-w-lg
                font-display

                text-[2.7rem]
                font-medium
                leading-[0.9]
                tracking-[-0.05em]

                text-brand-espresso

                sm:text-[3.5rem]
                lg:text-[4.5rem]
              "
            >
              What our
              <span className="block italic">customers say.</span>
            </h2>
          </div>

          <div
            className="
              flex
              items-end
              justify-between
              gap-7

              lg:justify-end
            "
          >
            <div>
              <div className="flex items-end gap-2">
                <span
                  className="
                    font-display
                    text-[2.4rem]
                    font-medium
                    leading-none
                    tracking-[-0.04em]
                    text-brand-espresso
                  "
                >
                  {totalFeedbacks > 0 ? averageRating.toFixed(1) : "—"}
                </span>

                <span
                  className="
                    mb-1
                    text-sm
                    text-brand-espresso/45
                  "
                >
                  / 5
                </span>
              </div>

              <div className="mt-2">
                <Stars rating={Math.round(averageRating)} size={17} />
              </div>

              <p
                className="
                  mt-2
                  text-[0.64rem]
                  uppercase
                  tracking-[0.12em]
                  text-brand-espresso/45
                "
              >
                {totalFeedbacks === 0
                  ? "No reviews yet"
                  : `${totalFeedbacks} ${
                      totalFeedbacks === 1 ? "review" : "reviews"
                    }`}
              </p>
            </div>
          </div>
        </div>

        {/* --------------------------------
            REVIEWS — FOUR PER SLIDE
        --------------------------------- */}

        <div className="mt-10 sm:mt-14">
          <div
            key={`feedback-page-${page}`}
            className="
              grid
              grid-cols-2
              gap-2.5

              sm:gap-4

              lg:grid-cols-4
            "
          >
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <ReviewSkeleton key={index} />
              ))}

            {!loading &&
              !error &&
              feedbacks.map((feedback) => (
                <ReviewCard key={feedback.id} feedback={feedback} />
              ))}

            {!loading && !error && feedbacks.length === 0 && <EmptyReviews />}
          </div>

          {!loading && error && (
            <div
              className="
                border
                border-brand-border
                bg-white

                px-6
                py-10

                text-center
              "
            >
              <p
                className="
                  text-sm
                  text-brand-espresso/60
                "
              >
                {getApiErrorMessage(
                  error,
                  "Customer feedback could not be loaded.",
                )}
              </p>
            </div>
          )}

          {/* Slider navigation */}

          {!loading && !error && pagination.totalPages > 1 && (
            <div
              className="
                  mt-6
                  flex
                  items-center
                  justify-between

                  border-t
                  border-brand-border
                  pt-5
                "
            >
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setPage((currentPage) => Math.max(1, currentPage - 1))
                }
                aria-label="Previous four customer reviews"
                className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-brand-border

                    text-brand-espresso

                    transition

                    hover:border-brand-bronze
                    hover:text-brand-bronze

                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
              >
                <ArrowBackRoundedIcon />
              </button>

              <p
                className="
                    text-[0.65rem]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-brand-espresso/50
                  "
              >
                {String(page).padStart(2, "0")}
                <span className="mx-2 text-brand-espresso/20">/</span>
                {String(pagination.totalPages).padStart(2, "0")}
              </p>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(pagination.totalPages, currentPage + 1),
                  )
                }
                aria-label="Next four customer reviews"
                className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-brand-border

                    text-brand-espresso

                    transition

                    hover:border-brand-bronze
                    hover:text-brand-bronze

                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
              >
                <ArrowForwardRoundedIcon />
              </button>
            </div>
          )}
        </div>

        {/* --------------------------------
            CUSTOMER FEEDBACK FORM
        --------------------------------- */}

        <div
          className="
            mt-12
            border-t
            border-brand-border
            pt-10

            sm:mt-16
            sm:pt-14
          "
        >
          <div
            className="
              grid
              gap-10

              lg:grid-cols-12
              lg:gap-16
            "
          >
            <div className="lg:col-span-4">
              <p
                className="
                  text-[0.6rem]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-brand-bronze
                "
              >
                Butterfly Dream community
              </p>

              <p
                className="
                  mt-4
                  max-w-sm

                  text-sm
                  leading-6
                  text-brand-espresso/55
                "
              >
                Every review comes from a Butterfly Dream customer. Share your
                experience and help others discover pieces that become part of
                their own story.
              </p>
            </div>

            <div
              className="
                bg-brand-pale-champagne/35
                p-5

                sm:p-7

                lg:col-span-7
                lg:col-start-6
                lg:p-9
              "
            >
              {viewerState === "checking" && (
                <div className="animate-pulse">
                  <div className="h-3 w-28 bg-brand-pale-champagne" />

                  <div className="mt-5 h-8 w-64 bg-brand-pale-champagne" />

                  <div className="mt-8 h-24 bg-white" />
                </div>
              )}

              {viewerState === "customer" && (
                <FeedbackForm
                  rating={rating}
                  comment={comment}
                  existingFeedback={myFeedback}
                  isSubmitting={isSubmitting}
                  onRatingChange={setRating}
                  onCommentChange={setComment}
                  onSubmit={handleSubmit}
                />
              )}

              {viewerState === "guest" && <GuestReviewInvitation />}

              {viewerState === "unavailable" && (
                <div>
                  <h3
                    className="
                      font-display
                      text-2xl
                      font-medium
                      text-brand-espresso
                    "
                  >
                    Feedback form unavailable
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-brand-espresso/55
                    "
                  >
                    We couldn't verify your customer session right now. Please
                    try again shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeFeedback;
