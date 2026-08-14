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
        bg-brand-ivory
        px-4
        py-16
        text-brand-espresso

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

          sm:px-10
          sm:py-20
        "
      >
        {/* DECORATIVE DETAILS */}
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
            border-brand-champagne/30
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
            border-brand-border
          "
        />

        <div className="relative z-10">
          <span
            className="
              mx-auto
              inline-flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-brand-pale-champagne
              text-brand-bronze
            "
          >
            <AutoAwesomeOutlinedIcon
              sx={{
                fontSize: 25,
              }}
            />
          </span>

          <p
            className="
              mt-6
              text-[0.65rem]
              font-bold
              uppercase
              tracking-[0.24em]
              text-brand-bronze
            "
          >
            Error 404
          </p>

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
              text-brand-espresso

              sm:text-6xl
            "
          >
            This page has
            <span className="block italic text-brand-bronze">flown away.</span>
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-md
              text-sm
              leading-7
              text-brand-muted

              sm:text-[0.95rem]
            "
          >
            The page you’re looking for may have moved, changed, or no longer
            exists. Continue exploring Butterfly Dream and find something that
            speaks to you.
          </p>

          <div
            className="
              mt-8
              flex
              flex-wrap
              justify-center
              gap-3
            "
          >
            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-brand-espresso
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-brand-emerald
              "
            >
              Return home
              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>

            <Link
              to="/products"
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-brand-espresso
                px-6
                py-3
                text-sm
                font-semibold
                text-brand-espresso
                transition
                hover:bg-brand-espresso
                hover:text-white
              "
            >
              Explore collection
            </Link>
          </div>

          <p
            className="
              mt-10
              text-[0.58rem]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-brand-muted
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
