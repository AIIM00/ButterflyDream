import { Link } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

function NotFound() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center

        bg-brand-page

        px-4
        py-16

        text-brand-text

        sm:px-6
      "
    >
      <section
        className="
          relative

          w-full
          max-w-2xl

          overflow-hidden

          rounded-[2rem]

          border
          border-brand-border

          bg-brand-surface

          px-6
          py-14

          text-center

          shadow-[0_18px_50px_rgba(0,0,0,0.05)]

          sm:px-10
          sm:py-20
        "
      >
        {/* ==================================================
            DECORATIVE DETAILS
        ================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            -right-20
            -top-20

            h-52
            w-52

            rounded-full

            border
            border-brand-accent-fill/25
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            -bottom-24
            -left-20

            h-56
            w-56

            rounded-full

            border
            border-brand-border/70
          "
        />

        {/* soft central glow */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            left-1/2
            top-1/3

            h-56
            w-56

            -translate-x-1/2
            -translate-y-1/2

            rounded-full

            bg-brand-accent-soft/40

            blur-3xl
          "
        />

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="relative z-10">
          {/* ICON */}

          <span
            className="
              mx-auto

              inline-flex
              h-14
              w-14

              items-center
              justify-center

              rounded-full

              bg-brand-accent-soft

              text-brand-accent-text
            "
          >
            <AutoAwesomeOutlinedIcon
              sx={{
                fontSize: 25,
              }}
            />
          </span>

          {/* ERROR LABEL */}

          <p
            className="
              mt-6

              text-[0.62rem]
              font-bold
              uppercase

              tracking-[0.24em]

              text-brand-accent-text
            "
          >
            Error 404
          </p>

          {/* HEADING */}

          <h1
            className="
              mx-auto
              mt-3
              max-w-xl

              font-display

              text-[3rem]
              font-medium

              leading-[0.92]

              tracking-[-0.05em]

              text-brand-text

              sm:text-6xl
            "
          >
            This page has
            <span
              className="
                block

                font-normal
                italic

                text-brand-accent-text
              "
            >
              flown away.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-5
              max-w-md

              text-sm
              leading-7

              text-brand-text-muted

              sm:text-[0.95rem]
            "
          >
            The page you’re looking for may have moved, changed, or no longer
            exists. Continue exploring Butterfly Dream and find something that
            speaks to you.
          </p>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              mt-8

              flex
              flex-wrap

              justify-center

              gap-3
            "
          >
            {/* PRIMARY */}

            <Link
              to="/"
              className="
                group

                inline-flex
                min-h-12

                items-center
                justify-center

                gap-2

                rounded-full

                bg-brand-primary

                px-6

                text-sm
                font-semibold

                text-brand-surface

                transition-all
                duration-200

                hover:bg-brand-primary-hover

                active:scale-[0.98]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/40
                focus-visible:ring-offset-2
                focus-visible:ring-offset-brand-surface
              "
            >
              Return home
              <ArrowForwardRoundedIcon
                className="
                  transition-transform
                  duration-200

                  group-hover:translate-x-0.5
                "
                sx={{
                  fontSize: 19,
                }}
              />
            </Link>

            {/* SECONDARY */}

            <Link
              to="/products"
              className="
                inline-flex
                min-h-12

                items-center
                justify-center

                rounded-full

                border
                border-brand-primary

                bg-transparent

                px-6

                text-sm
                font-semibold

                text-brand-primary

                transition-all
                duration-200

                hover:bg-brand-primary
                hover:text-brand-surface

                active:scale-[0.98]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/40
                focus-visible:ring-offset-2
                focus-visible:ring-offset-brand-surface
              "
            >
              Explore collection
            </Link>
          </div>

          {/* ==================================================
              BRAND NOTE
          ================================================== */}

          <p
            className="
              mt-10

              text-[0.56rem]
              font-semibold
              uppercase

              tracking-[0.2em]

              text-brand-text-muted
            "
          >
            Butterfly Dream · Jewelry made part of your story
          </p>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
