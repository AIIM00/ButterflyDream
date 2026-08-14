import { useEffect, useState } from "react";

import AnnouncementBarSectionEditor from "./AnnouncementBarSectionEditor.jsx";
import OpeningSliderSectionEditor from "./OpeningSliderSectionEditor.jsx";
import TransformationStorySectionEditor from "./TransformationStorySectionEditor.jsx";
import CategoriesSectionEditor from "./CategoriesSectionEditor.jsx";
import FeaturedProductsSectionEditor from "./FeaturedProductsSectionEditor.jsx";
import CollectionsSectionEditor from "./CollectionsSectionEditor.jsx";
import FeedbackSectionEditor from "./FeedbackSectionEditor.jsx";
import FlexibleImageSectionEditor from "./FlexibleImageSectionEditor.jsx";

// MUI ICONS
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import SlideshowRoundedIcon from "@mui/icons-material/SlideshowRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import WallpaperIcon from "@mui/icons-material/Wallpaper";

import { toast } from "react-toastify";

import {
  createAdminHomeSection,
  deleteAdminHomeSection,
  fetchAdminHomeSections,
  reorderAdminHomeSections,
  updateAdminHomeSection,
} from "../../../services/adminSiteContent.js";

import { emitSiteDraftChanged } from "../../../utils/siteDraftEvents.js";

