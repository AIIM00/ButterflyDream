import { Link } from "react-router-dom";

const popupEvents = [
  {
    id: 1,
    title: "Event name",
    location: "Beirut, Lebanon",
    date: "May 2026",
    description:
      "A short description about Butterfly Dream's participation in this event.",
    images: [
      "/media/popups/image1.jpeg",
      "/media/popups/image4.jpeg",
      "/media/popups/image5.jpeg",
    ],
  },
  /*
    Add the owner's real popup events here.

    Example:

    {
      id: 1,
      title: "Event name",
      location: "Beirut, Lebanon",
      date: "May 2026",
      description:
        "A short description about Butterfly Dream's participation in this event.",
      images: [
        "/media/popups/event-1/image-1.webp",
        "/media/popups/event-1/image-2.webp",
        "/media/popups/event-1/image-3.webp",
      ],
    },
  */
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5 12H19M14 7L19 12L14 17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyPopupState() {
  return (
    <section className="px-5 pb-24 pt-8 sm:px-8 lg:px-12">
      <div
        className="
          mx-auto
          flex
          min-h-[360px]
          max-w-5xl
          flex-col
          items-center
          justify-center
          border
          border-[#211914]/10
          bg-[#F7F3EE]
          px-6
          text-center
        "
      >
        <p
          className="
            text-[0.62rem]
            font-semibold
            uppercase
            tracking-[0.24em]
            text-[#211914]/45
          "
        >
          Our story continues
        </p>

        <h2
          className="
            mt-4
            max-w-md
            font-['Bodoni_Moda']
            text-[2rem]
            font-normal
            leading-[1]
            tracking-[-0.035em]
            text-[#211914]
            sm:text-[2.7rem]
          "
        >
          Our pop-up memories are coming soon.
        </h2>

        <p
          className="
            mt-5
            max-w-sm
            text-[0.78rem]
            leading-6
            text-[#211914]/55
          "
        >
          Moments, places and stories from Butterfly Dream events will live
          here.
        </p>
      </div>
    </section>
  );
}

function EventGallery({ event, index }) {
  const [mainImage, secondImage, thirdImage] = event.images ?? [];

  return (
    <article
      className="
        border-t
        border-[#211914]/12
        px-5
        py-14
        sm:px-8
        sm:py-20
        lg:px-12
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          gap-10
          lg:grid-cols-12
          lg:gap-16
        "
      >
        {/* EVENT INFORMATION */}
        <div
          className={`
            lg:col-span-4
            ${index % 2 === 1 ? "lg:order-2 lg:col-start-9" : "lg:order-1"}
          `}
        >
          <div className="lg:sticky lg:top-28">
            <p
              className="
                text-[0.58rem]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#211914]/45
              "
            >
              Pop-up {String(index + 1).padStart(2, "0")}
            </p>

            <h2
              className="
                mt-4
                font-['Bodoni_Moda']
                text-[2.35rem]
                font-normal
                leading-[0.96]
                tracking-[-0.04em]
                text-[#211914]
                sm:text-[3rem]
              "
            >
              {event.title}
            </h2>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {event.location && (
                <p
                  className="
                    text-[0.68rem]
                    font-medium
                    uppercase
                    tracking-[0.11em]
                    text-[#211914]/70
                  "
                >
                  {event.location}
                </p>
              )}

              {event.date && (
                <p
                  className="
                    text-[0.68rem]
                    uppercase
                    tracking-[0.11em]
                    text-[#211914]/45
                  "
                >
                  {event.date}
                </p>
              )}
            </div>

            {event.description && (
              <p
                className="
                  mt-6
                  max-w-sm
                  text-[0.8rem]
                  leading-6
                  text-[#211914]/60
                "
              >
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* EVENT IMAGES */}
        <div
          className={`
            grid
            grid-cols-12
            gap-2.5
            sm:gap-4
            lg:col-span-8
            ${index % 2 === 1 ? "lg:order-1" : "lg:order-2"}
          `}
        >
          {mainImage && (
            <div
              className="
                col-span-8
                aspect-[3/4]
                overflow-hidden
                bg-[#F3EEE8]
              "
            >
              <img
                src={mainImage}
                alt={`${event.title} - Butterfly Dream popup`}
                loading="lazy"
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.02]
                "
              />
            </div>
          )}

          <div className="col-span-4 flex flex-col gap-2.5 sm:gap-4">
            {secondImage && (
              <div
                className="
                  aspect-[3/4]
                  overflow-hidden
                  bg-[#F3EEE8]
                "
              >
                <img
                  src={secondImage}
                  alt={`${event.title} popup detail`}
                  loading="lazy"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-[1.03]
                  "
                />
              </div>
            )}

            {thirdImage && (
              <div
                className="
                  aspect-square
                  overflow-hidden
                  bg-[#F3EEE8]
                "
              >
                <img
                  src={thirdImage}
                  alt={`${event.title} Butterfly Dream display`}
                  loading="lazy"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-[1.03]
                  "
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function PopupsPage() {
  return (
    <main className="bg-[#FCFBF9] text-[#211914]">
      {/* =========================
          HERO
      ========================== */}
      <section
        className="
          relative
          overflow-hidden
          px-5
          pb-14
          pt-12
          sm:px-8
          sm:pb-20
          sm:pt-16
          lg:px-12
          lg:pb-24
          lg:pt-20
        "
      >
        <div className="mx-auto max-w-7xl">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="
                text-[0.58rem]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#211914]/45
                transition-colors
                hover:text-[#211914]
              "
            >
              Home
            </Link>

            <span className="text-[#211914]/25">/</span>

            <span
              className="
                text-[0.58rem]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#211914]/75
              "
            >
              Pop-ups & Events
            </span>
          </div>

          <div
            className="
              mt-14
              grid
              gap-9
              sm:mt-20
              lg:grid-cols-12
              lg:items-end
            "
          >
            <div className="lg:col-span-8">
              <p
                className="
                  text-[0.62rem]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-[#211914]/45
                "
              >
                Butterfly Dream in the world
              </p>

              <h1
                className="
                  mt-5
                  max-w-[20rem]
                  font-['Bodoni_Moda']
                  text-[3.25rem]
                  font-normal
                  leading-[0.88]
                  tracking-[-0.055em]
                  text-[#211914]
                  sm:max-w-2xl
                  sm:text-[5rem]
                  lg:text-[6.5rem]
                "
              >
                Pop-ups
                <span className="block italic">& Events.</span>
              </h1>
            </div>

            <div className="lg:col-span-3 lg:col-start-10">
              <p
                className="
                  max-w-sm
                  text-[0.8rem]
                  leading-6
                  text-[#211914]/60
                "
              >
                From local gatherings to special events, discover the moments
                and places where Butterfly Dream has shared its jewelry,
                creativity and story in person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          INTRO STRIP
      ========================== */}
      <section
        className="
          border-y
          border-[#211914]/12
          px-5
          py-5
          sm:px-8
          lg:px-12
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            gap-6
          "
        >
          <p
            className="
              text-[0.61rem]
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#211914]/60
            "
          >
            Memories · Community · Jewelry
          </p>

          <div
            className="
              hidden
              items-center
              gap-2
              text-[0.61rem]
              uppercase
              tracking-[0.16em]
              text-[#211914]/45
              sm:flex
            "
          >
            Discover our journey
            <ArrowIcon />
          </div>
        </div>
      </section>

      {/* =========================
          EVENTS
      ========================== */}
      {popupEvents.length > 0 ? (
        <section>
          {popupEvents.map((event, index) => (
            <EventGallery key={event.id} event={event} index={index} />
          ))}
        </section>
      ) : (
        <EmptyPopupState />
      )}

      {/* =========================
          CLOSING SECTION
      ========================== */}
      <section
        className="
          border-t
          border-[#211914]/12
          px-5
          py-20
          text-center
          sm:px-8
          sm:py-28
          lg:px-12
        "
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="
              text-[0.6rem]
              font-semibold
              uppercase
              tracking-[0.26em]
              text-[#211914]/45
            "
          >
            Continue the story
          </p>

          <h2
            className="
              mt-5
              font-['Bodoni_Moda']
              text-[2.7rem]
              font-normal
              leading-[0.95]
              tracking-[-0.045em]
              sm:text-[4rem]
            "
          >
            Discover pieces made to become
            <span className="italic"> part of your story.</span>
          </h2>

          <Link
            to="/products"
            className="
              group
              mt-8
              inline-flex
              items-center
              gap-3
              border-b
              border-[#211914]
              pb-1.5
              text-[0.65rem]
              font-semibold
              uppercase
              tracking-[0.2em]
            "
          >
            Explore the collection
            <span
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PopupsPage;
