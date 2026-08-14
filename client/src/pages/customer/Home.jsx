import HomeSectionRenderer from "../../components/customer/home/HomeSectionRenderer.jsx";

import useSiteTheme from "../../context/site-theme/useSiteTheme.js";

function HomeLoading() {
  return (
    <div
      className="
        min-h-[100svh]
        bg-brand-ivory
      "
      aria-hidden="true"
    >
      <div
        className="
          h-[72svh]
          min-h-[500px]
          animate-pulse
          bg-brand-pale-champagne/30

          sm:h-[78svh]

          lg:h-[88svh]
          lg:min-h-[650px]
        "
      />
    </div>
  );
}

function Home() {
  const { sections, isLoadingTheme, themeError } = useSiteTheme();

  /*
   * The server already returns these ordered by
   * position, but sorting again here protects the
   * storefront if that API implementation changes.
   *
   * Announcement Bar is site chrome and is rendered
   * from CustomerLayout, not inside the homepage.
   */
  const homepageSections = Array.isArray(sections)
    ? [...sections]
        .filter((section) => section.type !== "ANNOUNCEMENT_BAR")
        .sort(
          (firstSection, secondSection) =>
            (firstSection.position ?? 0) - (secondSection.position ?? 0),
        )
    : [];

  if (isLoadingTheme) {
    return (
      <main
        className="
          relative
          isolate
          bg-brand-ivory
          text-brand-espresso
        "
        data-butterfly-homepage
      >
        <HomeLoading />
      </main>
    );
  }

  /*
   * Theme failure should not crash the whole
   * storefront. SiteThemeProvider already keeps
   * fallback CSS variables available.
   */
  if (themeError && import.meta.env.DEV) {
    console.error("Homepage configuration could not be loaded.", themeError);
  }

  return (
    <main
      className="
        relative
        isolate
        bg-brand-ivory
        text-brand-espresso
      "
      data-butterfly-homepage
    >
      {homepageSections.map((section) => (
        <HomeSectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}

export default Home;