const SECTION_TYPES = {
  ANNOUNCEMENT_BAR: {
    label: "Announcement Bar",

    description: "A promotional message displayed above the customer header.",

    icon: CampaignRoundedIcon,

    defaultName: "Announcement Bar",

    defaultContent: {
      mobileText: "Jewelry made for your story",

      desktopText:
        "Discover elegant jewelry and accessories made for your story",

      linkText: "Shop now",

      href: "/products",
    },
  },

  OPENING_SLIDER: {
    label: "Opening Slider",

    description:
      "Full-width opening imagery shown before the transformation story.",

    icon: SlideshowRoundedIcon,

    defaultName: "Opening Slider",

    defaultContent: {
      intervalMs: 5000,

      slides: [],
    },
  },

  TRANSFORMATION_STORY: {
    label: "Transformation Story",

    description: "The Butterfly Dream scroll transformation experience.",

    icon: StarRoundedIcon,

    defaultName: "Transformation Story",

    defaultContent: {
      intro: {
        eyebrow: "Butterfly Dream",

        title: "Every dream begins with transformation.",

        description:
          "Follow the journey from chrysalis to butterfly, and from butterfly to a piece created to carry your story.",

        buttonText: "Explore collection",

        buttonUrl: "/products",

        rotationIntervalMs: 3200,

        images: [],
      },

      customized: {
        imageAssetId: null,

        imageAlt: "Customized Butterfly Dream accessories",

        imagePosition: "center",

        badge: "Made for you",

        eyebrow: "Made personal",

        title: "Accessories shaped around your story.",

        description:
          "Create something more personal — an accessory designed to hold meaning, celebrate a moment, or become part of someone's story.",

        details: [
          {
            label: "Personal",

            text: "Made meaningful",
          },

          {
            label: "Thoughtful",

            text: "Made for moments",
          },

          {
            label: "Yours",

            text: "Made to keep",
          },
        ],

        buttonText: "Explore customization",

        buttonUrl: "/products",
      },
    },
  },

  CATEGORIES: {
    label: "Categories",

    description: "The Find What Speaks To You category discovery section.",

    icon: CategoryRoundedIcon,

    defaultName: "Find What Speaks To You",

    defaultContent: {
      eyebrow: "Explore the collection",

      title: "Find the piece that feels like you.",

      description:
        "Move through our collections and discover accessories designed for everyday expression, meaningful moments, and personal transformation.",

      buttonText: "View all categories",

      buttonUrl: "/products",

      /*
       * Empty = automatically use the first
       * 8 active categories by catalog order.
       */
      categoryIds: [],
    },
  },

  FEATURED_PRODUCTS: {
    label: "Featured Products",

    description: "A curated selection of featured products.",

    icon: StarRoundedIcon,

    defaultName: "Featured Products",

    defaultContent: {
      eyebrow: "Selected for you",

      title: "Pieces chosen to carry your story.",

      description:
        "Discover signature Butterfly Dream accessories selected for their elegance, meaning, and ability to make an everyday moment feel personal.",

      buttonText: "View featured pieces",

      buttonUrl: "/products?featured=true",

      selectionMode: "automatic",

      productLimit: 4,

      productIds: [],
    },
  },

  COLLECTIONS: {
    label: "Collections",

    description: "Editorial collection cards and collection navigation.",

    icon: CollectionsRoundedIcon,

    defaultName: "Our Collection",

    defaultContent: {
      eyebrow: "Our collection",

      title: "Timeless pieces for every moment.",

      description:
        "Discover collections shaped around everyday beauty, meaningful gifts, modern elegance, and pieces made especially for you.",

      items: [
        {
          title: "Everyday Essentials",

          description: "Pieces designed to become part of your everyday story.",

          assetId: null,

          imageAlt: "Everyday jewelry essentials",

          imagePosition: "center",

          buttonUrl: "/products",
        },

        {
          title: "Gift with Meaning",

          description:
            "Thoughtful pieces made for the moments worth remembering.",

          assetId: null,

          imageAlt: "Meaningful jewelry gifts",

          imagePosition: "center",

          buttonUrl: "/products",
        },

        {
          title: "Modern Elegance",

          description:
            "Refined accessories with a clean and contemporary character.",

          assetId: null,

          imageAlt: "Modern elegant jewelry",

          imagePosition: "center",

          buttonUrl: "/products",
        },

        {
          title: "Personalized Just for You",

          description: "Personal pieces shaped around your story.",

          assetId: null,

          imageAlt: "Personalized jewelry",

          imagePosition: "center",

          buttonUrl: "/products",
        },
      ],
    },
  },

  FEEDBACK: {
    label: "Feedback",

    description: "Customer feedback and testimonials.",

    icon: FeedbackRoundedIcon,

    defaultName: "Customer Feedback",

    defaultContent: {
      eyebrow: "Customer stories",

      title: "What our",

      titleAccent: "customers say.",

      reviewsPerPage: 4,

      sort: "newest",

      showRatingSummary: true,
    },
  },

  IMAGE_TEXT: {
    label: "Image + Text",

    description:
      "An editorial image beside customizable text and a call to action.",

    icon: ImageRoundedIcon,

    defaultName: "Image + Text",

    defaultContent: {
      eyebrow: "Butterfly Dream",

      title: "Details that make it yours.",

      description:
        "Discover pieces designed around elegance, individuality, and the moments that become part of your story.",

      assetId: null,

      imageAlt: "",

      imageSide: "left",

      imageFocus: "center",

      buttonText: "Explore collection",

      buttonUrl: "/products",
    },
  },

  IMAGE_BANNER: {
    label: "Image Banner",

    description:
      "A full editorial image banner with text and a call to action.",

    icon: WallpaperIcon,

    defaultName: "Image Banner",

    defaultContent: {
      eyebrow: "Butterfly Dream",

      title: "A moment worth carrying with you.",

      description:
        "Pieces created to turn meaningful moments into something you can keep.",

      assetId: null,

      imageAlt: "",

      imageFocus: "center",

      textAlign: "left",

      overlayStrength: "medium",

      buttonText: "Discover more",

      buttonUrl: "/products",
    },
  },
};

function getSectionConfiguration(type) {
  return (
    SECTION_TYPES[type] ?? {
      label: type,

      description: "Website section",

      icon: ImageRoundedIcon,

      defaultName: type,

      defaultContent: {},
    }
  );
}

