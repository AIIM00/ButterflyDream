import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

// MUI Icons
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

// Context
import useAppContext from "../../context/app/useAppContext.js";

// Services
import {
  confirmPopupAttendance,
  createPopupComment,
  deletePopupComment,
  fetchCustomerPopupInteractions,
  fetchPopupComments,
  fetchPopupEvents,
  likePopupEvent,
  removePopupAttendance,
  unlikePopupEvent,
} from "../../services/popupEventApi.js";

/* =========================================================
   HELPERS
========================================================= */

function getInitials(fullName, fallback = "BD") {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return fallback;
  }

  const names = normalizedName.split(/\s+/).filter(Boolean);

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

/* =========================================================
   PHOTO CAROUSEL
========================================================= */

function PopupCarousel({ images = [], title }) {
  const containerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  function moveTo(index) {
    const container = containerRef.current;

    if (!container || images.length === 0) {
      return;
    }

    const normalizedIndex = Math.max(0, Math.min(index, images.length - 1));

    container.scrollTo({
      left: normalizedIndex * container.clientWidth,

      behavior: "smooth",
    });

    setActiveIndex(normalizedIndex);
  }

  function handleScroll() {
    const container = containerRef.current;

    if (!container || container.clientWidth === 0) {
      return;
    }

    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (images.length === 0) {
    return (
      <div
        className="
          flex
          aspect-[4/5]

          items-center
          justify-center

          bg-brand-surface-soft

          px-5

          text-center
          text-sm

          text-brand-text-muted

          sm:aspect-[4/3]
        "
      >
        No event photos
      </div>
    );
  }

  return (
    <div
      className="
        relative

        overflow-hidden

        bg-brand-surface-soft
      "
    >
      {/* ==================================================
          IMAGES
      ================================================== */}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex

          snap-x
          snap-mandatory

          overflow-x-auto

          scroll-smooth

          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden
        "
      >
        {images.map((image, index) => (
          <div
            key={image.id ?? image.mediaAssetId ?? index}
            className="
                aspect-[4/5]
                w-full
                shrink-0

                snap-center

                overflow-hidden

                sm:aspect-[4/3]

                lg:aspect-[16/10]
              "
          >
            <img
              src={image.imageUrl}
              alt={image.altText || `${title} photo ${index + 1}`}
              loading="lazy"
              draggable="false"
              className="
                  h-full
                  w-full

                  select-none

                  object-cover
                "
            />
          </div>
        ))}
      </div>

      {/* ==================================================
          IMAGE COUNT
      ================================================== */}

      {images.length > 1 && (
        <span
          className="
            absolute
            right-3
            top-3

            rounded-full

            bg-brand-dark-surface/85

            px-3
            py-1.5

            text-[0.6rem]
            font-semibold

            text-brand-surface

            backdrop-blur-md
          "
        >
          {activeIndex + 1}
          {" / "}
          {images.length}
        </span>
      )}

      {/* ==================================================
          ARROWS
      ================================================== */}

      {images.length > 1 && activeIndex > 0 && (
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => moveTo(activeIndex - 1)}
          className="
              absolute
              left-3
              top-1/2

              hidden
              h-11
              w-11

              -translate-y-1/2

              items-center
              justify-center

              rounded-full

              bg-brand-surface/90

              text-brand-text

              shadow-[0_6px_20px_rgba(0,0,0,0.12)]

              backdrop-blur-md

              transition-all
              duration-200

              hover:bg-brand-surface

              active:scale-90

              sm:inline-flex
            "
        >
          <KeyboardArrowLeftRoundedIcon />
        </button>
      )}

      {images.length > 1 && activeIndex < images.length - 1 && (
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => moveTo(activeIndex + 1)}
          className="
              absolute
              right-3
              top-1/2

              hidden
              h-11
              w-11

              -translate-y-1/2

              items-center
              justify-center

              rounded-full

              bg-brand-surface/90

              text-brand-text

              shadow-[0_6px_20px_rgba(0,0,0,0.12)]

              backdrop-blur-md

              transition-all
              duration-200

              hover:bg-brand-surface

              active:scale-90

              sm:inline-flex
            "
        >
          <KeyboardArrowRightRoundedIcon />
        </button>
      )}

      {/* ==================================================
          DOTS
      ================================================== */}

      {images.length > 1 && (
        <div
          className="
            absolute
            bottom-3
            left-1/2

            flex

            -translate-x-1/2

            items-center

            gap-1.5

            rounded-full

            bg-brand-dark-surface/40

            px-2.5
            py-2

            backdrop-blur-md
          "
        >
          {images.map((image, index) => (
            <button
              key={image.id ?? index}
              type="button"
              aria-label={`Go to photo ${index + 1}`}
              onClick={() => moveTo(index)}
              className={`
                  h-1.5

                  rounded-full

                  transition-all
                  duration-300

                  ${
                    index === activeIndex
                      ? `
                          w-4
                          bg-brand-surface
                        `
                      : `
                          w-1.5
                          bg-brand-surface/55
                        `
                  }
                `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMMENT
========================================================= */

function PopupComment({
  comment,
  currentUserId,
  isCustomer,
  isDeleting,
  onDelete,
}) {
  const canDelete = isCustomer && comment.user?.id === currentUserId;

  const userName = comment.user?.fullName || "Customer";

  const initials = getInitials(userName, "C");

  return (
    <div
      className="
        group/comment

        flex
        items-start

        gap-3
      "
    >
      {/* AVATAR */}

      <div
        className="
          flex
          h-8
          w-8
          shrink-0

          items-center
          justify-center

          rounded-full

          bg-brand-accent-soft

          text-[0.58rem]
          font-bold
          uppercase

          tracking-[0.04em]

          text-brand-accent-text
        "
      >
        {initials}
      </div>

      {/* COMMENT */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-sm
            leading-6

            text-brand-text
          "
        >
          <span
            className="
              mr-2

              font-semibold
            "
          >
            {userName}
          </span>

          <span
            className="
              text-brand-text-muted
            "
          >
            {comment.body}
          </span>
        </p>
      </div>

      {/* DELETE */}

      {canDelete && (
        <button
          type="button"
          title="Delete comment"
          aria-label="Delete comment"
          disabled={isDeleting}
          onClick={() => onDelete(comment.id)}
          className="
            inline-flex
            h-9
            w-9
            shrink-0

            items-center
            justify-center

            rounded-full

            text-brand-text-muted

            opacity-70

            transition-all
            duration-200

            hover:bg-brand-error/5
            hover:text-brand-error

            active:scale-90

            disabled:cursor-not-allowed
            disabled:opacity-30

            sm:opacity-0

            sm:group-hover/comment:opacity-100
          "
        >
          <DeleteOutlineRoundedIcon
            sx={{
              fontSize: 17,
            }}
          />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   POPUP POST
========================================================= */

function PopupPost({
  popup,
  interaction,
  isCustomer,
  currentUserId,
  currentUserName,
  mutationKey,
  onToggleLike,
  onToggleAttendance,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState(popup.recentComments ?? []);

  const [commentsExpanded, setCommentsExpanded] = useState(false);

  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentsPagination, setCommentsPagination] = useState(null);

  const [commentInput, setCommentInput] = useState("");

  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const social = popup.social ?? {};

  const liked = interaction?.liked ?? false;

  const attended = interaction?.attended ?? false;

  const likeBusy = mutationKey === `${popup.id}:like`;

  const attendanceBusy = mutationKey === `${popup.id}:attendance`;

  const customerInitials = getInitials(currentUserName, "C");

  /* =======================================================
     LOAD COMMENTS
  ======================================================= */

  async function loadComments() {
    if (commentsLoading) {
      return;
    }

    setCommentsLoading(true);

    try {
      const response = await fetchPopupComments(popup.id, {
        page: 1,
        limit: 20,
      });

      setComments(Array.isArray(response.comments) ? response.comments : []);

      setCommentsPagination(response.pagination ?? null);

      setCommentsLoaded(true);

      setCommentsExpanded(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  /* =======================================================
     TOGGLE COMMENTS
  ======================================================= */

  async function toggleComments() {
    if (commentsExpanded) {
      setCommentsExpanded(false);

      return;
    }

    if (commentsLoaded) {
      setCommentsExpanded(true);

      return;
    }

    await loadComments();
  }

  /* =======================================================
     LOAD MORE COMMENTS
  ======================================================= */

  async function loadMoreComments() {
    if (commentsLoading || !commentsPagination?.hasNextPage) {
      return;
    }

    setCommentsLoading(true);

    try {
      const nextPage = commentsPagination.page + 1;

      const response = await fetchPopupComments(popup.id, {
        page: nextPage,

        limit: commentsPagination.limit ?? 20,
      });

      const nextComments = Array.isArray(response.comments)
        ? response.comments
        : [];

      setComments((current) => {
        const existingIds = new Set(current.map((comment) => comment.id));

        return [
          ...current,

          ...nextComments.filter((comment) => !existingIds.has(comment.id)),
        ];
      });

      setCommentsPagination(response.pagination ?? null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load more comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  /* =======================================================
     COMMENT SUBMIT
  ======================================================= */

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!isCustomer || !popup.commentsEnabled || commentSubmitting) {
      return;
    }

    const comment = commentInput.trim();

    if (!comment) {
      return;
    }

    if (comment.length > 1000) {
      toast.error("Comment cannot exceed 1000 characters.");

      return;
    }

    setCommentSubmitting(true);

    try {
      const response = await createPopupComment(popup.id, comment);

      const createdComment = response.comment;

      if (createdComment) {
        if (commentsExpanded || commentsLoaded) {
          setComments((current) => [...current, createdComment]);

          setCommentsExpanded(true);
        } else {
          setComments((current) => [...current, createdComment].slice(-3));
        }
      }

      setCommentInput("");

      onCommentCountChange(
        popup.id,

        response.commentCount ?? (social.commentCount ?? 0) + 1,
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to post your comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  /* =======================================================
     DELETE COMMENT
  ======================================================= */

  async function handleDeleteComment(commentId) {
    if (!isCustomer || deletingCommentId) {
      return;
    }

    setDeletingCommentId(commentId);

    try {
      const response = await deletePopupComment(commentId);

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );

      onCommentCountChange(
        popup.id,

        response.commentCount ?? Math.max(0, (social.commentCount ?? 1) - 1),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to delete the comment.",
      );
    } finally {
      setDeletingCommentId(null);
    }
  }

  const visibleComments = commentsExpanded ? comments : comments.slice(-3);

  /* =========================================================
     POST
  ========================================================= */

  return (
    <article
      className="
        overflow-hidden

        border-y
        border-brand-border

        bg-brand-surface

        sm:rounded-[1.75rem]
        sm:border

        sm:shadow-[0_14px_40px_rgba(0,0,0,0.035)]
      "
    >
      {/* ==================================================
          POST HEADER
      ================================================== */}

      <header
        className="
          flex
          items-center
          justify-between

          gap-4

          px-4
          py-4

          sm:px-6
        "
      >
        <div
          className="
            flex
            min-w-0

            items-center

            gap-3
          "
        >
          {/* BRAND AVATAR */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0

              items-center
              justify-center

              rounded-full

              bg-brand-dark-surface

              font-display

              text-sm
              font-medium

              tracking-[0.03em]

              text-brand-accent-fill
            "
          >
            BD
          </div>

          <div className="min-w-0">
            <h2
              className="
                truncate

                text-sm
                font-semibold

                text-brand-text
              "
            >
              Butterfly Dream
            </h2>

            {(popup.location || popup.dateLabel) && (
              <div
                className="
                  mt-0.5

                  flex
                  flex-wrap

                  items-center

                  gap-x-2
                  gap-y-1

                  text-[0.65rem]

                  text-brand-text-muted
                "
              >
                {popup.location && (
                  <span
                    className="
                      inline-flex
                      items-center

                      gap-1
                    "
                  >
                    <LocationOnOutlinedIcon
                      sx={{
                        fontSize: 13,
                      }}
                    />

                    {popup.location}
                  </span>
                )}

                {popup.location && popup.dateLabel && (
                  <span aria-hidden="true">·</span>
                )}

                {popup.dateLabel && (
                  <span
                    className="
                      inline-flex
                      items-center

                      gap-1
                    "
                  >
                    <CalendarMonthOutlinedIcon
                      sx={{
                        fontSize: 13,
                      }}
                    />

                    {popup.dateLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <span
          className="
            shrink-0

            rounded-full

            bg-brand-accent-soft

            px-2.5
            py-1

            text-[0.52rem]
            font-bold
            uppercase

            tracking-[0.16em]

            text-brand-accent-text
          "
        >
          Pop-up
        </span>
      </header>

      {/* ==================================================
          PHOTOS
      ================================================== */}

      <PopupCarousel images={popup.images ?? []} title={popup.title} />

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="
          px-4
          pb-5
          pt-3

          sm:px-6
          sm:pb-6
          sm:pt-4
        "
      >
        {/* ==============================================
            SOCIAL ACTIONS
        ============================================== */}

        <div
          className="
            flex
            items-center

            gap-1
          "
        >
          {/* LIKE */}

          {isCustomer ? (
            <button
              type="button"
              aria-label={liked ? "Unlike popup" : "Like popup"}
              disabled={likeBusy}
              onClick={() => onToggleLike(popup.id, liked)}
              className={`
                inline-flex
                h-11
                w-11

                items-center
                justify-center

                rounded-full

                transition-all
                duration-200

                active:scale-90

                disabled:cursor-not-allowed
                disabled:opacity-50

                ${
                  liked
                    ? `
                        bg-brand-accent-soft
                        text-brand-accent-text
                      `
                    : `
                        text-brand-text

                        hover:bg-brand-primary/5
                      `
                }
              `}
            >
              {liked ? (
                <FavoriteRoundedIcon
                  sx={{
                    fontSize: 24,
                  }}
                />
              ) : (
                <FavoriteBorderRoundedIcon
                  sx={{
                    fontSize: 24,
                  }}
                />
              )}
            </button>
          ) : (
            <span
              className="
                inline-flex
                h-11
                w-11

                items-center
                justify-center

                text-brand-text
              "
            >
              <FavoriteBorderRoundedIcon
                sx={{
                  fontSize: 24,
                }}
              />
            </span>
          )}

          {/* COMMENTS */}

          <button
            type="button"
            aria-label="View comments"
            onClick={() => void toggleComments()}
            className="
              inline-flex
              h-11
              w-11

              items-center
              justify-center

              rounded-full

              text-brand-text

              transition-all
              duration-200

              hover:bg-brand-primary/5

              active:scale-90
            "
          >
            <ChatBubbleOutlineRoundedIcon
              sx={{
                fontSize: 23,
              }}
            />
          </button>
        </div>

        {/* ==============================================
            LIKE COUNT
        ============================================== */}

        <p
          className="
            mt-1

            text-sm
            font-semibold

            text-brand-text
          "
        >
          {social.likeCount ?? 0}{" "}
          {(social.likeCount ?? 0) === 1 ? "like" : "likes"}
        </p>

        {/* ==============================================
            ATTENDANCE
        ============================================== */}

        <div
          className="
            mt-4

            flex
            flex-wrap

            items-center

            gap-x-3
            gap-y-2
          "
        >
          {isCustomer && (
            <button
              type="button"
              disabled={attendanceBusy}
              onClick={() => onToggleAttendance(popup.id, attended)}
              className={`
                inline-flex
                min-h-10

                items-center
                justify-center

                gap-2

                rounded-full

                border

                px-4

                text-xs
                font-semibold

                transition-all
                duration-200

                active:scale-[0.97]

                disabled:cursor-not-allowed
                disabled:opacity-50

                ${
                  attended
                    ? `
                        border-brand-primary
                        bg-brand-primary
                        text-brand-surface
                      `
                    : `
                        border-brand-border
                        bg-brand-surface-soft
                        text-brand-text

                        hover:border-brand-accent-fill/50
                      `
                }
              `}
            >
              {attended ? (
                <>
                  <CheckRoundedIcon
                    sx={{
                      fontSize: 17,
                    }}
                  />
                  You were there
                </>
              ) : (
                <>
                  <PeopleAltOutlinedIcon
                    sx={{
                      fontSize: 17,
                    }}
                  />
                  I was there
                </>
              )}
            </button>
          )}

          <p
            className="
              text-xs

              text-brand-text-muted
            "
          >
            <span
              className="
                font-semibold

                text-brand-text
              "
            >
              {social.attendanceCount ?? 0}
            </span>{" "}
            {(social.attendanceCount ?? 0) === 1
              ? "person was there"
              : "people were there"}
          </p>
        </div>

        {/* ==============================================
            CAPTION
        ============================================== */}

        <div
          className="
            mt-5

            border-t
            border-brand-border

            pt-5
          "
        >
          <p
            className="
              text-[0.56rem]
              font-bold
              uppercase

              tracking-[0.17em]

              text-brand-accent-text
            "
          >
            The story
          </p>

          <h3
            className="
              mt-1

              font-display

              text-2xl
              font-medium

              leading-tight

              tracking-[-0.03em]

              text-brand-text

              sm:text-3xl
            "
          >
            {popup.title}
          </h3>

          <p
            className="
              mt-3

              whitespace-pre-line

              text-sm
              leading-7

              text-brand-text-muted
            "
          >
            {popup.caption}
          </p>
        </div>

        {/* ==============================================
            COMMENTS
        ============================================== */}

        <div className="mt-5">
          {(social.commentCount ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => void toggleComments()}
              className="
                inline-flex
                min-h-9

                items-center

                rounded-full

                px-1

                text-xs
                font-semibold

                text-brand-text-muted

                transition-colors

                hover:text-brand-text
              "
            >
              {commentsLoading
                ? "Loading comments..."
                : commentsExpanded
                  ? "Hide comments"
                  : `View ${social.commentCount} ${
                      social.commentCount === 1 ? "comment" : "comments"
                    }`}
            </button>
          )}

          {/* COMMENTS LIST */}

          {visibleComments.length > 0 && (
            <div
              className="
                mt-4

                space-y-4
              "
            >
              {visibleComments.map((comment) => (
                <PopupComment
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  isCustomer={isCustomer}
                  isDeleting={deletingCommentId === comment.id}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}

          {/* LOAD MORE COMMENTS */}

          {commentsExpanded && commentsPagination?.hasNextPage && (
            <button
              type="button"
              disabled={commentsLoading}
              onClick={() => void loadMoreComments()}
              className="
                  mt-4

                  inline-flex
                  min-h-9

                  items-center

                  rounded-full

                  px-2

                  text-xs
                  font-semibold

                  text-brand-accent-text

                  transition-colors

                  hover:text-brand-accent-text-hover

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
            >
              {commentsLoading ? "Loading..." : "Load more comments"}
            </button>
          )}

          {/* ==============================================
              COMMENT FORM
          ============================================== */}

          {isCustomer && popup.commentsEnabled && (
            <form
              onSubmit={handleCommentSubmit}
              className="
                  mt-5

                  flex
                  items-center

                  gap-3

                  border-t
                  border-brand-border

                  pt-4
                "
            >
              {/* CUSTOMER AVATAR */}

              <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-accent-soft

                    text-[0.58rem]
                    font-bold
                    uppercase

                    tracking-[0.04em]

                    text-brand-accent-text
                  "
              >
                {customerInitials}
              </div>

              {/* INPUT */}

              <div
                className="
                    flex
                    min-w-0
                    flex-1

                    items-center

                    rounded-full

                    border
                    border-brand-border

                    bg-brand-surface-soft

                    pl-4
                    pr-1.5

                    transition-all

                    focus-within:border-brand-accent-fill
                    focus-within:bg-brand-surface
                    focus-within:ring-2
                    focus-within:ring-brand-accent-fill/10
                  "
              >
                <input
                  type="text"
                  value={commentInput}
                  maxLength={1000}
                  disabled={commentSubmitting}
                  onChange={(event) => setCommentInput(event.target.value)}
                  placeholder="Add a comment..."
                  className="
                      min-h-11
                      min-w-0
                      flex-1

                      bg-transparent

                      py-2

                      text-sm

                      text-brand-text

                      outline-none

                      placeholder:text-brand-text-muted/60
                    "
                />

                <button
                  type="submit"
                  aria-label="Post comment"
                  disabled={commentSubmitting || !commentInput.trim()}
                  className="
                      inline-flex
                      h-9
                      w-9
                      shrink-0

                      items-center
                      justify-center

                      rounded-full

                      bg-brand-primary

                      text-brand-surface

                      transition-all
                      duration-200

                      hover:bg-brand-primary-hover

                      active:scale-90

                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                >
                  <SendRoundedIcon
                    sx={{
                      fontSize: 16,
                    }}
                  />
                </button>
              </div>
            </form>
          )}

          {/* COMMENTS CLOSED */}

          {isCustomer && !popup.commentsEnabled && (
            <p
              className="
                  mt-5

                  border-t
                  border-brand-border

                  pt-4

                  text-xs

                  text-brand-text-muted
                "
            >
              Comments are closed for this post.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

function PopupsPage() {
  const { user, isAuthenticated, authLoading } = useAppContext();

  const isCustomer =
    !authLoading && isAuthenticated && user?.role === "CUSTOMER";

  const [popupEvents, setPopupEvents] = useState([]);

  const [interactions, setInteractions] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [pagination, setPagination] = useState(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [mutationKey, setMutationKey] = useState(null);

  /* =======================================================
     LOAD PUBLIC POSTS
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    fetchPopupEvents(
      {
        page: 1,
        limit: 10,
      },
      {
        signal: controller.signal,
      },
    )
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        setPopupEvents(
          Array.isArray(response.popupEvents) ? response.popupEvents : [],
        );

        setPagination(response.pagination ?? null);

        setLoadError(null);
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setLoadError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  /* =======================================================
     CUSTOMER INTERACTIONS
  ======================================================= */

  useEffect(() => {
    if (!isCustomer || popupEvents.length === 0) {
      return undefined;
    }

    const controller = new AbortController();

    const ids = popupEvents.map((popup) => popup.id);

    fetchCustomerPopupInteractions(ids, {
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        setInteractions((current) => ({
          ...current,

          ...(response.interactions ?? {}),
        }));
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        console.error("Unable to load popup interactions:", error);
      });

    return () => {
      controller.abort();
    };
  }, [isCustomer, popupEvents]);

  /* =======================================================
     UPDATE SOCIAL
  ======================================================= */

  function updateSocial(popupEventId, changes) {
    setPopupEvents((current) =>
      current.map((popup) =>
        popup.id === popupEventId
          ? {
              ...popup,

              social: {
                ...popup.social,
                ...changes,
              },
            }
          : popup,
      ),
    );
  }

  /* =======================================================
     LIKE
  ======================================================= */

  async function handleToggleLike(popupEventId, currentlyLiked) {
    if (!isCustomer || mutationKey) {
      return;
    }

    setMutationKey(`${popupEventId}:like`);

    try {
      const response = currentlyLiked
        ? await unlikePopupEvent(popupEventId)
        : await likePopupEvent(popupEventId);

      setInteractions((current) => ({
        ...current,

        [popupEventId]: {
          ...current[popupEventId],

          liked: response.liked,
        },
      }));

      updateSocial(popupEventId, {
        likeCount: response.likeCount,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update your like.",
      );
    } finally {
      setMutationKey(null);
    }
  }

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  async function handleToggleAttendance(popupEventId, currentlyAttended) {
    if (!isCustomer || mutationKey) {
      return;
    }

    setMutationKey(`${popupEventId}:attendance`);

    try {
      const response = currentlyAttended
        ? await removePopupAttendance(popupEventId)
        : await confirmPopupAttendance(popupEventId);

      setInteractions((current) => ({
        ...current,

        [popupEventId]: {
          ...current[popupEventId],

          attended: response.attended,
        },
      }));

      updateSocial(popupEventId, {
        attendanceCount: response.attendanceCount,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update attendance.",
      );
    } finally {
      setMutationKey(null);
    }
  }

  /* =======================================================
     COMMENT COUNT
  ======================================================= */

  function handleCommentCountChange(popupEventId, commentCount) {
    updateSocial(popupEventId, {
      commentCount,
    });
  }

  /* =======================================================
     LOAD MORE POSTS
  ======================================================= */

  async function loadMorePosts() {
    if (isLoadingMore || !pagination?.hasNextPage) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetchPopupEvents({
        page: pagination.page + 1,

        limit: pagination.limit ?? 10,
      });

      const nextEvents = Array.isArray(response.popupEvents)
        ? response.popupEvents
        : [];

      setPopupEvents((current) => {
        const existingIds = new Set(current.map((popup) => popup.id));

        return [
          ...current,

          ...nextEvents.filter((popup) => !existingIds.has(popup.id)),
        ];
      });

      setPagination(response.pagination ?? null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load more posts.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main
      className="
        min-h-screen

        bg-brand-page

        text-brand-text
      "
    >
      {/* ==================================================
          HERO
      ================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl

          px-4
          pb-9
          pt-8

          sm:px-6
          sm:pb-12
          sm:pt-12

          lg:px-8
          lg:pb-14
          lg:pt-16
        "
      >
        <p
          className="
            text-[0.62rem]
            font-bold
            uppercase

            tracking-[0.2em]

            text-brand-accent-text
          "
        >
          Butterfly Dream in the world
        </p>

        <div
          className="
            mt-4

            grid

            gap-5

            lg:grid-cols-12
            lg:items-end
          "
        >
          <div className="lg:col-span-8">
            <h1
              className="
                max-w-3xl

                font-display

                text-[3.15rem]
                font-medium

                leading-[0.9]

                tracking-[-0.055em]

                text-brand-text

                sm:text-6xl

                lg:text-7xl
              "
            >
              Pop-ups
              <span
                className="
                  block
                  italic
                "
              >
                &amp; Events.
              </span>
            </h1>
          </div>

          <div className="lg:col-span-4">
            <p
              className="
                max-w-md

                text-sm
                leading-7

                text-brand-text-muted
              "
            >
              Discover the places, people, and moments that have become part of
              the Butterfly Dream story.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          FEED
      ================================================== */}

      <section
        className="
          pb-20

          sm:px-6

          lg:pb-28
        "
      >
        <div
          className="
            mx-auto
            max-w-4xl

            space-y-7

            sm:space-y-9
          "
        >
          {/* ==============================================
              LOADING
          ============================================== */}

          {isLoading && (
            <>
              {Array.from({
                length: 2,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    overflow-hidden

                    border-y
                    border-brand-border

                    bg-brand-surface

                    sm:rounded-[1.75rem]
                    sm:border
                  "
                >
                  <div
                    className="
                      h-16

                      animate-pulse

                      bg-brand-surface-soft
                    "
                  />

                  <div
                    className="
                      aspect-[4/5]

                      animate-pulse

                      bg-brand-surface-soft/70

                      sm:aspect-[4/3]
                    "
                  />

                  <div
                    className="
                      h-48

                      animate-pulse

                      bg-brand-surface
                    "
                  />
                </div>
              ))}
            </>
          )}

          {/* ==============================================
              ERROR
          ============================================== */}

          {!isLoading && loadError && (
            <div
              className="
                  mx-4

                  rounded-[1.75rem]

                  border
                  border-brand-error/20

                  bg-brand-surface

                  px-6
                  py-12

                  text-center

                  sm:mx-0
                "
            >
              <span
                className="
                    mx-auto

                    inline-flex
                    h-14
                    w-14

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-error/10

                    text-brand-error
                  "
              >
                !
              </span>

              <h2
                className="
                    mt-5

                    font-display

                    text-2xl
                    font-medium

                    tracking-[-0.03em]

                    text-brand-text
                  "
              >
                We couldn’t load the pop-up stories.
              </h2>

              <p
                className="
                    mx-auto
                    mt-3
                    max-w-md

                    text-sm
                    leading-6

                    text-brand-text-muted
                  "
              >
                {loadError?.response?.data?.message ||
                  loadError?.message ||
                  "Please try again."}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="
                    mt-6

                    inline-flex
                    min-h-11

                    items-center
                    justify-center

                    rounded-full

                    bg-brand-primary

                    px-5

                    text-sm
                    font-semibold

                    text-brand-surface

                    transition-all

                    hover:bg-brand-primary-hover

                    active:scale-[0.98]
                  "
              >
                Try again
              </button>
            </div>
          )}

          {/* ==============================================
              EMPTY
          ============================================== */}

          {!isLoading && !loadError && popupEvents.length === 0 && (
            <div
              className="
                  relative

                  mx-4

                  overflow-hidden

                  rounded-[1.75rem]

                  border
                  border-brand-border

                  bg-brand-surface-soft

                  px-6
                  py-16

                  text-center

                  sm:mx-0
                "
            >
              <span
                aria-hidden="true"
                className="
                    pointer-events-none

                    absolute
                    -right-16
                    -top-16

                    h-44
                    w-44

                    rounded-full

                    border
                    border-brand-accent-fill/20
                  "
              />

              <div className="relative z-10">
                <p
                  className="
                      text-[0.6rem]
                      font-bold
                      uppercase

                      tracking-[0.2em]

                      text-brand-accent-text
                    "
                >
                  Our story continues
                </p>

                <h2
                  className="
                      mx-auto
                      mt-4
                      max-w-md

                      font-display

                      text-3xl
                      font-medium

                      tracking-[-0.04em]

                      text-brand-text
                    "
                >
                  Our pop-up memories are coming soon.
                </h2>

                <p
                  className="
                      mx-auto
                      mt-4
                      max-w-sm

                      text-sm
                      leading-6

                      text-brand-text-muted
                    "
                >
                  Moments, places, and stories from Butterfly Dream events will
                  live here.
                </p>
              </div>
            </div>
          )}

          {/* ==============================================
              POSTS
          ============================================== */}

          {!isLoading &&
            !loadError &&
            popupEvents.map((popup) => (
              <PopupPost
                key={popup.id}
                popup={popup}
                interaction={
                  interactions[popup.id] ?? {
                    liked: false,
                    attended: false,
                  }
                }
                isCustomer={isCustomer}
                currentUserId={user?.id ?? null}
                currentUserName={user?.fullName ?? null}
                mutationKey={mutationKey}
                onToggleLike={handleToggleLike}
                onToggleAttendance={handleToggleAttendance}
                onCommentCountChange={handleCommentCountChange}
              />
            ))}

          {/* ==============================================
              LOAD MORE
          ============================================== */}

          {!isLoading && !loadError && pagination?.hasNextPage && (
            <div
              className="
                  px-4

                  text-center

                  sm:px-0
                "
            >
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => void loadMorePosts()}
                className="
                    inline-flex
                    min-h-12

                    items-center
                    justify-center

                    rounded-full

                    border
                    border-brand-primary

                    bg-transparent

                    px-6

                    text-sm
                    font-semibold

                    text-brand-primary

                    transition-all

                    hover:bg-brand-primary
                    hover:text-brand-surface

                    active:scale-[0.98]

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
              >
                {isLoadingMore ? "Loading..." : "Discover more moments"}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default PopupsPage;
