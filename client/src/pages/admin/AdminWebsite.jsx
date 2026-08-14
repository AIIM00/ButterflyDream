import { useSearchParams } from "react-router-dom";

import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import StadiumIcon from "@mui/icons-material/Stadium";

import WebsiteMediaTab from "../../components/admin/website/WebsiteMediaTab.jsx";
import WebsiteHomepageTab from "../../components/admin/website/WebsiteHomepageTab.jsx";
import WebsiteThemeTab from "../../components/admin/website/WebsiteThemeTab.jsx";
import WebsitePublicationBar from "../../components/admin/website/WebsitePublicationBar.jsx";
import WebsitePopupsTab from "../../components/admin/website/WebsitePopupsTab.jsx";

const WEBSITE_TABS = [
  {
    id: "homepage",
    label: "Homepage",
    icon: HomeRoundedIcon,
  },
  {
    id: "theme",
    label: "Theme",
    icon: BrushRoundedIcon,
  },
  {
    id: "media",
    label: "Media",
    icon: PhotoLibraryRoundedIcon,
  },
  {
    id: "popups",
    label: "Popup",
    icon: StadiumIcon,
  },
];

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
    <section className="space-y-7">
      <header>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
          <WebRoundedIcon fontSize="small" />
          Website management
        </div>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          Website
        </h2>

        <p className="mt-3 max-w-2xl text-gray-600">
          Manage the customer storefront, website appearance, homepage sections,
          and media without editing application code.
        </p>
      </header>
      {/* PUBLISH / PREVIEW STATUS */}
      <div className="mt-6">
        <WebsitePublicationBar />
      </div>
      <div className="overflow-x-auto border-b border-gray-200">
        <div
          className="flex min-w-max gap-1"
          role="tablist"
          aria-label="Website management"
        >
          {WEBSITE_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectTab(id)}
                className={[
                  "relative inline-flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "text-gray-950"
                    : "text-gray-500 hover:text-gray-950",
                ].join(" ")}
              >
                <Icon fontSize="small" />

                {label}

                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gray-950" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "homepage" && <WebsiteHomepageTab />}

      {activeTab === "theme" && <WebsiteThemeTab />}

      {activeTab === "media" && <WebsiteMediaTab />}
      {activeTab === "popups" && <WebsitePopupsTab />}
    </section>
  );
}

export default AdminWebsite;
