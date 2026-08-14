import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { Link } from "react-router-dom";

const IMAGE_POSITION_CLASSES = {
  center: "object-center",

  top: "object-top",

  bottom: "object-bottom",

  left: "object-left",

  right: "object-right",
};

const DEFAULT_CONTENT = {
  eyebrow: "Our collection",

  title: "Timeless pieces for every moment.",

  description:
    "Discover collections shaped around everyday beauty, meaningful gifts, modern elegance, and pieces made especially for you.",

  items: [],
};

function getSafeInternalPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/products";
  }

  return value;
}

function CollectionCard({ item, index }) {
  const imagePosition =
    IMAGE_POSITION_CLASSES[item.imagePosition] ?? IMAGE_POSITION_CLASSES.center;

  const href = getSafeInternalPath(item.buttonUrl);

  return (
    <Link
      to={href}
      className="
        group
        block
        min-w-0
      "
      aria-label={`Explore ${item.title}`}
    >
      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden

          rounded-[1.1rem]

          bg-brand-pale-champagne

          sm:rounded-[1.35rem]
        "
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.imageAlt || item.title}
            loading="lazy"
            className={`
              h-full
              w-full
              object-cover
              ${imagePosition}

              transition-transform
              duration-700
              ease-out

              group-hover:scale-[1.035]
            `}
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

              bg-gradient-to-br
              from-brand-pale-champagne
              via-brand-cream
              to-brand-champagne/30
            "
          >
            <div
              className="
                absolute
                -right-10
                -top-10
                h-32
                w-32
                rounded-full
                border
                border-white/70
              "
            />

            <div
              className="
                absolute
                -bottom-12
                -left-12
                h-36
                w-36
                rounded-full
                border
                border-brand-bronze/15
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
            from-brand-espresso/45
            via-brand-espresso/[0.03]
            to-transparent
          "
        />

        <div
          className="
            absolute
            inset-x-0
            bottom-0

            flex
            items-end
            justify-between
            gap-2

            p-3

            text-white

            sm:p-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[0.48rem]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white/65

                sm:text-[0.58rem]
              "
            >
              Collection {String(index + 1).padStart(2, "0")}
            </p>

            <h3
              className="
                mt-1
                font-display
                text-[1.05rem]
                font-semibold
                leading-[1.05]
                tracking-[-0.025em]

                sm:mt-2
                sm:text-[1.45rem]

                lg:text-[1.7rem]
              "
            >
              {item.title}
            </h3>
          </div>

          <span
            className="
              inline-flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full

              border
              border-white/40

              bg-white/10

              backdrop-blur-md

              transition
              duration-300

              group-hover:bg-white
              group-hover:text-brand-espresso

              sm:h-10
              sm:w-10
            "
            aria-hidden="true"
          >
            <ArrowForwardRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
          </span>
        </div>
      </div>

      {item.description && (
        <p
          className="
            mt-2.5
            px-1

            text-[0.66rem]
            leading-5
            text-brand-muted

            sm:mt-3
            sm:text-xs
          "
        >
          {item.description}
        </p>
      )}
    </Link>
  );
}

function HomeCollections({ content }) {
  const collections = {
    ...DEFAULT_CONTENT,
    ...(content ?? {}),
  };

  const items = Array.isArray(collections.items)
    ? collections.items.filter((item) => item?.title).slice(0, 6)
    : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-brand-ivory
        py-14

        sm:py-20
        lg:py-24
      "
      aria-labelledby="home-collections-title"
      data-home-section="collections"
    >
      <div
        className="
          pointer-events-none
          absolute
          -left-28
          top-12

          h-72
          w-72

          rounded-full

          bg-brand-pale-champagne/35

          blur-3xl
        "
        aria-hidden="true"
      />

      <div className="page-container relative">
        <div
          className="
            max-w-[34rem]
          "
        >
          {collections.eyebrow && (
            <p className="eyebrow-text">{collections.eyebrow}</p>
          )}

          <h2
            id="home-collections-title"
            className="
              section-heading
              mt-4
            "
          >
            {collections.title}
          </h2>

          {collections.description && (
            <p
              className="
                body-large
                mt-4
                max-w-xl

                sm:mt-5
              "
            >
              {collections.description}
            </p>
          )}
        </div>

        <div
          className="
            mt-8

            grid
            grid-cols-2
            gap-x-3
            gap-y-7

            sm:mt-10
            sm:gap-5

            lg:grid-cols-4
            lg:gap-6
          "
        >
          {items.map((item, index) => (
            <CollectionCard
              key={item.assetId ?? `${item.title}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeCollections;
