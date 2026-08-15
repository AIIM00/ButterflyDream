import { useState } from "react";

// MUI Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

function CatalogToolbar({
  initialSearch,
  sort,
  totalItems,
  onSearch,
  onSortChange,
}) {
  const [search, setSearch] = useState(initialSearch ?? "");

  function handleSubmit(event) {
    event.preventDefault();

    onSearch(search.trim());
  }

  return (
    <div
      className="
        w-full
        space-y-4

        sm:space-y-5

        lg:flex
        lg:items-center
        lg:justify-between
        lg:gap-6
        lg:space-y-0
      "
    >
      {/* ==================================================
          SEARCH
      ================================================== */}

      <form
        onSubmit={handleSubmit}
        role="search"
        className="
          relative
          w-full

          lg:max-w-xl
        "
      >
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>

        <div
          className="
            relative

            flex
            min-h-[3.25rem]
            items-center

            rounded-full

            border
            border-brand-border

            bg-brand-surface-soft

            transition-all
            duration-200

            focus-within:border-brand-accent-fill
            focus-within:bg-brand-surface
            focus-within:ring-2
            focus-within:ring-brand-accent-fill/15
          "
        >
          {/* SEARCH ICON */}

          <span
            className="
              pointer-events-none

              absolute
              left-4

              inline-flex
              items-center
              justify-center

              text-brand-text-muted
            "
          >
            <SearchRoundedIcon
              sx={{
                fontSize: 20,
              }}
            />
          </span>

          {/* SEARCH FIELD */}

          <input
            id="catalog-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the collection"
            className="
              min-w-0
              flex-1

              bg-transparent

              py-3
              pl-11
              pr-[5.8rem]

              text-sm
              font-medium

              text-brand-text

              outline-none

              placeholder:text-brand-text-muted/55

              [&::-webkit-search-cancel-button]:cursor-pointer
            "
          />

          {/* SEARCH BUTTON */}

          <button
            type="submit"
            className="
              absolute
              right-1.5
              top-1/2

              min-h-10

              -translate-y-1/2

              rounded-full

              bg-brand-primary

              px-4

              text-[0.7rem]
              font-semibold

              text-brand-surface

              transition-all
              duration-200

              hover:bg-brand-primary-hover

              active:scale-[0.97]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-accent-fill/40
            "
          >
            Search
          </button>
        </div>
      </form>

      {/* ==================================================
          RESULT COUNT + SORT
      ================================================== */}

      <div
        className="
          flex
          items-center
          justify-between

          gap-3

          lg:shrink-0
          lg:justify-end
        "
      >
        {/* RESULT COUNT */}

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[0.56rem]
              font-bold
              uppercase

              tracking-[0.14em]

              text-brand-accent-text
            "
          >
            Collection
          </p>

          <p
            className="
              mt-0.5

              whitespace-nowrap

              text-xs
              text-brand-text-muted
            "
          >
            <span
              className="
                font-semibold
                text-brand-text
              "
            >
              {totalItems}
            </span>{" "}
            {totalItems === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* SORT */}

        <div
          className="
            relative
            shrink-0
          "
        >
          <label htmlFor="catalog-sort" className="sr-only">
            Sort products
          </label>

          <span
            className="
              pointer-events-none

              absolute
              left-3.5
              top-1/2

              z-10

              -translate-y-1/2

              text-brand-text-muted
            "
          >
            <SortRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
          </span>

          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="
              min-h-11

              appearance-none

              rounded-full

              border
              border-brand-border

              bg-brand-surface

              py-2.5
              pl-9
              pr-9

              text-[0.7rem]
              font-semibold

              text-brand-text

              outline-none

              transition-all
              duration-200

              hover:bg-brand-surface-soft

              focus:border-brand-accent-fill
              focus:ring-2
              focus:ring-brand-accent-fill/15

              sm:text-xs
            "
          >
            <option value="newest">Newest</option>

            <option value="oldest">Oldest</option>

            <option value="name_asc">Name: A–Z</option>

            <option value="name_desc">Name: Z–A</option>

            <option value="price_asc">Price: Low to high</option>

            <option value="price_desc">Price: High to low</option>
          </select>

          <span
            className="
              pointer-events-none

              absolute
              right-3
              top-1/2

              -translate-y-1/2

              text-brand-text-muted
            "
          >
            <ExpandMoreRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export default CatalogToolbar;
