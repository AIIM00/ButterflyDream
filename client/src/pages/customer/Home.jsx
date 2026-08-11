import { useEffect, useRef, useState } from "react";
import { usePublicProducts } from "../../hooks/useCatalogData.js";
import { Link, useNavigate } from "react-router-dom";
import HomeCategories from "../../components/customer/home/HomeCategories.jsx";
import HomeCollection from "../../components/customer/home/HomeCollection.jsx";
import HomeFeaturedCollection from "../../components/customer/home/HomeFeaturedCollection.jsx";
import Feedback from "../../components/customer/home/HomeFeedback.jsx";
import { ButterflyTransformationHero } from "../../components/customer/home/ButterflyTransformationHero/ButterflyTransformationHero.jsx";
import HomeOpeningSlider from "../../components/customer/home/HomeOpeningSlider.jsx";
import HomeCustomized from "../../components/customer/home/HomeCustomized.jsx";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
const HOME_INTRO_PRODUCTS_QUERY = "sort=newest&page=1&limit=3";

const introCardPositions = [
  `
    z-30
    translate-x-0
    translate-y-0
    rotate-[-2deg]
    scale-100
    opacity-100
  `,
  `
    z-20
    translate-x-[22%]
    translate-y-[8%]
    rotate-[4deg]
    scale-[0.92]
    opacity-90
  `,
  `
    z-10
    translate-x-[42%]
    translate-y-[15%]
    rotate-[8deg]
    scale-[0.84]
    opacity-65
  `,
];

