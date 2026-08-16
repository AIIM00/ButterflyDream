import { useSearchParams } from "react-router-dom";

// MUI Icons
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";

// Components
import WebsiteMediaTab from "../../components/admin/website/WebsiteMediaTab.jsx";
import WebsiteHomepageTab from "../../components/admin/website/WebsiteHomepageTab.jsx";
import WebsiteThemeTab from "../../components/admin/website/WebsiteThemeTab.jsx";
import WebsitePublicationBar from "../../components/admin/website/WebsitePublicationBar.jsx";
import WebsitePopupsTab from "../../components/admin/website/WebsitePopupsTab.jsx";

/* =========================================================
   TABS
========================================================= */

const WEBSITE_TABS = [
  {
    id: "homepage",
    label: "Homepage",
    shortLabel: "Home",
    icon: HomeRoundedIcon,
  },
  {
    id: "theme",
    label: "Theme",
    shortLabel: "Theme",
    icon: BrushRoundedIcon,
  },
  {
    id: "media",
    label: "Media",
    shortLabel: "Media",
    icon: PhotoLibraryRoundedIcon,
  },
  {
    id: "popups",
    label: "Popups",
    shortLabel: "Popups",
    icon: CampaignOutlinedIcon,
  },
];

/* =========================================================
   PAGE
========================================================= */

function AdminWebsite() {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");

  const activeTab = WEBSITE_TABS.some((tab) => tab.id === requestedTab)
    ? requestedTab
    : "homepage";

  function selectTab(tabId) {
    setSearchParams({
      tab: tabId,
    });
  }

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[100rem]
        space-y-5

        sm:space-y-6
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header>
        <div
          className="
            flex
            items-center
            gap-1.5
            text-[0.62rem]
            font-bold
            uppercase
            tracking-[0.13em]
            text-gray-400
          "
        >
          <WebRoundedIcon
            sx={{
              fontSize: 14,
            }}
          />
          Website management
        </div>

        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-[-0.035em]
            text-gray-950

            sm:text-3xl
          "
        >
          Website
        </h1>

        <p
          className="
            mt-1.5
            max-w-2xl
            text-xs
            leading-5
            text-gray-500

            sm:text-sm
            sm:leading-6
          "
        >
          Manage the customer storefront, homepage content, visual theme, media,
          and promotional experiences without changing application code.
        </p>
      </header>

      {/* =====================================================
          PUBLICATION
      ===================================================== */}
      <WebsitePublicationBar />

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <section
        className="
          overflow-hidden
          rounded-[1.3rem]
          border
          border-gray-200/80
          bg-white
          shadow-[0_6px_20px_rgba(15,23,42,0.035)]
        "
      >
        {/* DESKTOP LABEL */}
        <div
          className="
            hidden
            border-b
            border-gray-100
            px-5
            py-4

            sm:block

            lg:px-6
          "
        >
          <p
            className="
              text-[0.6rem]
              font-bold
              uppercase
              tracking-[0.12em]
              text-gray-400
            "
          >
            Website editor
          </p>

          <p
            className="
              mt-1
              text-sm
              font-bold
              text-gray-950
            "
          >
            Choose what you want to manage
          </p>
        </div>

        {/* TABS */}
        <div
          className="
            grid
            grid-cols-4

            sm:flex
            sm:items-center
            sm:gap-1
            sm:p-2
          "
          role="tablist"
          aria-label="Website management"
        >
          {WEBSITE_TABS.map(({ id, label, shortLabel, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`website-panel-${id}`}
                onClick={() => selectTab(id)}
                className={[
                  `
                      relative
                      flex
                      min-h-[4.5rem]
                      min-w-0
                      flex-col
                      items-center
                      justify-center
                      gap-1.5
                      border-r
                      border-gray-100
                      px-1.5
                      text-[0.62rem]
                      font-bold
                      transition-all

                      last:border-r-0

                      sm:min-h-11
                      sm:flex-row
                      sm:gap-2
                      sm:rounded-full
                      sm:border-0
                      sm:px-4
                      sm:text-sm
                    `,
                  isActive
                    ? `
                        bg-gray-950
                        text-white

                        sm:bg-gray-950
                      `
                    : `
                        bg-white
                        text-gray-500

                        hover:bg-gray-50
                        hover:text-gray-950
                      `,
                ].join(" ")}
              >
                <Icon
                  sx={{
                    fontSize: 18,
                  }}
                />

                <span
                  className="
                      max-w-full
                      truncate

                      sm:hidden
                    "
                >
                  {shortLabel}
                </span>

                <span
                  className="
                      hidden

                      sm:inline
                    "
                >
                  {label}
                </span>

                {/* MOBILE ACTIVE INDICATOR */}
                {isActive && (
                  <span
                    className="
                        absolute
                        bottom-0
                        left-1/2
                        h-[3px]
                        w-7
                        -translate-x-1/2
                        rounded-t-full
                        bg-white

                        sm:hidden
                      "
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          ACTIVE TAB
      ===================================================== */}
      <div
        id={`website-panel-${activeTab}`}
        role="tabpanel"
        className="
          min-w-0
        "
      >
        {activeTab === "homepage" && <WebsiteHomepageTab />}

        {activeTab === "theme" && <WebsiteThemeTab />}

        {activeTab === "media" && <WebsiteMediaTab />}

        {activeTab === "popups" && <WebsitePopupsTab />}
      </div>
    </section>
  );
}

export default AdminWebsite;
