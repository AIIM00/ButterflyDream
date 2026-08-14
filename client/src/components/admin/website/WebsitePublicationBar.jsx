import { useEffect, useState } from "react";

import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";

import { toast } from "react-toastify";

import {
  createSiteDraftPreview,
  fetchSitePublicationStatus,
  publishSiteDraft,
} from "../../../services/adminSitePublication.js";

import { SITE_DRAFT_CHANGED_EVENT } from "../../../utils/siteDraftEvents.js";

function formatPublishedAt(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getCustomerSiteUrl() {
  const configuredUrl = import.meta.env.VITE_CUSTOMER_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return window.location.origin;
}

function WebsitePublicationBar() {
  const [publication, setPublication] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isPublishing, setIsPublishing] = useState(false);

  const [isCreatingPreview, setIsCreatingPreview] = useState(false);

  async function refreshStatus() {
    try {
      const status = await fetchSitePublicationStatus();

      setPublication(status);
    } catch (error) {
      console.error("Unable to refresh website publication status:", error);
    }
  }

  useEffect(() => {
    let isActive = true;

    /*
     * Initial load.
     *
     * Important:
     * State updates happen inside Promise callbacks,
     * not synchronously in the effect body.
     */
    fetchSitePublicationStatus()
      .then((status) => {
        if (!isActive) {
          return;
        }

        setPublication(status);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        console.error("Unable to load website publication status:", error);
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setIsLoading(false);
      });

    /*
     * These are external-system subscriptions.
     * Calling refreshStatus from these callbacks
     * is valid.
     */
    function handleDraftChanged() {
      void refreshStatus();
    }

    function handleWindowFocus() {
      void refreshStatus();
    }

    window.addEventListener(SITE_DRAFT_CHANGED_EVENT, handleDraftChanged);

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isActive = false;

      window.removeEventListener(SITE_DRAFT_CHANGED_EVENT, handleDraftChanged);

      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  async function handlePreview() {
    if (isCreatingPreview) {
      return;
    }

    /*
     * Open immediately so the browser does not
     * treat it as an async popup and block it.
     */
    const previewWindow = window.open("about:blank", "_blank");

    if (!previewWindow) {
      toast.error(
        "Your browser blocked the preview tab. Allow popups and try again.",
      );

      return;
    }

    previewWindow.opener = null;

    setIsCreatingPreview(true);

    try {
      const preview = await createSiteDraftPreview();

      const previewUrl = new URL("/", getCustomerSiteUrl());

      const hash = new URLSearchParams({
        "site-preview": preview.token,
      });

      previewUrl.hash = hash.toString();

      previewWindow.location.replace(previewUrl.toString());
    } catch (error) {
      previewWindow.close();

      toast.error(error?.message || "Unable to create the draft preview.");
    } finally {
      setIsCreatingPreview(false);
    }
  }

  async function handlePublish() {
    if (isPublishing) {
      return;
    }

    const confirmed = window.confirm(
      "Publish all current homepage and theme changes to the customer website?",
    );

    if (!confirmed) {
      return;
    }

    setIsPublishing(true);

    try {
      const result = await publishSiteDraft();

      setPublication((current) => ({
        ...(current ?? {}),
        ...result,

        isPublished: true,

        hasUnpublishedChanges: false,

        homepageChanged: false,

        themeChanged: false,
      }));

      toast.success("Website published successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to publish the website.");
    } finally {
      setIsPublishing(false);
    }
  }

  const hasChanges = publication?.hasUnpublishedChanges === true;

  return (
    <section
      className={`
        mb-6
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        p-5

        lg:flex-row
        lg:items-center
        lg:justify-between

        ${
          hasChanges
            ? "border-amber-200 bg-amber-50"
            : "border-gray-200 bg-white"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span
          className={`
            mt-0.5
            inline-flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl

            ${
              hasChanges
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }
          `}
        >
          {isLoading ? (
            <SyncRoundedIcon className="animate-spin" fontSize="small" />
          ) : hasChanges ? (
            <PublishRoundedIcon fontSize="small" />
          ) : (
            <CloudDoneRoundedIcon fontSize="small" />
          )}
        </span>

        <div>
          <p className="text-sm font-bold text-gray-950">
            {isLoading
              ? "Checking publication status..."
              : hasChanges
                ? "Unpublished changes"
                : publication?.isPublished
                  ? "Website is published"
                  : "Website has not been published yet"}
          </p>

          {!isLoading && (
            <>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                {hasChanges
                  ? "Your saved CMS changes are private until you publish them."
                  : "The storefront is showing the latest published CMS version."}
              </p>

              {publication?.publishedAt && (
                <p className="mt-1 text-[0.7rem] text-gray-500">
                  Last published {formatPublishedAt(publication.publishedAt)}
                </p>
              )}

              {hasChanges && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {publication?.homepageChanged && (
                    <span
                      className="
                        rounded-full
                        bg-white
                        px-2.5
                        py-1
                        text-[0.65rem]
                        font-bold
                        uppercase
                        tracking-wide
                        text-gray-600
                      "
                    >
                      Homepage changed
                    </span>
                  )}

                  {publication?.themeChanged && (
                    <span
                      className="
                        rounded-full
                        bg-white
                        px-2.5
                        py-1
                        text-[0.65rem]
                        font-bold
                        uppercase
                        tracking-wide
                        text-gray-600
                      "
                    >
                      Theme changed
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePreview}
          disabled={isCreatingPreview}
          className="
            inline-flex
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <PreviewRoundedIcon fontSize="small" />

          {isCreatingPreview ? "Opening preview..." : "Preview draft"}
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isLoading || isPublishing || !hasChanges}
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
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <PublishRoundedIcon fontSize="small" />

          {isPublishing ? "Publishing..." : "Publish"}
        </button>
      </div>
    </section>
  );
}

export default WebsitePublicationBar;
