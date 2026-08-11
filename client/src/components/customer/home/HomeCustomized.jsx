import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

function HomeCustomized() {
  const [hasImageError, setHasImageError] = useState(false);
  const navigate = useNavigate();
  return (
    <section
      id="home-customized"
      className="
        relative
        overflow-hidden
        py-14
        sm:py-16
        lg:py-20
      "
      aria-labelledby="home-customized-title"
      data-home-section="customized"
    >
      {/* Background */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          
        "
        aria-hidden="true"
      />

      {/* Decorative glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-24
          top-10
          -z-10
          h-72
          w-72
          rounded-full
          bg-gradient-to-br
from-brand-pale-champagne/90
via-brand-cream/90
to-brand-ivory
        "
        aria-hidden="true"
      />

      <div className="page-container">
        <div
          className="
            overflow-hidden
            rounded-[1.6rem]
            lg:grid
            lg:grid-cols-[0.95fr_1.05fr]
          "
        >
          {/* IMAGE */}
          <div
            className="
              relative
              h-[330px]
              overflow-hidden
              bg-brand-pale-champagne

              sm:h-[430px]

              lg:h-[560px]
            "
          >
            {!hasImageError ? (
              <img
                src="/media/home/customized/customized-accessories.jpg"
                alt="Customized Butterfly Dream accessories"
                loading="lazy"
                onError={() => setHasImageError(true)}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-1000
                  hover:scale-[1.025]
                "
              />
            ) : (
              <div
                className="
                  relative
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  overflow-hidden

                  bg-[linear-gradient(145deg,#E9D9C3_0%,#F7F1E8_48%,#D7BE98_100%)]
                "
              >
                <div
                  className="
                    absolute
                    -left-20
                    -top-20
                    h-56
                    w-56
                    rounded-full
                    border
                    border-white/60
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-20
                    -right-16
                    h-64
                    w-64
                    rounded-full
                    border
                    border-brand-bronze/15
                  "
                />

                <div className="relative text-center text-brand-bronze">
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 26 }} />

                  <p
                    className="
                      mt-3
                      text-[0.58rem]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                    "
                  >
                    Butterfly Dream
                  </p>
                </div>
              </div>
            )}

            {/* Overlay */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-brand-espresso/25
                via-transparent
                to-transparent
              "
              aria-hidden="true"
            />

            {/* Floating label */}
            <div
              className="
                absolute
                bottom-4
                left-4

                rounded-full
                border
                border-white/50
                bg-white/75

                px-3
                py-1.5

                text-[0.55rem]
                font-bold
                uppercase
                tracking-[0.16em]
                text-brand-bronze

                backdrop-blur-md

                sm:bottom-5
                sm:left-5
              "
            >
              Made for you
            </div>
          </div>

          {/* CONTENT */}
          <div
            className="
              flex
              flex-col
              justify-center
              max-w-[24rem]
              px-5
              py-8
              sm:px-8
              sm:py-10
              lg:px-12
              lg:py-14
            "
          >
            <p
              className="
                text-[0.58rem]
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-bronze

                sm:text-xs
              "
            >
              Made personal
            </p>

            <h2
              id="home-customized-title"
              className="
                mt-3
                font-display
                text-[2rem]
                font-bold
                leading-[1]
                tracking-[-0.045em]
                text-brand-espresso

                sm:text-[3rem]

                lg:text-[3.8rem]
              "
            >
              Accessories shaped around your story.
            </h2>

            <p
              className="
                mt-5
                

                text-xs
                text-brand-muted

                sm:text-base
                sm:leading-7
              "
            >
              Create something more personal — an accessory designed to hold
              meaning, celebrate a moment, or become part of someone&apos;s
              story.
            </p>

            {/* Editorial details */}
            <div
              className="
              max-w-[12rem]
    mt-7
    flex
    flex-col
    border-y
    border-brand-bronze/15
  "
            >
              <div className="py-4">
                <p
                  className="
        text-[0.54rem]
        font-bold
        uppercase
        tracking-[0.14em]
        text-brand-bronze
      "
                >
                  Personal
                </p>

                <p className="mt-1 text-xs text-brand-muted">Made meaningful</p>
              </div>

              <div
                className="
      border-t
      border-brand-bronze/15
      py-4
    "
              >
                <p
                  className="
        text-[0.54rem]
        font-bold
        uppercase
        tracking-[0.14em]
        text-brand-bronze
      "
                >
                  Thoughtful
                </p>

                <p className="mt-1 text-xs text-brand-muted">
                  Made for moments
                </p>
              </div>

              <div
                className="
      border-t
      border-brand-bronze/15
      py-4
    "
              >
                <p
                  className="
        text-[0.54rem]
        font-bold
        uppercase
        tracking-[0.14em]
        text-brand-bronze
      "
                >
                  Yours
                </p>

                <p className="mt-1 text-xs text-brand-muted">Made to keep</p>
              </div>
            </div>

            {/* CTA */}
            <div className="max-w-[12rem] mt-7">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="
      button-base
      button-primary
      group
      w-fit
      rounded-full
      px-5

      text-[0.68rem]
      uppercase
      tracking-[0.13em]

      sm:text-xs
    "
              >
                Explore customization
                <ArrowForwardRoundedIcon
                  aria-hidden="true"
                  className="
        transition-transform
        duration-200
        group-hover:translate-x-1
      "
                  sx={{ fontSize: 17 }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeCustomized;
