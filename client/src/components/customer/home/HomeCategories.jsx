import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

import { usePublicCategories } from "../../../hooks/useCatalogData";

const categoryLayoutClasses = [
  "lg:col-span-5 lg:row-span-2 lg:h-[620px]",
  "lg:col-span-3 lg:h-[300px]",
  "lg:col-span-4 lg:h-[300px]",
  "lg:col-span-4 lg:h-[300px]",
  "lg:col-span-3 lg:h-[300px]",
  "lg:col-span-4 lg:h-[300px]",
  "lg:col-span-4 lg:h-[300px]",
  "lg:col-span-4 lg:h-[300px]",
];

function getProductCountLabel(productCount) {
  if (productCount === 0) {
    return "Coming soon";
  }

  if (productCount === 1) {
    return "1 piece";
  }

  return `${productCount} pieces`;
}

function CategoryVisual({ category }) {
  const [hasImageError, setHasImageError] = useState(false);

  const hasImage = Boolean(category.imageUrl) && !hasImageError;

  return (
    <div className="absolute inset-0 overflow-hidden bg-brand-forest">
      {!hasImage && (
        <div className="flex h-full flex-col items-center justify-center bg-brand-forest px-6 text-center">
          <span
            className="font-display text-[7rem] font-medium leading-none text-brand-champagne/80"
            aria-hidden="true"
          >
            {category.name.charAt(0)}
          </span>

          <ImageNotSupportedOutlinedIcon
            className="mt-4 text-white/45"
            fontSize="small"
            aria-hidden="true"
          />
        </div>
      )}

      {hasImage && (
        <img
          src={category.imageUrl}
          alt={category.name}
          loading="lazy"
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035] motion-reduce:transition-none"
        />
      )}
    </div>
  );
}

function CategoryCard({ category, index }) {
  const layoutClass =
    categoryLayoutClasses[index] ?? "lg:col-span-4 lg:h-[300px]";

  return (
    <article
      className={`h-[380px] w-[56vw] max-w-[240px] shrink-0 snap-center sm:h-[420px] sm:w-auto sm:max-w-none ${layoutClass}`}
    >
      <Link
        to={`/products?category=${encodeURIComponent(category.slug)}`}
        className="group relative block h-full overflow-hidden rounded-[1.25rem] border border-brand-border bg-white shadow-sm transition duration-300 hover:border-brand-champagne focus-visible:outline-none"
        aria-label={`Shop ${category.name}`}
      >
        <CategoryVisual category={category} />

        <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-brand-emerald/80 px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {getProductCountLabel(category.productCount)}
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/30 bg-brand-cream/95 p-3 backdrop-blur-md">
          <div className="flex items-center justify-end gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-[1.5rem] font-medium leading-none tracking-[-0.035em] text-brand-espresso sm:text-[2rem]">
                {category.name}
              </h3>

              <p className="mt-2 line-clamp-2 text-xs leading-6 text-brand-muted">
                {category.description ||
                  `Discover the Butterfly Dream ${category.name.toLowerCase()} collection.`}
              </p>
            </div>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-bronze text-brand-bronze transition duration-200 group-hover:bg-brand-bronze group-hover:text-white"
              aria-hidden="true"
            >
              <ArrowForwardRoundedIcon fontSize="small" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CategoriesLoading() {
  return (
    <div className="-mx-5 mt-10 flex gap-4 overflow-hidden px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-12 lg:gap-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`h-[430px] w-[78vw] max-w-[340px] shrink-0 animate-pulse overflow-hidden rounded-[1.25rem] border border-brand-border bg-white/90 sm:h-[420px] sm:w-auto sm:max-w-none ${categoryLayoutClasses[index]}`}
          aria-hidden="true"
        >
          <div className="h-full bg-brand-pale-champagne/90" />
        </div>
      ))}
    </div>
  );
}

function HomeCategories(content) {
  const { categories, isLoading, error } = usePublicCategories();

  const categoryIds = Array.isArray(content?.categoryIds)
    ? content.categoryIds
    : [];

  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  const visibleCategories =
    categoryIds.length > 0
      ? categoryIds
          .map((categoryId) => categoryById.get(categoryId))
          .filter(Boolean)
          .slice(0, 8)
      : categories.slice(0, 8);

  const eyebrow = content?.eyebrow || "Explore the collection";

  const title = content?.title || "Find the piece that feels like you.";

  const description =
    content?.description ||
    "Move through our collections and discover accessories designed for everyday expression, meaningful moments, and personal transformation.";

  const buttonText = content?.buttonText || "View all categories";

  const buttonUrl =
    typeof content?.buttonUrl === "string" &&
    content.buttonUrl.startsWith("/") &&
    !content.buttonUrl.startsWith("//")
      ? content.buttonUrl
      : "/products";

  return (
    <section
      id="home-categories"
      className="relative isolate overflow-hidden section-spacing"
      aria-labelledby="home-categories-title"
      data-home-section="categories"
    >
      <div className="page-container relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl rounded-[1.5rem] border border-white/45 bg-brand-cream/68 p-5 backdrop-blur-md sm:p-7">
            {eyebrow && <p className="eyebrow-text">{eyebrow}</p>}

            <h2 id="home-categories-title" className="section-heading mt-4">
              {title}
            </h2>

            {description && (
              <p className="body-large mt-5 max-w-xl">{description}</p>
            )}
          </div>

          {buttonText && (
            <Link
              to={buttonUrl}
              className="
      button-base
      button-outline
      hidden
      w-fit
      shrink-0
      rounded-full
      bg-brand-cream/80
      backdrop-blur-md
      sm:inline-flex
    "
            >
              {buttonText}

              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          )}
        </div>

        {isLoading && <CategoriesLoading />}

        {!isLoading && error && (
          <div className="mt-10 border border-brand-border bg-white/90 px-6 py-12 text-center backdrop-blur-md sm:px-10">
            <h3 className="font-display text-2xl font-medium text-brand-espresso">
              Our collections are taking shape.
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-brand-muted">
              The category collection could not be loaded right now. You can
              still explore all available products.
            </p>

            <Link
              to="/products"
              className="button-base button-primary mt-6 w-fit rounded-full"
            >
              Shop all products
              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          </div>
        )}

        {!isLoading && !error && visibleCategories.length === 0 && (
          <div className="mt-10 border border-brand-border bg-white/90 px-6 py-12 text-center backdrop-blur-md sm:px-10">
            <h3 className="font-display text-2xl font-medium text-brand-espresso">
              New collections are coming soon.
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-brand-muted">
              Butterfly Dream categories will appear here as soon as they are
              available.
            </p>
          </div>
        )}

        {!isLoading && !error && visibleCategories.length > 0 && (
          <div
            className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-12 lg:gap-5 [&::-webkit-scrollbar]:hidden"
            aria-label="Shop by category"
          >
            {visibleCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}

        {buttonText && (
          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              to={buttonUrl}
              className="
        button-base
        button-outline
        w-fit
        rounded-full
        bg-brand-cream/80
        backdrop-blur-md
      "
            >
              {buttonText}

              <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeCategories;
