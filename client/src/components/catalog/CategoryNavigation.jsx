function CategoryNavigation({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <nav
      aria-label="Product categories"
      className="
        w-full
        overflow-hidden
      "
    >
      <div
        className="
          flex
          items-center
          gap-2

          overflow-x-auto

          pb-1

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:gap-2.5
        "
      >
        {/* ==================================================
            ALL PRODUCTS
        ================================================== */}

        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          aria-pressed={!selectedCategory}
          className={`
            group/category

            inline-flex
            min-h-10
            shrink-0

            items-center
            justify-center

            rounded-full

            border

            px-4

            text-[0.7rem]
            font-semibold

            transition-all
            duration-200

            active:scale-[0.97]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-accent-fill/40

            sm:min-h-11
            sm:px-5
            sm:text-xs

            ${
              !selectedCategory
                ? `
                    border-brand-primary
                    bg-brand-primary
                    text-brand-surface

                    shadow-[0_5px_14px_rgba(0,0,0,0.10)]
                  `
                : `
                    border-brand-border
                    bg-brand-surface

                    text-brand-text-muted

                    hover:border-brand-text/25
                    hover:bg-brand-surface-soft
                    hover:text-brand-text
                  `
            }
          `}
        >
          All products
        </button>

        {/* ==================================================
            CATEGORY BUTTONS
        ================================================== */}

        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              aria-pressed={isSelected}
              className={`
                group/category

                inline-flex
                min-h-10
                shrink-0

                items-center
                justify-center

                gap-2

                rounded-full

                border

                px-4

                text-[0.7rem]
                font-semibold

                transition-all
                duration-200

                active:scale-[0.97]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-accent-fill/40

                sm:min-h-11
                sm:px-5
                sm:text-xs

                ${
                  isSelected
                    ? `
                        border-brand-primary
                        bg-brand-primary

                        text-brand-surface

                        shadow-[0_5px_14px_rgba(0,0,0,0.10)]
                      `
                    : `
                        border-brand-border
                        bg-brand-surface

                        text-brand-text-muted

                        hover:border-brand-text/25
                        hover:bg-brand-surface-soft
                        hover:text-brand-text
                      `
                }
              `}
            >
              <span>{category.name}</span>

              {/* PRODUCT COUNT */}

              <span
                className={`
                  inline-flex
                  min-w-5
                  items-center
                  justify-center

                  rounded-full

                  px-1.5
                  py-0.5

                  text-[0.55rem]
                  font-bold

                  transition-colors
                  duration-200

                  ${
                    isSelected
                      ? `
                          bg-brand-surface/15
                          text-brand-surface
                        `
                      : `
                          bg-brand-surface-soft
                          text-brand-text-muted

                          group-hover/category:bg-brand-surface
                          group-hover/category:text-brand-text
                        `
                  }
                `}
              >
                {category.productCount}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default CategoryNavigation;
