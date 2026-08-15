import { useState } from "react";

// MUI Icons
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

function CatalogFilters({ initialFilters, onApply, onClear }) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice ?? "");

  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice ?? "");

  const [inStock, setInStock] = useState(initialFilters.inStock ?? "all");

  const [featuredOnly, setFeaturedOnly] = useState(
    initialFilters.featured === "true",
  );

  function handleSubmit(event) {
    event.preventDefault();

    onApply({
      minPrice: minPrice.trim(),

      maxPrice: maxPrice.trim(),

      inStock: inStock === "all" ? null : inStock,

      featured: featuredOnly ? "true" : null,
    });
  }

  function handleClear() {
    setMinPrice("");
    setMaxPrice("");
    setInStock("all");
    setFeaturedOnly(false);

    onClear();
  }

  const availabilityOptions = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "true",
      label: "In stock",
    },
    {
      value: "false",
      label: "Sold out",
    },
  ];

  return (
    <div
      className="
        w-full

        overflow-hidden

        rounded-[1.75rem]

        border
        border-brand-border

        bg-brand-surface

        shadow-[0_10px_30px_rgba(0,0,0,0.035)]
      "
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-3

          border-b
          border-brand-border

          px-4
          py-4

          sm:px-5
          sm:py-5
        "
      >
        <span
          className="
            inline-flex
            h-10
            w-10
            shrink-0

            items-center
            justify-center

            rounded-full

            bg-brand-accent-soft

            text-brand-accent-text
          "
        >
          <TuneRoundedIcon
            sx={{
              fontSize: 19,
            }}
          />
        </span>

        <div className="min-w-0">
          <p
            className="
              text-[0.56rem]
              font-bold
              uppercase

              tracking-[0.17em]

              text-brand-accent-text
            "
          >
            Refine collection
          </p>

          <h2
            className="
              mt-0.5

              font-display

              text-[1.4rem]
              font-medium

              leading-none

              tracking-[-0.035em]

              text-brand-text
            "
          >
            Filters
          </h2>
        </div>
      </div>

      {/* ==================================================
          FORM
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          px-4
          pb-4

          sm:px-5
          sm:pb-5
        "
      >
        {/* ==================================================
            PRICE
        ================================================== */}

        <fieldset
          className="
            py-5

            sm:py-6
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-3
            "
          >
            <div>
              <legend
                className="
                  text-[0.68rem]
                  font-bold
                  uppercase

                  tracking-[0.13em]

                  text-brand-text
                "
              >
                Price range
              </legend>

              <p
                className="
                  mt-1

                  text-[0.72rem]
                  leading-5

                  text-brand-text-muted
                "
              >
                Set your preferred range.
              </p>
            </div>
          </div>

          <div
            className="
              mt-4

              grid
              grid-cols-2

              gap-2.5
            "
          >
            {/* MINIMUM */}

            <div>
              <label
                htmlFor="minimum-price"
                className="
                  mb-1.5
                  block

                  text-[0.62rem]
                  font-semibold

                  text-brand-text-muted
                "
              >
                Minimum
              </label>

              <div className="relative">
                <span
                  className="
                    pointer-events-none

                    absolute
                    left-3
                    top-1/2

                    -translate-y-1/2

                    font-display
                    text-sm

                    text-brand-text-muted
                  "
                >
                  $
                </span>

                <input
                  id="minimum-price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="0"
                  className="
                    min-h-11
                    w-full

                    rounded-[0.9rem]

                    border
                    border-brand-border

                    bg-brand-surface-soft

                    py-2.5
                    pl-7
                    pr-3

                    text-sm
                    font-medium

                    text-brand-text

                    outline-none

                    transition-all
                    duration-200

                    placeholder:text-brand-text-muted/50

                    focus:border-brand-accent-fill
                    focus:bg-brand-surface
                    focus:ring-2
                    focus:ring-brand-accent-fill/15
                  "
                />
              </div>
            </div>

            {/* MAXIMUM */}

            <div>
              <label
                htmlFor="maximum-price"
                className="
                  mb-1.5
                  block

                  text-[0.62rem]
                  font-semibold

                  text-brand-text-muted
                "
              >
                Maximum
              </label>

              <div className="relative">
                <span
                  className="
                    pointer-events-none

                    absolute
                    left-3
                    top-1/2

                    -translate-y-1/2

                    font-display
                    text-sm

                    text-brand-text-muted
                  "
                >
                  $
                </span>

                <input
                  id="maximum-price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="100"
                  className="
                    min-h-11
                    w-full

                    rounded-[0.9rem]

                    border
                    border-brand-border

                    bg-brand-surface-soft

                    py-2.5
                    pl-7
                    pr-3

                    text-sm
                    font-medium

                    text-brand-text

                    outline-none

                    transition-all
                    duration-200

                    placeholder:text-brand-text-muted/50

                    focus:border-brand-accent-fill
                    focus:bg-brand-surface
                    focus:ring-2
                    focus:ring-brand-accent-fill/15
                  "
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* ==================================================
            AVAILABILITY
        ================================================== */}

        <fieldset
          className="
            border-t
            border-brand-border

            py-5

            sm:py-6
          "
        >
          <legend
            className="
              text-[0.68rem]
              font-bold
              uppercase

              tracking-[0.13em]

              text-brand-text
            "
          >
            Availability
          </legend>

          <div
            className="
              mt-3

              grid
              grid-cols-3

              gap-1.5

              rounded-full

              bg-brand-surface-soft

              p-1
            "
          >
            {availabilityOptions.map((option) => {
              const selected = inStock === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setInStock(option.value)}
                  aria-pressed={selected}
                  className={`
                      min-h-9

                      rounded-full

                      px-2

                      text-[0.65rem]
                      font-semibold

                      transition-all
                      duration-200

                      ${
                        selected
                          ? `
                              bg-brand-primary
                              text-brand-surface

                              shadow-sm
                            `
                          : `
                              text-brand-text-muted

                              hover:bg-brand-surface
                              hover:text-brand-text
                            `
                      }
                    `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ==================================================
            FEATURED
        ================================================== */}

        <div
          className="
            border-t
            border-brand-border

            py-5

            sm:py-6
          "
        >
          <label
            className={`
              flex
              cursor-pointer

              items-center
              justify-between

              gap-4

              rounded-[1.1rem]

              border

              px-3.5
              py-3

              transition-all
              duration-200

              ${
                featuredOnly
                  ? `
                      border-brand-accent-fill/40
                      bg-brand-accent-soft
                    `
                  : `
                      border-brand-border
                      bg-brand-surface-soft

                      hover:bg-brand-surface
                    `
              }
            `}
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <span
                className={`
                  inline-flex
                  h-9
                  w-9
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  ${
                    featuredOnly
                      ? `
                          bg-brand-accent-fill/20
                          text-brand-accent-text
                        `
                      : `
                          bg-brand-surface
                          text-brand-text-muted
                        `
                  }
                `}
              >
                <AutoAwesomeRoundedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
              </span>

              <div className="min-w-0">
                <p
                  className="
                    text-[0.75rem]
                    font-semibold

                    text-brand-text
                  "
                >
                  Featured products
                </p>

                <p
                  className="
                    mt-0.5

                    text-[0.62rem]

                    text-brand-text-muted
                  "
                >
                  Show highlighted pieces only.
                </p>
              </div>
            </div>

            {/* CUSTOM TOGGLE */}

            <span
              className={`
                relative

                inline-flex
                h-7
                w-12
                shrink-0

                items-center

                rounded-full

                transition-colors
                duration-200

                ${featuredOnly ? "bg-brand-accent-text" : "bg-brand-border"}
              `}
            >
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(event) => setFeaturedOnly(event.target.checked)}
                className="sr-only"
              />

              <span
                className={`
                  absolute
                  left-1

                  inline-flex
                  h-5
                  w-5

                  items-center
                  justify-center

                  rounded-full

                  bg-brand-surface

                  shadow-sm

                  transition-transform
                  duration-200

                  ${featuredOnly ? "translate-x-5" : "translate-x-0"}
                `}
              >
                {featuredOnly && (
                  <CheckRoundedIcon
                    className="text-brand-accent-text"
                    sx={{
                      fontSize: 13,
                    }}
                  />
                )}
              </span>
            </span>
          </label>
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-[0.8fr_1.2fr]

            gap-2.5

            border-t
            border-brand-border

            pt-4
          "
        >
          <button
            type="button"
            onClick={handleClear}
            className="
              min-h-11

              rounded-full

              border
              border-brand-border

              bg-brand-surface

              px-4

              text-xs
              font-semibold

              text-brand-text-muted

              transition-all
              duration-200

              hover:border-brand-text/25
              hover:bg-brand-surface-soft
              hover:text-brand-text

              active:scale-[0.98]
            "
          >
            Clear
          </button>

          <button
            type="submit"
            className="
              min-h-11

              rounded-full

              bg-brand-primary

              px-4

              text-xs
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
            "
          >
            Apply filters
          </button>
        </div>
      </form>
    </div>
  );
}

export default CatalogFilters;
