function CategoryNavigation({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <section
      aria-label="Product categories"
      className="border-b border-gray-200"
    >
      <div className="flex gap-2 overflow-x-auto pb-4">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={[
            "shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition",
            !selectedCategory
              ? "border-gray-950 bg-gray-950 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-950",
          ].join(" ")}
        >
          All products
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={[
              "shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition",
              selectedCategory === category.slug
                ? "border-gray-950 bg-gray-950 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-950",
            ].join(" ")}
          >
            {category.name}

            <span className="ml-2 opacity-70">{category.productCount}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategoryNavigation;
