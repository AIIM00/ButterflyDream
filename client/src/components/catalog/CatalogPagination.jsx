import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

function getVisiblePages(currentPage, totalPages) {
  const pages = new Set([
    1,
    totalPages,
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

function CatalogPagination({
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="
        flex
        w-full
        items-center
        justify-center
      "
    >
      <div
        className="
          inline-flex
          max-w-full
          items-center
          justify-center

          gap-1

          rounded-full

          border
          border-brand-border

          bg-brand-surface

          p-1.5

          shadow-[0_8px_24px_rgba(0,0,0,0.04)]

          sm:gap-1.5
          sm:p-2
        "
      >
        {/* ================================================
            PREVIOUS
        ================================================ */}

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
          className="
            inline-flex

            h-10
            w-10
            shrink-0

            items-center
            justify-center

            rounded-full

            text-brand-text

            transition-all
            duration-200

            hover:bg-brand-surface-soft

            active:scale-95

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-accent-fill/40

            disabled:cursor-not-allowed
            disabled:text-brand-text-muted/35
            disabled:hover:bg-transparent

            sm:h-11
            sm:w-11
          "
        >
          <ChevronLeftRoundedIcon
            sx={{
              fontSize: 22,
            }}
          />
        </button>

        {/* ================================================
            PAGE NUMBERS
        ================================================ */}

        <div
          className="
            flex
            min-w-0
            items-center
            justify-center

            gap-0.5

            sm:gap-1
          "
        >
          {visiblePages.map((visiblePage, index) => {
            const previousPage = visiblePages[index - 1];

            const showGap = previousPage && visiblePage - previousPage > 1;

            const isCurrent = visiblePage === page;

            return (
              <div
                key={visiblePage}
                className="
                  flex
                  items-center
                "
              >
                {showGap && (
                  <span
                    aria-hidden="true"
                    className="
                      flex
                      h-10
                      min-w-5
                      items-center
                      justify-center

                      px-0.5

                      text-xs
                      font-semibold

                      text-brand-text-muted/55

                      sm:min-w-7
                      sm:px-1
                    "
                  >
                    …
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onPageChange(visiblePage)}
                  aria-current={isCurrent ? "page" : undefined}
                  aria-label={
                    isCurrent
                      ? `Current page, page ${visiblePage}`
                      : `Go to page ${visiblePage}`
                  }
                  className={`
                    inline-flex

                    h-10
                    min-w-10

                    items-center
                    justify-center

                    rounded-full

                    px-2.5

                    text-xs
                    font-semibold

                    transition-all
                    duration-200

                    active:scale-95

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-accent-fill/40

                    sm:h-11
                    sm:min-w-11
                    sm:px-3
                    sm:text-sm

                    ${
                      isCurrent
                        ? `
                            bg-brand-primary
                            text-brand-surface

                            shadow-[0_5px_14px_rgba(0,0,0,0.12)]
                          `
                        : `
                            text-brand-text-muted

                            hover:bg-brand-surface-soft
                            hover:text-brand-text
                          `
                    }
                  `}
                >
                  {visiblePage}
                </button>
              </div>
            );
          })}
        </div>

        {/* ================================================
            NEXT
        ================================================ */}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className="
            inline-flex

            h-10
            w-10
            shrink-0

            items-center
            justify-center

            rounded-full

            text-brand-text

            transition-all
            duration-200

            hover:bg-brand-surface-soft

            active:scale-95

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-accent-fill/40

            disabled:cursor-not-allowed
            disabled:text-brand-text-muted/35
            disabled:hover:bg-transparent

            sm:h-11
            sm:w-11
          "
        >
          <ChevronRightRoundedIcon
            sx={{
              fontSize: 22,
            }}
          />
        </button>
      </div>
    </nav>
  );
}

export default CatalogPagination;
