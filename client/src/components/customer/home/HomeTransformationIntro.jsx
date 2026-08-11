import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";

import { usePublicProducts } from "../../../hooks/useCatalogData.js";

const HERO_PRODUCTS_QUERY = "sort=newest&page=1&limit=3";

const imageLayouts = [
  "left-[4%] top-[42%] h-[25%] w-[35%] -rotate-[4deg] sm:left-[6%] sm:top-[40%] sm:h-[28%] sm:w-[30%] lg:left-[5%] lg:top-[25%] lg:h-[43%] lg:w-[23%]",

  "left-[8%] top-[66%] h-[20%] w-[29%] rotate-[3deg] sm:left-[13%] sm:top-[66%] sm:h-[21%] sm:w-[25%] lg:left-[19%] lg:top-[54%] lg:h-[30%] lg:w-[18%]",

  "left-[28%] top-[57%] h-[18%] w-[25%] rotate-[7deg] sm:left-[31%] sm:top-[55%] sm:h-[20%] sm:w-[22%] lg:left-[31%] lg:top-[31%] lg:h-[27%] lg:w-[16%]",
];

function EditorialImage({ product, index }) {
  const [hasImageError, setHasImageError] = useState(false);

  const image = product?.image;

  const hasImage = Boolean(image?.imageUrl) && !hasImageError;

  const frameClass = `
    group absolute overflow-hidden rounded-[0.9rem]
    border border-white/75
    bg-brand-pale-champagne
    shadow-[0_18px_48px_rgba(36,29,32,0.12)]
    ${imageLayouts[index]}
  `;

  const content = (
    <>
      {hasImage ? (
        <img
          src={image.imageUrl}
          alt={image.altText || product.name}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          onError={() => setHasImageError(true)}
          className="
            h-full w-full object-cover
            transition duration-700
            group-hover:scale-[1.035]
            motion-reduce:transition-none
          "
        />
      ) : (
        <div
          className="
            relative flex h-full w-full items-end overflow-hidden
            bg-[linear-gradient(145deg,#F2E8D8_0%,#FBF8F3_46%,#E8D8BD_100%)]
            p-3 sm:p-4
          "
        >
          <div
            className="
              absolute -right-[14%] -top-[10%]
              h-[72%] w-[72%]
              rounded-full
              border border-brand-champagne/45
            "
            aria-hidden="true"
          />

          <div
            className="
              absolute -bottom-[24%] -left-[18%]
              h-[68%] w-[68%]
              rounded-full
              border border-brand-bronze/15
            "
            aria-hidden="true"
          />

          <p
            className="
              relative
              text-[0.55rem] font-bold uppercase
              tracking-[0.18em]
              text-brand-bronze/75
              sm:text-[0.62rem]
            "
          >
            Butterfly Dream
          </p>
        </div>
      )}

      <div
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-t
          from-brand-espresso/14
          via-transparent
          to-white/8
        "
        aria-hidden="true"
      />
    </>
  );

  if (!product) {
    return (
      <div className={frameClass} aria-hidden="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      aria-label={`View ${product.name}`}
      className={frameClass}
    >
      {content}
    </Link>
  );
}

function DecorativeBranch() {
  return (
    <svg
      viewBox="0 0 360 180"
      className="
        pointer-events-none
        absolute -right-8 top-[22%] z-[1]
        w-[72%] max-w-[420px]
        opacity-55
        sm:right-0 sm:top-[20%] sm:w-[58%]
        lg:-right-2 lg:top-[10%] lg:w-[38%]
      "
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M365 24C306 22 262 42 224 70C190 95 164 116 118 123C91 127 67 125 42 118"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="text-brand-bronze/55"
      />

      <path
        d="M272 50C254 27 237 17 215 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="text-brand-bronze/35"
      />

      <path
        d="M184 98C166 82 151 74 132 70"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        className="text-brand-bronze/30"
      />

      <path
        d="M116 123C102 139 89 148 70 155"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-brand-bronze/28"
      />
    </svg>
  );
}

function HomeTransformationIntro({ sectionRef }) {
  const { data } = usePublicProducts(HERO_PRODUCTS_QUERY);

  const products = data?.products ?? [];

  return (
    <section
      ref={sectionRef}
      id="home-transformation"
      className="
        relative
        h-[235svh]
        bg-transparent
        sm:h-[245svh]
        lg:h-[255svh]
      "
      aria-labelledby="home-transformation-title"
      data-home-section="transformation"
    >
      {/*
        The section is tall only to give the 241 animation frames
        enough scroll distance.

        The visible content stays sticky and occupies one viewport.
      */}
      <div
        className="
          sticky
          top-[72px]
          h-[calc(100svh-72px)]
          min-h-[548px]
          overflow-hidden

          lg:top-[84px]
          lg:h-[calc(100svh-84px)]
          lg:min-h-[620px]
        "
      >
        {/* Soft luxury background wash */}
        <div
          className="
            pointer-events-none
            absolute inset-0

            bg-[radial-gradient(circle_at_78%_37%,rgba(242,232,216,0.62),transparent_31%),linear-gradient(180deg,rgba(248,245,241,0.48)_0%,rgba(248,245,241,0.03)_45%,rgba(248,245,241,0.76)_100%)]
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute -left-24 top-[36%]
            h-72 w-72
            rounded-full
            bg-white/50
            blur-3xl

            sm:h-96 sm:w-96
          "
          aria-hidden="true"
        />

        <DecorativeBranch />

        <div className="page-container relative z-10 h-full">
          {/* Main typography */}
          <div
            className="
              absolute left-5 top-7
              max-w-[15.5rem]

              sm:left-8
              sm:top-10
              sm:max-w-sm

              lg:left-12
              lg:top-[12%]
              lg:max-w-[30rem]

              xl:left-0
            "
          >
            <p
              className="
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.24em]
                text-brand-bronze

                sm:text-[0.68rem]
              "
            >
              Butterfly Dream · The transformation
            </p>

            <h1
              id="home-transformation-title"
              className="
                mt-3
                font-display
                text-[2.65rem]
                font-medium
                leading-[0.88]
                tracking-[-0.05em]
                text-brand-espresso

                sm:text-[3.6rem]

                lg:mt-5
                lg:text-[clamp(4.25rem,6vw,6.4rem)]
              "
            >
              <span
                className="
                  block
                  text-[0.42em]
                  font-body
                  font-bold
                  uppercase
                  tracking-[0.17em]
                  text-brand-espresso/72
                "
              >
                Every dream
              </span>

              <span className="mt-1 block italic">begins a</span>

              <span className="block">transformation.</span>
            </h1>
          </div>

          {/* Editorial jewelry photography */}
          <div
            className="absolute inset-0 z-[2]"
            aria-label="Butterfly Dream editorial pieces"
          >
            {[0, 1, 2].map((index) => (
              <EditorialImage
                key={products[index]?.id ?? `editorial-${index}`}
                product={products[index]}
                index={index}
              />
            ))}
          </div>

          {/* Supporting copy */}
          <div
            className="
              absolute
              bottom-[7.5rem]
              right-5
              z-[3]

              w-[43%]
              max-w-[11.5rem]
              text-right

              sm:bottom-[8.5rem]
              sm:right-8
              sm:max-w-[15rem]

              lg:bottom-[13%]
              lg:right-12
              lg:w-[22rem]
              lg:max-w-none

              xl:right-0
            "
          >
            <p
              className="
                text-[0.72rem]
                leading-[1.65]
                text-brand-muted

                sm:text-sm
                sm:leading-6

                lg:text-base
                lg:leading-7
              "
            >
              Jewelry that becomes part of your story — made for the moments
              when you choose who you are becoming.
            </p>

            <Link
              to="/products"
              className="
                group
                mt-4
                inline-flex
                min-h-10
                items-center
                gap-2

                rounded-full
                border
                border-brand-bronze/55

                bg-brand-ivory/72

                px-4

                text-[0.7rem]
                font-bold
                uppercase
                tracking-[0.13em]
                text-brand-bronze

                backdrop-blur-sm

                transition

                hover:border-brand-bronze
                hover:bg-brand-bronze
                hover:text-white

                sm:mt-5
                sm:min-h-11
                sm:px-5
                sm:text-xs
              "
            >
              Explore now
              <ArrowOutwardRoundedIcon
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
                sx={{ fontSize: 17 }}
              />
            </Link>
          </div>

          {/* Editorial annotation */}
          <div
            className="
              absolute
              right-5
              top-[38%]
              z-[3]

              hidden
              flex-col
              items-end
              gap-2
              text-right

              sm:flex

              lg:right-12
              lg:top-[36%]

              xl:right-0
            "
          >
            <span
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.24em]
                text-brand-bronze/75
              "
            >
              Chrysalis · Butterfly · Jewel
            </span>

            <span
              className="h-px w-20 bg-brand-champagne/70"
              aria-hidden="true"
            />
          </div>

          {/* Scroll hint */}
          <div
            className="
              absolute
              bottom-5
              left-1/2
              z-[4]

              flex
              -translate-x-1/2
              flex-col
              items-center
              gap-1.5

              text-brand-espresso/55

              sm:bottom-7
            "
          >
            <span
              className="
                whitespace-nowrap
                text-[0.56rem]
                font-bold
                uppercase
                tracking-[0.22em]
              "
            >
              Scroll to transform
            </span>

            <ArrowDownwardRoundedIcon
              className="animate-bounce motion-reduce:animate-none"
              sx={{ fontSize: 17 }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Transition into next section */}
        <div
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0 z-[5]
            h-24

            bg-gradient-to-t
            from-brand-ivory
            via-brand-ivory/60
            to-transparent
          "
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export default HomeTransformationIntro;
