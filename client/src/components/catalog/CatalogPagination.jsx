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
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPreviousPage}
        aria-label="Previous page"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 text-gray-700 hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeftRoundedIcon />
      </button>

      {visiblePages.map((visiblePage, index) => {
        const previousPage = visiblePages[index - 1];

        const showGap = previousPage && visiblePage - previousPage > 1;

        return (
          <span key={visiblePage} className="contents">
            {showGap && <span className="px-2 text-gray-400">…</span>}

            <button
              type="button"
              onClick={() => onPageChange(visiblePage)}
              aria-current={visiblePage === page ? "page" : undefined}
              className={[
                "h-11 min-w-11 rounded-xl border px-3 text-sm font-bold transition",
                visiblePage === page
                  ? "border-gray-950 bg-gray-950 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-950",
              ].join(" ")}
            >
              {visiblePage}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next page"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 text-gray-700 hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRightRoundedIcon />
      </button>
    </nav>
  );
}

export default CatalogPagination;
