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

/*
 * ======================================================
 * PHOTO CAROUSEL
 * ======================================================
 */

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

  if (images.length === 0) {
    return (
      <div
        className="
          flex
          aspect-[4/5]
          items-center
          justify-center
          bg-brand-cream
          text-sm
          text-brand-muted

          sm:aspect-[4/3]
        "
      >
        No event photos
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-brand-cream">
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

      {/* IMAGE COUNT */}
      {images.length > 1 && (
        <span
          className="
            absolute
            right-3
            top-3
            rounded-full
            bg-brand-espresso/80
            px-3
            py-1.5
            text-[0.65rem]
            font-semibold
            text-white
            backdrop-blur-sm
          "
        >
          {activeIndex + 1}
          {" / "}
          {images.length}
        </span>
      )}

      {/* DESKTOP / TABLET ARROWS */}
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
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/90
              text-brand-espresso
              shadow-sm
              backdrop-blur-sm
              transition
              hover:bg-white

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
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/90
              text-brand-espresso
              shadow-sm
              backdrop-blur-sm
              transition
              hover:bg-white

              sm:inline-flex
            "
        >
          <KeyboardArrowRightRoundedIcon />
        </button>
      )}

      {/* DOTS */}
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
            bg-brand-espresso/40
            px-2.5
            py-2
            backdrop-blur-sm
          "
        >
          {images.map((image, index) => (
            <button
              key={image.id ?? index}
              type="button"
              aria-label={`Go to photo ${index + 1}`}
              onClick={() => moveTo(index)}
              className={[
                `
                    h-1.5
                    rounded-full
                    transition-all
                    duration-300
                  `,

                index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/55",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ======================================================
 * COMMENT
 * ======================================================
 */

function PopupComment({
  comment,
  currentUserId,
  isCustomer,
  isDeleting,
  onDelete,
}) {
  const canDelete = isCustomer && comment.user?.id === currentUserId;

  const userName = comment.user?.fullName || "Customer";

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div
      className="
        group
        flex
        items-start
        gap-3
      "
    >
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-brand-pale-champagne
          text-xs
          font-bold
          uppercase
          text-brand-espresso
        "
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-sm
            leading-6
            text-brand-espresso
          "
        >
          <span className="mr-2 font-semibold">{userName}</span>

          <span className="text-brand-muted">{comment.body}</span>
        </p>
      </div>

      {canDelete && (
        <button
          type="button"
          title="Delete comment"
          disabled={isDeleting}
          onClick={() => onDelete(comment.id)}
          className="
            inline-flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            text-brand-muted
            opacity-70
            transition
            hover:bg-red-50
            hover:text-red-600
            disabled:opacity-30

            sm:opacity-0
            sm:group-hover:opacity-100
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

/*
 * ======================================================
 * POPUP POST
 * ======================================================
 */

function PopupPost({
  popup,
  interaction,
  isCustomer,
  currentUserId,
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

  return (
    <article
      className="
        overflow-hidden
        border-y
        border-brand-border
        bg-brand-surface

        sm:rounded-[1.75rem]
        sm:border
      "
    >
      {/* POST HEADER */}
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
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-brand-espresso
              font-display
              text-lg
              text-brand-champagne
            "
          >
            B
          </div>

          <div className="min-w-0">
            <h2
              className="
                truncate
                text-sm
                font-semibold
                text-brand-espresso
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
                  text-[0.68rem]
                  text-brand-muted
                "
              >
                {popup.location && (
                  <span className="inline-flex items-center gap-1">
                    <LocationOnOutlinedIcon
                      sx={{
                        fontSize: 13,
                      }}
                    />

                    {popup.location}
                  </span>
                )}

                {popup.location && popup.dateLabel && <span>·</span>}

                {popup.dateLabel && (
                  <span className="inline-flex items-center gap-1">
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

        <p
          className="
            shrink-0
            text-[0.58rem]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-brand-bronze
          "
        >
          Pop-up
        </p>
      </header>

      {/* PHOTOS */}
      <PopupCarousel images={popup.images ?? []} title={popup.title} />

      {/* SOCIAL ACTIONS */}
      <div
        className="
          px-4
          pb-5
          pt-4

          sm:px-6
          sm:pb-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          {/* LIKE */}
          {isCustomer ? (
            <button
              type="button"
              aria-label={liked ? "Unlike popup" : "Like popup"}
              disabled={likeBusy}
              onClick={() => onToggleLike(popup.id, liked)}
              className={[
                `
                  inline-flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  transition
                  disabled:opacity-50
                `,

                liked
                  ? "text-red-500"
                  : "text-brand-espresso hover:bg-brand-cream",
              ].join(" ")}
            >
              {liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
            </button>
          ) : (
            <span
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                text-brand-espresso
              "
            >
              <FavoriteBorderRoundedIcon />
            </span>
          )}

          {/* COMMENTS */}
          <button
            type="button"
            aria-label="View comments"
            onClick={() => void toggleComments()}
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-brand-espresso
              transition
              hover:bg-brand-cream
            "
          >
            <ChatBubbleOutlineRoundedIcon />
          </button>
        </div>

        {/* LIKE COUNT */}
        <p
          className="
            mt-1
            text-sm
            font-semibold
            text-brand-espresso
          "
        >
          {social.likeCount ?? 0}{" "}
          {(social.likeCount ?? 0) === 1 ? "like" : "likes"}
        </p>

        {/* I WAS THERE */}
        {isCustomer ? (
          <button
            type="button"
            disabled={attendanceBusy}
            onClick={() => onToggleAttendance(popup.id, attended)}
            className={[
              `
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-2.5
                text-xs
                font-semibold
                transition
                disabled:opacity-50
              `,

              attended
                ? "border-brand-espresso bg-brand-espresso text-white"
                : "border-brand-border bg-brand-cream text-brand-espresso hover:border-brand-espresso",
            ].join(" ")}
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
        ) : null}

        <p
          className="
            mt-2
            text-xs
            text-brand-muted
          "
        >
          <span className="font-semibold text-brand-espresso">
            {social.attendanceCount ?? 0}
          </span>{" "}
          {(social.attendanceCount ?? 0) === 1
            ? "person was there"
            : "people were there"}
        </p>

        {/* FULL-WIDTH CAPTION */}
        <div
          className="
            mt-5
            border-t
            border-brand-border
            pt-5
          "
        >
          <h3
            className="
              font-display
              text-2xl
              font-medium
              leading-tight
              tracking-[-0.03em]
              text-brand-espresso

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
              text-brand-muted
            "
          >
            {popup.caption}
          </p>
        </div>

        {/* COMMENTS */}
        <div className="mt-5">
          {(social.commentCount ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => void toggleComments()}
              className="
                text-xs
                font-semibold
                text-brand-muted
                transition
                hover:text-brand-espresso
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

          {visibleComments.length > 0 && (
            <div className="mt-4 space-y-4">
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

          {commentsExpanded && commentsPagination?.hasNextPage && (
            <button
              type="button"
              disabled={commentsLoading}
              onClick={() => void loadMoreComments()}
              className="
                  mt-4
                  text-xs
                  font-semibold
                  text-brand-bronze
                  disabled:opacity-50
                "
            >
              {commentsLoading ? "Loading..." : "Load more comments"}
            </button>
          )}

          {/* COMMENT FORM */}
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
              <div
                className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-pale-champagne
                    text-xs
                    font-bold
                    uppercase
                    text-brand-espresso
                  "
              >
                {String(currentUserId ? "Y" : "C")}
              </div>

              <input
                type="text"
                value={commentInput}
                maxLength={1000}
                disabled={commentSubmitting}
                onChange={(event) => setCommentInput(event.target.value)}
                placeholder="Add a comment..."
                className="
                    min-w-0
                    flex-1
                    bg-transparent
                    py-2
                    text-sm
                    text-brand-espresso
                    outline-none
                    placeholder:text-brand-muted/70
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
                    bg-brand-espresso
                    text-white
                    transition
                    hover:bg-brand-emerald
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
              >
                <SendRoundedIcon
                  sx={{
                    fontSize: 17,
                  }}
                />
              </button>
            </form>
          )}

          {isCustomer && !popup.commentsEnabled && (
            <p
              className="
                  mt-5
                  border-t
                  border-brand-border
                  pt-4
                  text-xs
                  text-brand-muted
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

/*
 * ======================================================
 * PAGE
 * ======================================================
 */

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

  /*
   * Load public posts.
   */
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

  /*
   * Load private CUSTOMER interaction state.
   *
   * Guests and ADMIN sessions intentionally
   * do not call CUSTOMER-only endpoints.
   */
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

  function handleCommentCountChange(popupEventId, commentCount) {
    updateSocial(popupEventId, {
      commentCount,
    });
  }

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

  return (
    <main
      className="
        min-h-screen
        bg-brand-ivory
        text-brand-espresso
      "
    >
      {/* HERO */}
      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-10
          pt-8

          sm:px-6
          sm:pb-14
          sm:pt-12

          lg:px-8
          lg:pb-16
          lg:pt-16
        "
      >
        <p
          className="
            text-[0.65rem]
            font-bold
            uppercase
            tracking-[0.22em]
            text-brand-bronze
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
                text-[3.25rem]
                font-medium
                leading-[0.9]
                tracking-[-0.055em]
                text-brand-espresso

                sm:text-6xl

                lg:text-7xl
              "
            >
              Pop-ups
              <span className="block italic">& Events.</span>
            </h1>
          </div>

          <div
            className="
              lg:col-span-4
            "
          >
            <p
              className="
                max-w-md
                text-sm
                leading-7
                text-brand-muted
              "
            >
              Discover the places, people and moments that have become part of
              the Butterfly Dream story.
            </p>
          </div>
        </div>
      </section>

      {/* FEED */}
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
            space-y-8

            sm:space-y-10
          "
        >
          {/* LOADING */}
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
                        bg-brand-cream
                      "
                  />

                  <div
                    className="
                        aspect-[4/5]
                        animate-pulse
                        bg-brand-cream/70

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

          {/* ERROR */}
          {!isLoading && loadError && (
            <div
              className="
                  mx-4
                  rounded-[1.5rem]
                  border
                  border-red-200
                  bg-red-50
                  px-6
                  py-12
                  text-center

                  sm:mx-0
                "
            >
              <p className="font-semibold text-red-900">
                We couldn’t load the popup stories.
              </p>

              <p className="mt-2 text-sm text-red-700">
                {loadError?.response?.data?.message ||
                  loadError?.message ||
                  "Please try again."}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="
                    mt-5
                    rounded-full
                    bg-red-900
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                  "
              >
                Try again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !loadError && popupEvents.length === 0 && (
            <div
              className="
                  mx-4
                  rounded-[1.75rem]
                  border
                  border-brand-border
                  bg-brand-surface
                  px-6
                  py-16
                  text-center

                  sm:mx-0
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
                    text-brand-espresso
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
                    text-brand-muted
                  "
              >
                Moments, places and stories from Butterfly Dream events will
                live here.
              </p>
            </div>
          )}

          {/* POSTS */}
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
                mutationKey={mutationKey}
                onToggleLike={handleToggleLike}
                onToggleAttendance={handleToggleAttendance}
                onCommentCountChange={handleCommentCountChange}
              />
            ))}

          {/* LOAD MORE */}
          {!isLoading && !loadError && pagination?.hasNextPage && (
            <div className="px-4 text-center sm:px-0">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => void loadMorePosts()}
                className="
                    rounded-full
                    border
                    border-brand-espresso
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-brand-espresso
                    transition
                    hover:bg-brand-espresso
                    hover:text-white
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
