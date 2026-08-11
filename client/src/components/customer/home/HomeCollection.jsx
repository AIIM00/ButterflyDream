import { Link } from "react-router-dom";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";

const collections = [
  {
    id: "everyday",
    title: "Everyday Essentials",
    subtitle: "Made for every day",
    image: "/media/home/collections/everyday-essentials.jpg",
    href: "/products",
  },
  {
    id: "gift",
    title: "Gift with Meaning",
    subtitle: "For moments worth keeping",
    image: "/media/home/collections/gift-with-meaning.jpg",
    href: "/products",
  },
  {
    id: "modern",
    title: "Modern Elegance",
    subtitle: "Quietly distinctive",
    image: "/media/home/collections/modern-elegance.jpg",
    href: "/products",
  },
  {
    id: "personalized",
    title: "Personalized Just for You",
    subtitle: "Make it yours",
    image: "/media/home/collections/personalized.jpg",
    href: "/products",
  },
];

function CollectionCard({ collection, index }) {
  return (
    <article
      className="
        w-[72vw]
        max-w-[270px]
        shrink-0
        snap-center

        sm:w-auto
        sm:max-w-none
      "
    >
      <Link
        to={collection.href}
        className="
          group
          block
          overflow-hidden
          rounded-[1.2rem]

          border
          border-brand-border/60

          bg-white

          transition
          duration-300

          hover:-translate-y-1
          hover:border-brand-champagne
        "
      >
        {/* Image */}
        <div
          className="
            relative
            h-[260px]
            overflow-hidden
            bg-brand-pale-champagne

            sm:h-[300px]

            lg:h-[330px]
          "
        >
          <img
            src={collection.image}
            alt={collection.title}
            loading={index < 2 ? "eager" : "lazy"}
            className="
              h-full
              w-full
              object-cover

              transition-transform
              duration-700

              group-hover:scale-[1.04]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0

              bg-gradient-to-t
              from-brand-espresso/45
              via-brand-espresso/5
              to-transparent
            "
            aria-hidden="true"
          />

          {/* Small editorial label */}
          <p
            className="
              absolute
              left-4
              top-4

              text-[0.55rem]
              font-bold
              uppercase
              tracking-[0.18em]
              text-white/85
            "
          >
            {collection.subtitle}
          </p>

          {/* Title */}
          <div
            className="
              absolute
              inset-x-4
              bottom-4

              flex
              items-end
              justify-between
              gap-3
            "
          >
            <h3
              className="
                max-w-[11rem]

                font-display
                text-[1.45rem]
                font-medium
                leading-[0.95]
                tracking-[-0.035em]
                text-white

                sm:text-[1.7rem]
              "
            >
              {collection.title}
            </h3>

            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full

                border
                border-white/65

                bg-white/10
                text-white

                backdrop-blur-md

                transition

                group-hover:bg-white
                group-hover:text-brand-espresso
              "
              aria-hidden="true"
            >
              <ArrowOutwardRoundedIcon sx={{ fontSize: 17 }} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function HomeCollection() {
  return (
    <section
      id="home-collection"
      className="
        relative
        overflow-hidden

        py-14

        sm:py-16

        lg:py-20
      "
      aria-labelledby="home-collection-title"
      data-home-section="collection"
    >
      {/* Background */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10

          bg-gradient-to-b
          from-brand-ivory/90
          via-brand-cream/70
          to-brand-ivory/90
        "
        aria-hidden="true"
      />

      <div className="page-container">
        {/* Heading */}
        <div
          className="
            flex
            items-end
            justify-between
            gap-6
          "
        >
          <div>
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
              Our collection
            </p>

            <h2
              id="home-collection-title"
              className="
                mt-2

                max-w-md

                font-display
                text-[2rem]
                font-medium
                leading-[0.95]
                tracking-[-0.04em]
                text-brand-espresso

                sm:text-[2.6rem]

                lg:text-[3.2rem]
              "
            >
              Timeless pieces for every moment.
            </h2>
          </div>

          <Link
            to="/products"
            className="
              hidden

              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-brand-bronze

              transition

              hover:text-brand-espresso

              sm:block
            "
          >
            View all →
          </Link>
        </div>

        {/* Cards */}
        <div
          className="
            -mx-5
            mt-8

            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto

            px-5
            pb-4

            [scrollbar-width:none]

            sm:mx-0
            sm:grid
            sm:grid-cols-2
            sm:gap-4
            sm:overflow-visible
            sm:px-0
            sm:pb-0

            lg:mt-10
            lg:grid-cols-4

            [&::-webkit-scrollbar]:hidden
          "
          aria-label="Butterfly Dream collections"
        >
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-5 flex justify-center sm:hidden">
          <Link
            to="/products"
            className="
              button-base
              button-outline
              w-fit
              rounded-full

              px-5
              text-[0.68rem]
              uppercase
              tracking-[0.14em]
            "
          >
            View all collections
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeCollection;
