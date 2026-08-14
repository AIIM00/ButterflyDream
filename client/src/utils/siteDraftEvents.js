export const SITE_DRAFT_CHANGED_EVENT = "butterfly-site-draft-changed";

export function emitSiteDraftChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SITE_DRAFT_CHANGED_EVENT));
}
