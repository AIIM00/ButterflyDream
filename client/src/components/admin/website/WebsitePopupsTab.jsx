import { useEffect, useState } from "react";

// Toast
import { toast } from "react-toastify";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

// Components
import MediaPickerDialog from "./MediaPickerDialog.jsx";

// Services
import {
  createAdminPopupEvent,
  fetchAdminPopupEvents,
  reorderAdminPopupEvents,
  updateAdminPopupEvent,
  updateAdminPopupEventStatus,
} from "../../../services/adminPopupEvents.js";

const EMPTY_DRAFT = {
  title: "",
  location: "",
  dateLabel: "",
  caption: "",
  commentsEnabled: true,
  images: [],
};

function getStatusClasses(status) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700";

    case "ARCHIVED":
      return "bg-gray-100 text-gray-500";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

function formatStatus(status) {
  switch (status) {
    case "PUBLISHED":
      return "Published";

    case "ARCHIVED":
      return "Archived";

    default:
      return "Draft";
  }
}

function PopupEditorDialog({ popup, isSaving, onClose, onSaved }) {
  const isEditing = Boolean(popup);

  const [draft, setDraft] = useState(() => ({
    ...EMPTY_DRAFT,

    ...(popup
      ? {
          title: popup.title ?? "",
          location: popup.location ?? "",
          dateLabel: popup.dateLabel ?? "",
          caption: popup.caption ?? "",
          commentsEnabled: popup.commentsEnabled !== false,

          images:
            popup.images?.map((image) => ({
              mediaAssetId: image.mediaAssetId,
              imageUrl: image.imageUrl,
              fileName: image.fileName ?? "",
              altText: image.altText ?? "",
            })) ?? [],
        }
      : {}),
  }));

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  function updateField(key, value) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSelectedMedia(assets) {
    setDraft((current) => {
      /*
       * Preserve alt text already edited by the admin.
       */
      const currentById = new Map(
        current.images.map((image) => [image.mediaAssetId, image]),
      );

      const images = assets.map((asset) => {
        const existing = currentById.get(asset.id);

        return {
          mediaAssetId: asset.id,
          imageUrl: asset.imageUrl,
          fileName: asset.fileName ?? "",
          altText: existing?.altText ?? asset.altText ?? "",
        };
      });

      return {
        ...current,
        images,
      };
    });

    setMediaPickerOpen(false);
  }

  function removeImage(index) {
    setDraft((current) => ({
      ...current,

      images: current.images.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  }

  function moveImage(index, direction) {
    setDraft((current) => {
      const destinationIndex = index + direction;

      if (destinationIndex < 0 || destinationIndex >= current.images.length) {
        return current;
      }

      const images = [...current.images];

      [images[index], images[destinationIndex]] = [
        images[destinationIndex],
        images[index],
      ];

      return {
        ...current,
        images,
      };
    });
  }

  function updateImageAltText(index, value) {
    setDraft((current) => ({
      ...current,

      images: current.images.map((image, currentIndex) =>
        currentIndex === index
          ? {
              ...image,
              altText: value,
            }
          : image,
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!draft.title.trim()) {
      toast.error("Enter a popup title.");
      return;
    }

    if (!draft.caption.trim()) {
      toast.error("Enter a caption.");
      return;
    }

    await onSaved({
      title: draft.title.trim(),

      location: draft.location.trim() || null,

      dateLabel: draft.dateLabel.trim() || null,

      caption: draft.caption.trim(),

      commentsEnabled: draft.commentsEnabled,

      images: draft.images.map((image) => ({
        mediaAssetId: image.mediaAssetId,

        altText: image.altText.trim() || null,
      })),
    });
  }

  return (
    <>
      <div
        className="
          fixed
          inset-0
          z-[80]
          flex
          items-center
          justify-center
          p-4
        "
      >
        <button
          type="button"
          aria-label="Close popup editor"
          disabled={isSaving}
          onClick={onClose}
          className="
            absolute
            inset-0
            bg-gray-950/60
          "
        />

        <form
          onSubmit={handleSubmit}
          className="
            relative
            z-10
            flex
            max-h-[92vh]
            w-full
            max-w-3xl
            flex-col
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          "
        >
          {/* HEADER */}
          <header
            className="
              flex
              items-start
              justify-between
              gap-5
              border-b
              border-gray-200
              px-6
              py-5
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-gray-500
                "
              >
                Pop-ups & Events
              </p>

              <h3
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-gray-950
                "
              >
                {isEditing ? "Edit popup post" : "Create popup post"}
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                {isEditing
                  ? "Update the event story, photos, and customer interaction settings."
                  : "Create a new event story and choose its photos from the Media Library."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Close"
              className="
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-950
                disabled:opacity-40
              "
            >
              <CloseRoundedIcon />
            </button>
          </header>

          {/* FORM */}
          <div
            className="
              flex-1
              overflow-y-auto
              px-6
              py-6
            "
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {/* TITLE */}
              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-gray-800">
                  Event title
                </span>

                <input
                  type="text"
                  value={draft.title}
                  disabled={isSaving}
                  maxLength={160}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Butterfly Dream at..."
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    text-gray-950
                    outline-none
                    transition
                    focus:border-gray-950
                    focus:ring-2
                    focus:ring-gray-950/10
                  "
                />
              </label>

              {/* LOCATION */}
              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Location
                </span>

                <input
                  type="text"
                  value={draft.location}
                  disabled={isSaving}
                  maxLength={180}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  placeholder="Beirut, Lebanon"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                    focus:ring-2
                    focus:ring-gray-950/10
                  "
                />
              </label>

              {/* DATE */}
              <label>
                <span className="text-sm font-semibold text-gray-800">
                  Date label
                </span>

                <input
                  type="text"
                  value={draft.dateLabel}
                  disabled={isSaving}
                  maxLength={80}
                  onChange={(event) =>
                    updateField("dateLabel", event.target.value)
                  }
                  placeholder="May 14–16, 2026"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-950
                    focus:ring-2
                    focus:ring-gray-950/10
                  "
                />
              </label>

              {/* CAPTION */}
              <label className="sm:col-span-2">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <span className="text-sm font-semibold text-gray-800">
                    Caption
                  </span>

                  <span className="text-xs text-gray-400">
                    {draft.caption.length}/5000
                  </span>
                </div>

                <textarea
                  value={draft.caption}
                  disabled={isSaving}
                  maxLength={5000}
                  rows={8}
                  onChange={(event) =>
                    updateField("caption", event.target.value)
                  }
                  placeholder="Tell the full story of this Butterfly Dream popup..."
                  className="
                    mt-2
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-gray-950
                    outline-none
                    transition
                    focus:border-gray-950
                    focus:ring-2
                    focus:ring-gray-950/10
                  "
                />
              </label>

              {/* COMMENTS */}
              <label
                className="
                  sm:col-span-2
                  flex
                  items-center
                  justify-between
                  gap-5
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                "
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Customer comments
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Logged-in customers can comment. Existing comments remain
                    visible if commenting is disabled later.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={draft.commentsEnabled}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField("commentsEnabled", event.target.checked)
                  }
                  className="
                    h-5
                    w-5
                    shrink-0
                    accent-gray-950
                  "
                />
              </label>

              {/* PHOTOS */}
              <section className="sm:col-span-2">
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    rounded-2xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-5

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="
                        inline-flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-gray-500
                      "
                    >
                      <PhotoLibraryOutlinedIcon fontSize="small" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Event photos
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        These images will appear as the swipeable carousel in
                        the customer popup post.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    disabled={isSaving}
                    className="
                      inline-flex
                      w-fit
                      shrink-0
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-gray-700
                      transition
                      hover:border-gray-950
                      hover:text-gray-950
                      disabled:opacity-40
                    "
                  >
                    <PhotoLibraryOutlinedIcon fontSize="small" />

                    {draft.images.length > 0 ? "Manage photos" : "Add photos"}
                  </button>
                </div>

                {/* EMPTY PHOTO STATE */}
                {draft.images.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    disabled={isSaving}
                    className="
                      mt-4
                      flex
                      min-h-44
                      w-full
                      flex-col
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-dashed
                      border-gray-300
                      bg-white
                      px-6
                      text-center
                      transition
                      hover:border-gray-500
                      hover:bg-gray-50
                      disabled:opacity-40
                    "
                  >
                    <PhotoLibraryOutlinedIcon
                      sx={{
                        fontSize: 36,
                      }}
                      className="text-gray-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-gray-900">
                      Select photos from Media Library
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      You can choose up to 20 images.
                    </p>
                  </button>
                ) : (
                  <div className="mt-4 space-y-3">
                    {draft.images.map((image, index) => (
                      <article
                        key={image.mediaAssetId}
                        className="
                          flex
                          flex-col
                          gap-4
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-3

                          sm:flex-row
                          sm:items-center
                        "
                      >
                        {/* IMAGE */}
                        <div
                          className="
                            flex
                            items-center
                            gap-3

                            sm:w-48
                            sm:shrink-0
                          "
                        >
                          <DragIndicatorRoundedIcon className="text-gray-300" />

                          <div
                            className="
                              h-20
                              w-20
                              shrink-0
                              overflow-hidden
                              rounded-xl
                              bg-gray-100
                            "
                          >
                            {image.imageUrl ? (
                              <img
                                src={image.imageUrl}
                                alt={
                                  image.altText || `Popup image ${index + 1}`
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span
                                className="
                                  flex
                                  h-full
                                  items-center
                                  justify-center
                                  text-gray-400
                                "
                              >
                                <ImageOutlinedIcon />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900">
                              Photo {index + 1}
                            </p>

                            <p className="mt-1 truncate text-[0.7rem] text-gray-500">
                              {image.fileName || "Media image"}
                            </p>
                          </div>
                        </div>

                        {/* ALT TEXT */}
                        <label className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-gray-700">
                            Alt text
                          </span>

                          <input
                            type="text"
                            value={image.altText}
                            maxLength={300}
                            disabled={isSaving}
                            onChange={(event) =>
                              updateImageAltText(index, event.target.value)
                            }
                            placeholder={`Describe photo ${index + 1}`}
                            className="
                              mt-1.5
                              w-full
                              rounded-xl
                              border
                              border-gray-300
                              bg-white
                              px-3
                              py-2.5
                              text-sm
                              outline-none
                              transition
                              focus:border-gray-950
                              focus:ring-2
                              focus:ring-gray-950/10
                            "
                          />
                        </label>

                        {/* IMAGE ACTIONS */}
                        <div className="flex shrink-0 items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Move earlier"
                            disabled={index === 0 || isSaving}
                            onClick={() => moveImage(index, -1)}
                            className="
                              inline-flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              text-gray-500
                              transition
                              hover:bg-gray-100
                              hover:text-gray-950
                              disabled:opacity-30
                            "
                          >
                            <ArrowUpwardRoundedIcon fontSize="small" />
                          </button>

                          <button
                            type="button"
                            title="Move later"
                            disabled={
                              index === draft.images.length - 1 || isSaving
                            }
                            onClick={() => moveImage(index, 1)}
                            className="
                              inline-flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              text-gray-500
                              transition
                              hover:bg-gray-100
                              hover:text-gray-950
                              disabled:opacity-30
                            "
                          >
                            <ArrowDownwardRoundedIcon fontSize="small" />
                          </button>

                          <button
                            type="button"
                            title="Remove photo"
                            disabled={isSaving}
                            onClick={() => removeImage(index)}
                            className="
                              inline-flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              text-red-600
                              transition
                              hover:bg-red-50
                              disabled:opacity-30
                            "
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </button>
                        </div>
                      </article>
                    ))}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        pt-1
                      "
                    >
                      <p className="text-xs text-gray-500">
                        The first photo becomes the first carousel image.
                      </p>

                      <p className="shrink-0 text-xs font-semibold text-gray-500">
                        {draft.images.length}/20
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <footer
            className="
              flex
              justify-end
              gap-3
              border-t
              border-gray-200
              bg-gray-50
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="
                rounded-xl
                border
                border-gray-300
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-gray-700
                disabled:opacity-40
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gray-950
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-gray-800
                disabled:opacity-40
              "
            >
              <SaveRoundedIcon fontSize="small" />

              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create draft"}
            </button>
          </footer>
        </form>
      </div>

      {/* MEDIA LIBRARY */}
      {mediaPickerOpen && (
        <MediaPickerDialog
          onClose={() => setMediaPickerOpen(false)}
          multiple
          maxSelection={20}
          selectedAssets={draft.images}
          onConfirm={handleSelectedMedia}
        />
      )}
    </>
  );
}

function SocialStat({ icon: Icon, value, label }) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        text-xs
        text-gray-500
      "
    >
      <Icon
        sx={{
          fontSize: 17,
        }}
      />

      <span className="font-semibold text-gray-800">{value ?? 0}</span>

      <span>{label}</span>
    </div>
  );
}

function WebsitePopupsTab() {
  const [popupEvents, setPopupEvents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  const [editingPopup, setEditingPopup] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [statusMutationId, setStatusMutationId] = useState(null);

  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminPopupEvents({
      limit: 50,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        setPopupEvents(result.popupEvents ?? []);

        setLoadError(null);
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        ) {
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
  }, [reloadKey]);

  function reloadPopups() {
    setIsLoading(true);

    setLoadError(null);

    setReloadKey((current) => current + 1);
  }

  function openCreate() {
    setEditingPopup(null);

    setIsEditorOpen(true);
  }

  function openEdit(popup) {
    setEditingPopup(popup);

    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setIsEditorOpen(false);

    setEditingPopup(null);
  }

  async function handleSave(input) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingPopup) {
        const updated = await updateAdminPopupEvent(editingPopup.id, input);

        setPopupEvents((current) =>
          current.map((popup) => (popup.id === updated.id ? updated : popup)),
        );

        toast.success("Popup post updated.");
      } else {
        const created = await createAdminPopupEvent(input);

        setPopupEvents((current) => [...current, created]);

        toast.success("Popup draft created.");
      }

      setIsEditorOpen(false);

      setEditingPopup(null);
    } catch (error) {
      toast.error(error?.message || "Unable to save the popup post.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(popup, nextStatus) {
    if (statusMutationId) {
      return;
    }

    if (
      nextStatus === "PUBLISHED" &&
      (!popup.images || popup.images.length === 0)
    ) {
      toast.info("Add at least one image before publishing this popup.");

      return;
    }

    setStatusMutationId(popup.id);

    try {
      const updated = await updateAdminPopupEventStatus(popup.id, nextStatus);

      setPopupEvents((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success(
        nextStatus === "PUBLISHED"
          ? "Popup published."
          : nextStatus === "ARCHIVED"
            ? "Popup archived."
            : "Popup moved to draft.",
      );
    } catch (error) {
      toast.error(error?.message || "Unable to update popup status.");
    } finally {
      setStatusMutationId(null);
    }
  }

  async function movePopup(index, direction) {
    if (isReordering) {
      return;
    }

    const destination = index + direction;

    if (destination < 0 || destination >= popupEvents.length) {
      return;
    }

    const previous = popupEvents;

    const next = [...popupEvents];

    [next[index], next[destination]] = [next[destination], next[index]];

    const optimistic = next.map((popup, position) => ({
      ...popup,
      position,
    }));

    setPopupEvents(optimistic);

    setIsReordering(true);

    try {
      const saved = await reorderAdminPopupEvents(
        optimistic.map((popup) => popup.id),
      );

      setPopupEvents(saved);
    } catch (error) {
      setPopupEvents(previous);

      toast.error(error?.message || "Unable to reorder popup posts.");
    } finally {
      setIsReordering(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-52
              animate-pulse
              rounded-2xl
              border
              border-gray-200
              bg-white
            "
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-8
          text-center
        "
      >
        <p className="font-semibold text-red-900">
          Unable to load popup posts.
        </p>

        <p className="mt-2 text-sm text-red-700">{loadError.message}</p>

        <button
          type="button"
          onClick={reloadPopups}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-red-900
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
          "
        >
          <RefreshRoundedIcon fontSize="small" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* TOP */}
        <section
          className="
            flex
            flex-col
            gap-5
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-gray-500
              "
            >
              Community
            </p>

            <h3
              className="
                mt-1
                text-xl
                font-bold
                text-gray-950
              "
            >
              Pop-ups & Events
            </h3>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-gray-600
              "
            >
              Create social-style event posts with photos, captions, attendance,
              likes, and customer comments.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="
              inline-flex
              w-fit
              shrink-0
              items-center
              gap-2
              rounded-xl
              bg-gray-950
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
            "
          >
            <AddRoundedIcon fontSize="small" />
            Create post
          </button>
        </section>

        {/* EMPTY */}
        {popupEvents.length === 0 && (
          <section
            className="
              rounded-2xl
              border
              border-dashed
              border-gray-300
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <ImageOutlinedIcon
              sx={{
                fontSize: 42,
              }}
              className="text-gray-300"
            />

            <h4 className="mt-4 font-bold text-gray-950">No popup posts yet</h4>

            <p
              className="
                mx-auto
                mt-2
                max-w-lg
                text-sm
                leading-6
                text-gray-500
              "
            >
              Create the first Butterfly Dream event post. It will begin as a
              private draft.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gray-950
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >
              <AddRoundedIcon fontSize="small" />
              Create first post
            </button>
          </section>
        )}

        {/* POSTS */}
        {popupEvents.length > 0 && (
          <div className="space-y-4">
            {popupEvents.map((popup, index) => {
              const firstImage = popup.images?.[0];

              const isUpdating = statusMutationId === popup.id;

              return (
                <article
                  key={popup.id}
                  className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                    "
                >
                  <div
                    className="
                        grid

                        md:grid-cols-[12rem_minmax(0,1fr)]
                      "
                  >
                    {/* IMAGE */}
                    <div
                      className="
                          flex
                          min-h-44
                          items-center
                          justify-center
                          bg-gray-100

                          md:min-h-full
                        "
                    >
                      {firstImage ? (
                        <img
                          src={firstImage.imageUrl}
                          alt={firstImage.altText || popup.title}
                          className="
                              h-full
                              min-h-44
                              w-full
                              object-cover
                            "
                        />
                      ) : (
                        <div
                          className="
                              flex
                              flex-col
                              items-center
                              gap-2
                              text-gray-400
                            "
                        >
                          <ImageOutlinedIcon />

                          <span className="text-xs">No images</span>
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-5 sm:p-6">
                      <div
                        className="
                            flex
                            flex-col
                            gap-4

                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                          "
                      >
                        <div className="min-w-0">
                          <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                          >
                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider",

                                getStatusClasses(popup.status),
                              ].join(" ")}
                            >
                              {formatStatus(popup.status)}
                            </span>

                            <span
                              className="
                                  rounded-full
                                  bg-gray-100
                                  px-2.5
                                  py-1
                                  text-[0.65rem]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-gray-500
                                "
                            >
                              {popup.images?.length ?? 0}{" "}
                              {popup.images?.length === 1 ? "photo" : "photos"}
                            </span>

                            {!popup.commentsEnabled && (
                              <span
                                className="
                                    rounded-full
                                    bg-gray-100
                                    px-2.5
                                    py-1
                                    text-[0.65rem]
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-gray-500
                                  "
                              >
                                Comments off
                              </span>
                            )}
                          </div>

                          <h4
                            className="
                                mt-3
                                text-lg
                                font-bold
                                text-gray-950
                              "
                          >
                            {popup.title}
                          </h4>

                          {(popup.location || popup.dateLabel) && (
                            <p className="mt-1 text-xs text-gray-500">
                              {[popup.location, popup.dateLabel]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}

                          <p
                            className="
                                mt-3
                                line-clamp-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-gray-600
                              "
                          >
                            {popup.caption}
                          </p>
                        </div>

                        <p
                          className="
                              shrink-0
                              text-xs
                              text-gray-400
                            "
                        >
                          #{index + 1}
                        </p>
                      </div>

                      {/* SOCIAL */}
                      <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            gap-x-5
                            gap-y-2
                            border-t
                            border-gray-100
                            pt-4
                          "
                      >
                        <SocialStat
                          icon={FavoriteBorderRoundedIcon}
                          value={popup.social?.likeCount}
                          label="likes"
                        />

                        <SocialStat
                          icon={GroupsOutlinedIcon}
                          value={popup.social?.attendanceCount}
                          label="attended"
                        />

                        <SocialStat
                          icon={CommentOutlinedIcon}
                          value={popup.social?.commentCount}
                          label="comments"
                        />
                      </div>

                      {/* ACTIONS */}
                      <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                      >
                        <button
                          type="button"
                          onClick={() => movePopup(index, -1)}
                          disabled={index === 0 || isReordering}
                          title="Move up"
                          className="
                              inline-flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-gray-200
                              text-gray-500
                              transition
                              hover:text-gray-950
                              disabled:opacity-30
                            "
                        >
                          <ArrowUpwardRoundedIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          onClick={() => movePopup(index, 1)}
                          disabled={
                            index === popupEvents.length - 1 || isReordering
                          }
                          title="Move down"
                          className="
                              inline-flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-gray-200
                              text-gray-500
                              transition
                              hover:text-gray-950
                              disabled:opacity-30
                            "
                        >
                          <ArrowDownwardRoundedIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(popup)}
                          className="
                              inline-flex
                              h-10
                              items-center
                              gap-1.5
                              rounded-xl
                              border
                              border-gray-300
                              px-3
                              text-xs
                              font-bold
                              text-gray-700
                              transition
                              hover:border-gray-950
                            "
                        >
                          <EditRoundedIcon fontSize="small" />
                          Edit
                        </button>

                        {popup.status !== "PUBLISHED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void changeStatus(popup, "PUBLISHED")
                            }
                            className="
                                inline-flex
                                h-10
                                items-center
                                gap-1.5
                                rounded-xl
                                bg-gray-950
                                px-4
                                text-xs
                                font-bold
                                text-white
                                transition
                                hover:bg-gray-800
                                disabled:opacity-40
                              "
                          >
                            <PublicRoundedIcon fontSize="small" />

                            {isUpdating ? "Updating..." : "Publish"}
                          </button>
                        )}

                        {popup.status === "PUBLISHED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void changeStatus(popup, "DRAFT")}
                            className="
                                inline-flex
                                h-10
                                items-center
                                gap-1.5
                                rounded-xl
                                border
                                border-gray-300
                                px-3
                                text-xs
                                font-bold
                                text-gray-700
                                disabled:opacity-40
                              "
                          >
                            <VisibilityOffOutlinedIcon fontSize="small" />

                            {isUpdating ? "Updating..." : "Unpublish"}
                          </button>
                        )}

                        {popup.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void changeStatus(popup, "ARCHIVED")}
                            className="
                                ml-auto
                                inline-flex
                                h-10
                                items-center
                                gap-1.5
                                rounded-xl
                                border
                                border-gray-300
                                px-3
                                text-xs
                                font-bold
                                text-gray-500
                                transition
                                hover:border-gray-500
                                hover:text-gray-800
                                disabled:opacity-40
                              "
                          >
                            <ArchiveOutlinedIcon fontSize="small" />
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isEditorOpen && (
        <PopupEditorDialog
          popup={editingPopup}
          isSaving={isSaving}
          onClose={closeEditor}
          onSaved={handleSave}
        />
      )}
    </>
  );
}

export default WebsitePopupsTab;
