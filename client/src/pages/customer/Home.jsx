import { useRef } from "react";
import { Link } from "react-router-dom";

import HomeCategories from "../../components/customer/home/HomeCategories.jsx";
import HomeFeaturedCollection from "../../components/customer/home/HomeFeaturedCollection.jsx";
import { ButterflyTransformationHero } from "../../components/customer/home/ButterflyTransformationHero/ButterflyTransformationHero.jsx";

function SectionPlaceholder({
  id,
  eyebrow,
  title,
  description,
  background = "ivory",
  align = "left",
}) {
  const toneClasses = {
    ivory: {
      wash: "from-brand-ivory/88 via-brand-ivory/48 to-transparent",
      panel: "border-white/55 bg-brand-ivory/72",
      window: "border-brand-border/60 bg-white/10",
      eyebrow: "eyebrow-text",
      title: "text-brand-espresso",
      description: "text-brand-muted",
      label: "text-brand-bronze",
    },

    white: {
      wash: "from-white/90 via-white/52 to-transparent",
      panel: "border-white/65 bg-white/72",
      window: "border-white/65 bg-white/10",
      eyebrow: "eyebrow-text",
      title: "text-brand-espresso",
      description: "text-brand-muted",
      label: "text-brand-bronze",
    },

    cream: {
      wash: "from-brand-cream/90 via-brand-cream/50 to-transparent",
      panel: "border-white/55 bg-brand-cream/72",
      window: "border-brand-border/55 bg-brand-cream/10",
      eyebrow: "eyebrow-text",
      title: "text-brand-espresso",
      description: "text-brand-muted",
      label: "text-brand-bronze",
    },

    champagne: {
      wash: "from-brand-pale-champagne/90 via-brand-pale-champagne/48 to-transparent",
      panel: "border-white/55 bg-brand-pale-champagne/72",
      window: "border-brand-champagne/45 bg-white/10",
      eyebrow: "eyebrow-text",
      title: "text-brand-espresso",
      description: "text-brand-muted",
      label: "text-brand-bronze",
    },

    forest: {
      wash: "from-brand-forest/92 via-brand-forest/58 to-transparent",
      panel: "border-white/20 bg-brand-forest/78",
      window: "border-white/25 bg-white/5",
      eyebrow:
        "text-xs font-bold uppercase tracking-[0.2em] text-brand-champagne",
      title: "text-white",
      description: "text-white/72",
      label: "text-brand-champagne",
    },
  };

  const tone = toneClasses[background] ?? toneClasses.ivory;
  const gradientDirection =
    align === "right" ? "bg-gradient-to-l" : "bg-gradient-to-r";

  return (
    <section
      id={id}
      className="relative isolate flex min-h-[78svh] items-center overflow-hidden section-spacing"
      aria-labelledby={`${id}-title`}
      data-home-section={id}
    >
      {/* Translucent section wash */}
      <div
        className={`pointer-events-none absolute inset-0 -z-20 ${gradientDirection} ${tone.wash}`}
        aria-hidden="true"
      />

      {/* Soft transition from the previous section */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-brand-ivory/65 to-transparent"
        aria-hidden="true"
      />

      <div className="page-container w-full">
        <div
          className={`grid gap-8 lg:grid-cols-12 lg:items-center ${
            align === "right" ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          {/* Readable text surface */}
          <div className="lg:col-span-5">
            <div
              className={`rounded-[1.75rem] border p-6 backdrop-blur-md sm:p-8 lg:p-10 ${tone.panel}`}
            >
              <p className={tone.eyebrow}>{eyebrow}</p>

              <h2
                id={`${id}-title`}
                className={`section-heading mt-4 ${tone.title}`}
              >
                {title}
              </h2>

              <p
                className={`mt-5 max-w-xl text-base leading-7 sm:text-lg ${tone.description}`}
              >
                {description}
              </p>
            </div>
          </div>

          {/* Transparent animation window */}
          <div className="lg:col-span-7">
            <div
              className={`relative flex min-h-[320px] items-end overflow-hidden rounded-[1.75rem] border p-6 backdrop-blur-[1px] sm:min-h-[440px] sm:p-8 ${tone.window}`}
              data-animation-window
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/5"
                aria-hidden="true"
              />

              <p
                className={`relative z-10 max-w-xs text-xs font-bold uppercase tracking-[0.2em] ${tone.label}`}
              >
                The transformation continues
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeIntro() {
  return (
    <section
      className="relative flex min-h-[100svh] items-end overflow-hidden"
      aria-labelledby="home-intro-title"
      data-home-section="intro"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-ivory/5 via-transparent to-brand-ivory/80" />

      <div className="page-container relative z-10 w-full pb-14 pt-32 sm:pb-20 lg:pb-24">
        <div className="max-w-xl">
          <p className="eyebrow-text">Butterfly Dream</p>

          <h1
            id="home-intro-title"
            className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-[-0.045em] text-brand-espresso sm:text-6xl lg:text-7xl"
          >
            Every dream begins with transformation.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-brand-muted sm:text-lg">
            Follow the journey from chrysalis to butterfly, and from butterfly
            to a piece created to carry your story.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              to="/products"
              className="button-base button-primary w-fit rounded-full"
            >
              Shop the collection
            </Link>

            <a
              href="#home-categories"
              className="button-base button-outline w-fit rounded-full"
            >
              Explore Butterfly Dream
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const pageRef = useRef(null);

  return (
    <main
      ref={pageRef}
      className="relative isolate bg-transparent text-brand-espresso"
      data-butterfly-homepage
    >
      <ButterflyTransformationHero pageRef={pageRef} />

      <div className="relative z-10">
        {/* 1. Opening animation scene */}
        <HomeIntro />

        {/* 2. Categories */}
        <HomeCategories />

        {/* 3. Featured collection */}
        <HomeFeaturedCollection />

        {/* 4. New arrivals */}
        <SectionPlaceholder
          id="home-new-arrivals"
          eyebrow="Just arrived"
          title="New expressions of elegance"
          description="A clean product section highlighting the latest additions to the Butterfly Dream collection."
          background="white"
          align="right"
        />

        {/* 5. Customized accessories */}
        <SectionPlaceholder
          id="home-customized"
          eyebrow="Made personal"
          title="Accessories shaped around your story"
          description="A premium introduction to customized jewelry and accessories designed for meaningful gifts and personal moments."
          background="champagne"
        />

        {/* 6. Promotional editorial banner */}
        <SectionPlaceholder
          id="home-editorial"
          eyebrow="The seasonal edit"
          title="A cinematic editorial moment"
          description="A full-width campaign banner for seasonal collections, special releases, or limited Butterfly Dream stories."
          background="cream"
          align="right"
        />

        {/* 7. Trust and service benefits */}
        <SectionPlaceholder
          id="home-benefits"
          eyebrow="The Butterfly Dream experience"
          title="Thoughtful service at every step"
          description="Delivery, payment, customer care, quality, and shopping reassurance presented without a generic dashboard appearance."
          background="white"
        />

        {/* 8. Newsletter */}
        <SectionPlaceholder
          id="home-newsletter"
          eyebrow="Enter the dream"
          title="Stories, new pieces, and private releases"
          description="A refined newsletter invitation that closes the homepage before the customer footer."
          background="forest"
          align="right"
        />
      </div>
    </main>
  );
}

export default Home;
