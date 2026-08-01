import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

//Components
import WishlistToggleButton from "../wishlist/WishlistToggleButton.jsx";
import StockBadge from "./StockBadge.jsx";

function getProductPrice(product) {
  const minimum = product.pricing?.minimum;

  const maximum = product.pricing?.maximum;

  if (!minimum) {
    return "Price unavailable";
  }

  if (product.pricing?.hasPriceRange && maximum) {
    return `$${minimum} – $${maximum}`;
  }

  return `$${minimum}`;
}

function ProductCard({ product }) {
  const image = product.image;

  return (
    <article className="relative group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <WishlistToggleButton
        productId={product.id}
        className="absolute right-3 top-3 z-10"
      />
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
        aria-label={`View ${product.name}`}
      >
        {image?.imageUrl ? (
          <img
            src={image.imageUrl}
            alt={image.altText || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <ImageNotSupportedOutlinedIcon
              sx={{
                fontSize: 44,
              }}
            />

            <span className="text-sm font-medium">Product image</span>
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute left-4 top-4 rounded-full bg-gray-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-500">
            {product.category?.name}
          </p>

          <StockBadge status={product.inStock} compact />
        </div>

        <h2 className="mt-3 text-lg font-bold leading-7 text-gray-950">
          <Link to={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>

        <p className="mt-3 text-lg font-bold text-gray-950">
          {getProductPrice(product)}
        </p>

        {product.activeVariantCount > 1 && (
          <p className="mt-1 text-sm text-gray-500">
            {product.activeVariantCount} options available
          </p>
        )}

        <Link
          to={`/products/${product.slug}`}
          className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5 text-sm font-bold text-gray-800 transition hover:text-gray-950"
        >
          View details
          <ArrowForwardRoundedIcon fontSize="small" />
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