function HomeIntroImageCard({ product, position }) {
  const [hasImageError, setHasImageError] = useState(false);

  const image = product?.image;
  const hasImage = Boolean(image?.imageUrl) && !hasImageError;

  const card = (
    <div
      className={`
        absolute
        left-0
        top-0

        h-[10.5rem]
        w-[7.6rem]

        overflow-hidden
        rounded-[1rem]

        border
        border-white/80

        bg-brand-pale-champagne

        shadow-[0_18px_42px_rgba(50,38,40,0.16)]

        transition-all
        duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]

        will-change-transform

        sm:h-[13.5rem]
        sm:w-[9.5rem]

        lg:h-[17rem]
        lg:w-[12rem]

        ${introCardPositions[position]}
      `}
    >
      {hasImage ? (
        <img
          src={image.imageUrl}
          alt={image.altText || product?.name || "Butterfly Dream jewelry"}
          loading={position === 0 ? "eager" : "lazy"}
          onError={() => setHasImageError(true)}
          className="
            h-full
            w-full
            object-cover

            transition-transform
            duration-700

            hover:scale-[1.035]
          "
        />
      ) : (
        <div
          className="
            relative
            flex
            h-full
            w-full
            items-end

            overflow-hidden

            bg-[linear-gradient(145deg,#F0E4D3_0%,#FBF8F3_52%,#E6D1B1_100%)]

            p-3
          "
        >
          <div
            className="
              absolute
              -right-10
              -top-8
              h-28
              w-28
              rounded-full
              border
              border-brand-champagne/60
            "
          />

          <div
            className="
              absolute
              -bottom-10
              -left-8
              h-28
              w-28
              rounded-full
              border
              border-brand-bronze/20
            "
          />

          <span
            className="
              relative
              text-[0.5rem]
              font-bold
              uppercase
              tracking-[0.2em]
              text-brand-bronze
            "
          >
            Butterfly Dream
          </span>
        </div>
      )}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-brand-espresso/15
          via-transparent
          to-white/10
        "
      />
    </div>
  );

  if (!product) {
    return card;
  }

  return (
    <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
      {card}
    </Link>
  );
}

function HomeIntro() {
  const navigate = useNavigate();
  const { data } = usePublicProducts(HOME_INTRO_PRODUCTS_QUERY);

  const products = data?.products ?? [];

  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveCard((current) => (current + 1) % 3);
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      className="
        relative
        min-h-[100svh]
        overflow-hidden
      "
      aria-labelledby="home-intro-title"
      data-home-section="intro"
    >
      {/* Soft readable wash only on the left */}
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          w-[82%]

          bg-gradient-to-r
          from-brand-ivory/90
          via-brand-ivory/50
          to-transparent

          sm:w-[72%]
          lg:w-[58%]
        "
        aria-hidden="true"
      />

      <div className="page-container relative z-10 min-h-[100svh] py-12 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-20">
        <div
          className="
            flex
            h-full
            max-w-[17rem]
            flex-col

            sm:max-w-[24rem]

            lg:max-w-[34rem]
          "
        >
          {/* Small brand label */}
          <p
            className="
              text-[0.58rem]
              font-bold
              uppercase
              tracking-[0.24em]
              text-brand-bronze

              sm:text-[0.65rem]
            "
          >
            Butterfly Dream
          </p>

          {/* Main title */}
          <h1
            id="home-intro-title"
            className="
              mt-3

              font-display
              text-[2rem]
              font-bold
              leading-[0.95]
              tracking-[-0.045em]
              text-brand-espresso

              sm:mt-4
              sm:text-[3rem]

              lg:text-[4.5rem]
              lg:leading-[0.9]
            "
          >
            Every dream begins with transformation.
          </h1>

          {/* Supporting copy */}
          <p
            className="
              mt-4
              max-w-[16rem]

              text-[0.78rem]
              leading-[1.65]
              text-brand-muted

              sm:mt-5
              sm:max-w-sm
              sm:text-sm
              sm:leading-6

              lg:mt-6
              lg:max-w-md
              lg:text-base
              lg:leading-7
            "
          >
            Follow the journey from chrysalis to butterfly, and from butterfly
            to a piece created to carry your story.
          </p>

          {/* Rotating editorial card stack */}
          <div
            className="
              relative

              mt-8

              h-[13rem]
              w-[15rem]

              sm:mt-10
              sm:h-[16.5rem]
              sm:w-[20rem]

              lg:mt-12
              lg:h-[20rem]
              lg:w-[27rem]
            "
            aria-label="Butterfly Dream selected pieces"
          >
            {[0, 1, 2].map((index) => {
              const position = (index - activeCard + 3) % 3;

              return (
                <HomeIntroImageCard
                  key={products[index]?.id ?? `intro-card-${index}`}
                  product={products[index]}
                  position={position}
                />
              );
            })}
          </div>

          {/* Small navigation underneath */}
          <div
            className="
              mt-4
              flex
              gap-6
              items-center
              sm:mt-4
              
            "
          >
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`
                    h-1
                    rounded-full
                    transition-all
                    duration-500

                    ${
                      index === activeCard
                        ? "w-5 bg-brand-bronze"
                        : "w-1 bg-brand-bronze/25"
                    }
                  `}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="button-base button-primary w-fit rounded-full px-5 py-2.5 text-[0.52rem] uppercase tracking-[0.14em] sm:text-xs"
            >
              Explore collection
              <ArrowForwardRoundedIcon
                aria-hidden="true"
                className="
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
                sx={{
                  fontSize: 14,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom transition */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-24

          bg-gradient-to-t
          from-brand-ivory/80
          to-transparent
        "
        aria-hidden="true"
      />
    </section>
  );
}

function Home() {
  const transformationRef = useRef(null);

  return (
    <main
      className="relative isolate bg-transparent text-brand-espresso"
      data-butterfly-homepage
    >
      <ButterflyTransformationHero sectionRef={transformationRef} />

      <div className="relative z-10">
        <HomeOpeningSlider />

        {/* TRANSFORMATION TIMELINE */}
        <div
          ref={transformationRef}
          className="relative"
          data-transformation-story
        >
          <HomeIntro />

          <HomeCustomized />
        </div>

        {/* Animation has reached final frame here */}

        <HomeCategories />

        <HomeFeaturedCollection />

        <HomeCollection />
        <Feedback />

        {/* ... */}
      </div>
    </main>
  );
}

export default Home;
