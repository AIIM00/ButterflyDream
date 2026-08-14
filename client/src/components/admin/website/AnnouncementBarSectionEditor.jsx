import { useState } from "react";

import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { toast } from "react-toastify";

import { updateAdminHomeSection } from "../../../services/adminSiteContent.js";

function AnnouncementBarSectionEditor({ section, onClose, onSaved }) {
  const [name, setName] = useState(section.name ?? "Announcement Bar");

  const [mobileText, setMobileText] = useState(
    section.content?.mobileText ?? "",
  );

  const [desktopText, setDesktopText] = useState(
    section.content?.desktopText ?? "",
  );

  const [linkText, setLinkText] = useState(section.content?.linkText ?? "");

  const [href, setHref] = useState(section.content?.href ?? "");

  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Section name is required.");
      return;
    }

    if (!mobileText.trim()) {
      toast.error("Mobile announcement text is required.");
      return;
    }

    if (!desktopText.trim()) {
      toast.error("Desktop announcement text is required.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        name: name.trim(),

        content: {
          mobileText: mobileText.trim(),
          desktopText: desktopText.trim(),

          linkText: linkText.trim(),
          href: href.trim(),
        },
      });

      toast.success("Announcement bar updated successfully.");

      onSaved?.(updatedSection);
      onClose();
    } catch (error) {
      toast.error(error?.message || "Unable to update the announcement bar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close announcement editor"
        disabled={isSaving}
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/60"
      />

      <form
        onSubmit={handleSubmit}
        className="
          relative z-10
          max-h-[90vh]
          w-full
          max-w-2xl
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-white">
              <CampaignRoundedIcon />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Homepage section
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-950">
                Edit Announcement Bar
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="
              inline-flex
              h-10 w-10
              items-center justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-950
              disabled:opacity-50
            "
          >
            <CloseRoundedIcon />
          </button>
        </header>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-gray-800">
              Section name
            </span>

            <input
              type="text"
              value={name}
              maxLength={120}
              disabled={isSaving}
              onChange={(event) => setName(event.target.value)}
              className="
                mt-2
                w-full
                rounded-xl
                border border-gray-300
                px-4 py-3
                text-sm
                outline-none
                transition
                focus:border-gray-950
                focus:ring-2
                focus:ring-gray-950/10
              "
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-800">
              Mobile text
            </span>

            <p className="mt-1 text-xs text-gray-500">
              Short version displayed on small mobile screens.
            </p>

            <input
              type="text"
              value={mobileText}
              maxLength={120}
              disabled={isSaving}
              onChange={(event) => setMobileText(event.target.value)}
              placeholder="Jewelry made for your story"
              className="
                mt-2
                w-full
                rounded-xl
                border border-gray-300
                px-4 py-3
                text-sm
                outline-none
                transition
                focus:border-gray-950
                focus:ring-2
                focus:ring-gray-950/10
              "
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-800">
              Desktop text
            </span>

            <p className="mt-1 text-xs text-gray-500">
              Longer version displayed on tablets and desktop screens.
            </p>

            <input
              type="text"
              value={desktopText}
              maxLength={220}
              disabled={isSaving}
              onChange={(event) => setDesktopText(event.target.value)}
              placeholder="Discover elegant jewelry and accessories made for your story"
              className="
                mt-2
                w-full
                rounded-xl
                border border-gray-300
                px-4 py-3
                text-sm
                outline-none
                transition
                focus:border-gray-950
                focus:ring-2
                focus:ring-gray-950/10
              "
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-gray-800">
                Link text
              </span>

              <input
                type="text"
                value={linkText}
                maxLength={50}
                disabled={isSaving}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Shop now"
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-gray-950
                  focus:ring-2
                  focus:ring-gray-950/10
                "
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-800">Link</span>

              <input
                type="text"
                value={href}
                maxLength={500}
                disabled={isSaving}
                onChange={(event) => setHref(event.target.value)}
                placeholder="/products"
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-gray-950
                  focus:ring-2
                  focus:ring-gray-950/10
                "
              />
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Preview
            </p>

            <div className="mt-4 rounded-xl bg-gray-900 px-4 py-3 text-center text-xs text-white">
              <span>{desktopText || "Announcement text"}</span>

              {linkText && (
                <span className="ml-2 font-bold underline">{linkText}</span>
              )}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="
              rounded-xl
              border border-gray-300
              bg-white
              px-5 py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-100
              disabled:opacity-50
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
              px-5 py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckRoundedIcon fontSize="small" />

            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default AnnouncementBarSectionEditor;