function AddSectionDialog({ isCreating, onClose, onCreate }) {
  const [selectedType, setSelectedType] = useState(null);

  const [name, setName] = useState("");

  function selectSection(type) {
    const configuration = getSectionConfiguration(type);

    setSelectedType(type);

    setName(configuration.defaultName);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedType) {
      return;
    }

    const configuration = getSectionConfiguration(selectedType);

    onCreate({
      type: selectedType,

      name: name.trim() || configuration.defaultName,

      isEnabled: true,

      content: structuredClone(configuration.defaultContent),
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close section picker"
        disabled={isCreating}
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/60"
      />

      <form
        onSubmit={handleSubmit}
        className="
          relative
          z-10
          max-h-[90vh]
          w-full
          max-w-4xl
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Homepage
            </p>

            <h3 className="mt-1 text-xl font-bold text-gray-950">
              Add section
            </h3>
          </div>

          <button
            type="button"
            disabled={isCreating}
            onClick={onClose}
            aria-label="Close"
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
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

        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SECTION_TYPES).map(([type, configuration]) => {
              const Icon = configuration.icon;

              const isSelected = selectedType === type;

              return (
                <button
                  key={type}
                  type="button"
                  disabled={isCreating}
                  onClick={() => selectSection(type)}
                  className={[
                    "rounded-2xl border p-5 text-left transition",

                    isSelected
                      ? "border-gray-950 bg-gray-950 text-white"
                      : "border-gray-200 bg-white text-gray-950 hover:border-gray-400 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl",

                      isSelected ? "bg-white/10" : "bg-gray-100",
                    ].join(" ")}
                  >
                    <Icon fontSize="small" />
                  </span>

                  <p className="mt-4 font-bold">{configuration.label}</p>

                  <p
                    className={[
                      "mt-1 text-xs leading-5",

                      isSelected ? "text-gray-300" : "text-gray-500",
                    ].join(" ")}
                  >
                    {configuration.description}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedType && (
            <label className="mt-6 block">
              <span className="text-sm font-semibold text-gray-800">
                Section name
              </span>

              <input
                type="text"
                value={name}
                maxLength={120}
                disabled={isCreating}
                onChange={(event) => setName(event.target.value)}
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
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
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
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
              transition
              hover:bg-gray-100
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!selectedType || isCreating}
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
              disabled:opacity-50
            "
          >
            <AddRoundedIcon fontSize="small" />

            {isCreating ? "Adding..." : "Add section"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function WebsiteHomepageTab() {
  const [sections, setSections] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const [updatingSectionId, setUpdatingSectionId] = useState(null);

  const [deletingSectionId, setDeletingSectionId] = useState(null);

  const [isReordering, setIsReordering] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminHomeSections({
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        setSections(result);

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
  }, [reloadKey]);

  function reloadSections() {
    setIsLoading(true);

    setReloadKey((current) => current + 1);
  }

  function handleSectionSaved(updatedSection) {
    setSections((current) =>
      current.map((section) =>
        section.id === updatedSection.id ? updatedSection : section,
      ),
    );

    /*
     * Tell WebsitePublicationBar that
     * a successful draft change happened.
     */
    emitSiteDraftChanged();
  }

  async function handleCreateSection(input) {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const section = await createAdminHomeSection(input);

      setSections((current) => [...current, section]);

      /*
       * CREATE = draft changed
       */
      emitSiteDraftChanged();

      setIsAddSectionOpen(false);

      toast.success("Homepage section added successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to add the homepage section.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleSection(section) {
    if (updatingSectionId) {
      return;
    }

    setUpdatingSectionId(section.id);

    try {
      const updatedSection = await updateAdminHomeSection(section.id, {
        isEnabled: !section.isEnabled,
      });

      setSections((current) =>
        current.map((currentSection) =>
          currentSection.id === updatedSection.id
            ? updatedSection
            : currentSection,
        ),
      );

      /*
       * VISIBILITY = draft changed
       */
      emitSiteDraftChanged();

      toast.success(
        updatedSection.isEnabled
          ? "Section enabled."
          : "Section hidden from the website.",
      );
    } catch (error) {
      toast.error(error?.message || "Unable to update the section.");
    } finally {
      setUpdatingSectionId(null);
    }
  }

  async function handleDeleteSection(section) {
    if (deletingSectionId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${section.name}"?\n\nThis removes the homepage section. Media Library images themselves will not be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingSectionId(section.id);

    try {
      await deleteAdminHomeSection(section.id);

      setSections((current) =>
        current
          .filter((currentSection) => currentSection.id !== section.id)
          .map((currentSection, index) => ({
            ...currentSection,

            position: index,
          })),
      );

      /*
       * DELETE = draft changed
       */
      emitSiteDraftChanged();

      toast.success("Homepage section deleted.");
    } catch (error) {
      toast.error(error?.message || "Unable to delete the section.");
    } finally {
      setDeletingSectionId(null);
    }
  }

  async function moveSection(index, direction) {
    if (isReordering) {
      return;
    }

    const destinationIndex = index + direction;

    if (destinationIndex < 0 || destinationIndex >= sections.length) {
      return;
    }

    const previousSections = sections;

    const reordered = [...sections];

    [reordered[index], reordered[destinationIndex]] = [
      reordered[destinationIndex],
      reordered[index],
    ];

    const optimisticSections = reordered.map((section, position) => ({
      ...section,

      position,
    }));

    /*
     * Optimistic UI update.
     *
     * Do NOT emit the draft event here yet,
     * because the API request could still fail.
     */
    setSections(optimisticSections);

    setIsReordering(true);

    try {
      const savedSections = await reorderAdminHomeSections(
        optimisticSections.map((section) => section.id),
      );

      setSections(savedSections);

      /*
       * REORDER successfully saved
       * = draft changed
       */
      emitSiteDraftChanged();
    } catch (error) {
      /*
       * Restore the old UI if the server
       * rejected the reorder.
       */
      setSections(previousSections);

      toast.error(error?.message || "Unable to reorder the homepage sections.");
    } finally {
      setIsReordering(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="
                h-28
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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-900">
          Unable to load the homepage sections.
        </p>

        <p className="mt-2 text-sm text-red-700">
          {loadError?.message || "An unexpected error occurred."}
        </p>

        <button
          type="button"
          onClick={reloadSections}
          className="
            mt-5
            rounded-xl
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
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div
          className="
            flex
            flex-col
            gap-4
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
            <h3 className="text-lg font-bold text-gray-950">
              Homepage sections
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Control the content, visibility, and order of the Butterfly Dream
              storefront.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddSectionOpen(true)}
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
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
            Add section
          </button>
        </div>

        {sections.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-gray-300
              bg-white
              px-6
              py-16
              text-center
            "
          >
            <CollectionsRoundedIcon
              sx={{
                fontSize: 42,
              }}
              className="text-gray-300"
            />

            <h4 className="mt-4 font-bold text-gray-950">
              No homepage sections yet
            </h4>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              Add the existing Butterfly Dream sections and then edit their
              text, images, and settings from here.
            </p>

            <button
              type="button"
              onClick={() => setIsAddSectionOpen(true)}
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
              Add first section
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => {
              const configuration = getSectionConfiguration(section.type);

              const Icon = configuration.icon;

              const isUpdating = updatingSectionId === section.id;

              const isDeleting = deletingSectionId === section.id;

              const isSiteChrome = section.type === "ANNOUNCEMENT_BAR";

              return (
                <article
                  key={section.id}
                  className={[
                    "flex flex-col gap-4 rounded-2xl border bg-white p-4 transition sm:flex-row sm:items-center",

                    section.isEnabled
                      ? "border-gray-200"
                      : "border-gray-200 opacity-60",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className="
                          hidden
                          shrink-0
                          cursor-grab
                          text-gray-300

                          sm:block
                        "
                      aria-hidden="true"
                    >
                      <DragIndicatorRoundedIcon />
                    </span>

                    <span
                      className="
                          inline-flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-gray-100
                          text-gray-700
                        "
                    >
                      <Icon />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate font-bold text-gray-950">
                          {section.name}
                        </h4>

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
                          {configuration.label}
                        </span>

                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider",

                            section.isEnabled
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500",
                          ].join(" ")}
                        >
                          {section.isEnabled ? "Visible" : "Hidden"}
                        </span>

                        {isSiteChrome && (
                          <span
                            className="
                                rounded-full
                                bg-blue-50
                                px-2.5
                                py-1
                                text-[0.65rem]
                                font-bold
                                uppercase
                                tracking-wider
                                text-blue-700
                              "
                          >
                            Site chrome
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {configuration.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      title="Move up"
                      aria-label={`Move ${section.name} up`}
                      disabled={isSiteChrome || index === 0 || isReordering}
                      onClick={() => moveSection(index, -1)}
                      className="
                          inline-flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          text-gray-500
                          transition
                          hover:bg-gray-100
                          hover:text-gray-950
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                    >
                      <ArrowUpwardRoundedIcon fontSize="small" />
                    </button>

                    <button
                      type="button"
                      title="Move down"
                      aria-label={`Move ${section.name} down`}
                      disabled={
                        isSiteChrome ||
                        index === sections.length - 1 ||
                        isReordering
                      }
                      onClick={() => moveSection(index, 1)}
                      className="
                          inline-flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          text-gray-500
                          transition
                          hover:bg-gray-100
                          hover:text-gray-950
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                    >
                      <ArrowDownwardRoundedIcon fontSize="small" />
                    </button>

                    <button
                      type="button"
                      title={
                        section.isEnabled ? "Hide section" : "Show section"
                      }
                      disabled={isUpdating}
                      onClick={() => handleToggleSection(section)}
                      className="
                          inline-flex
                          h-10
                          w-10
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
                      {section.isEnabled ? (
                        <VisibilityRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      )}
                    </button>

                    <button
                      type="button"
                      title="Edit section"
                      onClick={() => {
                        if (
                          section.type === "ANNOUNCEMENT_BAR" ||
                          section.type === "OPENING_SLIDER" ||
                          section.type === "TRANSFORMATION_STORY" ||
                          section.type === "CATEGORIES" ||
                          section.type === "FEATURED_PRODUCTS" ||
                          section.type === "COLLECTIONS" ||
                          section.type === "FEEDBACK" ||
                          section.type === "IMAGE_TEXT" ||
                          section.type === "IMAGE_BANNER"
                        ) {
                          setEditingSection(section);

                          return;
                        }

                        toast.info(
                          `${configuration.label} editor will be added next.`,
                        );
                      }}
                      className="
                          inline-flex
                          h-10
                          items-center
                          justify-center
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
                          hover:text-gray-950
                        "
                    >
                      <EditRoundedIcon fontSize="small" />
                      Edit
                    </button>

                    <button
                      type="button"
                      title="Delete section"
                      disabled={isDeleting}
                      onClick={() => handleDeleteSection(section)}
                      className="
                          inline-flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          text-red-600
                          transition
                          hover:bg-red-50
                          disabled:opacity-40
                        "
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isAddSectionOpen && (
        <AddSectionDialog
          isCreating={isCreating}
          onCreate={handleCreateSection}
          onClose={() => {
            if (!isCreating) {
              setIsAddSectionOpen(false);
            }
          }}
        />
      )}

      {editingSection?.type === "ANNOUNCEMENT_BAR" && (
        <AnnouncementBarSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {editingSection?.type === "OPENING_SLIDER" && (
        <OpeningSliderSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {editingSection?.type === "TRANSFORMATION_STORY" && (
        <TransformationStorySectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {editingSection?.type === "CATEGORIES" && (
        <CategoriesSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {editingSection?.type === "FEATURED_PRODUCTS" && (
        <FeaturedProductsSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {editingSection?.type === "COLLECTIONS" && (
        <CollectionsSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {editingSection?.type === "FEEDBACK" && (
        <FeedbackSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}

      {(editingSection?.type === "IMAGE_TEXT" ||
        editingSection?.type === "IMAGE_BANNER") && (
        <FlexibleImageSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSectionSaved}
        />
      )}
    </>
  );
}

export default WebsiteHomepageTab;
