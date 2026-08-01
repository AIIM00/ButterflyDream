import { useState } from "react";
import { Link, useParams } from "react-router-dom";

//MUI Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

//Components
import ProductImageGallery from "../../components/catalog/ProductImageGallery.jsx";
import StockBadge from "../../components/catalog/StockBadge.jsx";
import VariantSelector from "../../components/catalog/VariantSelector.jsx";
import WishlistToggleButton from "../../components/wishlist/WishlistToggleButton.jsx";

//Hooks
import { usePublicProduct } from "../../hooks/useCatalogData.js";

//Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

import AddToCartSection from "../../components/cart/AddToCartSection.jsx";
function ProductDetailsLoading() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
      <div className="aspect-square animate-pulse rounded-3xl bg-gray-100" />

      <div className="space-y-5 py-4">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-7 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-28 animate-pulse rounded bg-gray-100" />
      </div>
    </section>
  );
}

function ProductDetailsContent({ product }) {
  const defaultVariant =
    product.variants.find((variant) => variant.isDefault) ??
    product.variants[0] ??
    null;

  const initialImage =
    product.images.find((image) => image.isPrimary) ??
    product.images[0] ??
    null;

  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? "",
  );

  const [selectedImageId, setSelectedImageId] = useState(
    initialImage?.id ?? "",
  );

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant;

  function handleVariantSelect(variantId) {
    setSelectedVariantId(variantId);

    const variantImage = product.images.find(
      (image) => image.variantId === variantId,
    );

    if (variantImage) {
      setSelectedImageId(variantImage.id);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/products" className="hover:text-gray-950">
          Products
        </Link>

        <span>/</span>

        <Link
          to={`/products?category=${product.category.slug}`}
          className="hover:text-gray-950"
        >
          {product.category.name}
        </Link>

        <span>/</span>

        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductImageGallery
          productName={product.name}
          images={product.images}
          selectedImageId={selectedImageId}
          onImageSelect={setSelectedImageId}
        />

        <div className="lg:py-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
              {product.category.name}
            </p>

            {product.isFeatured && (
              <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Featured
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl">
                {product.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <p className="text-3xl font-bold text-gray-950">
                  {selectedVariant
                    ? `$${selectedVariant.price}`
                    : product.pricing.hasPriceRange
                      ? `$${product.pricing.minimum} – $${product.pricing.maximum}`
                      : `$${product.pricing.minimum}`}
                </p>

                <StockBadge
                  status={selectedVariant?.stockStatus ?? product.inStock}
                />
              </div>
            </div>

            <WishlistToggleButton productId={product.id} showLabel />
          </div>

          {product.description && (
            <p className="mt-7 whitespace-pre-line text-lg leading-8 text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-9 border-t border-gray-200 pt-8">
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onVariantSelect={handleVariantSelect}
            />
          </div>

          {selectedVariant && !selectedVariant.inStock && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              The selected option is currently out of stock.
            </div>
          )}
          <AddToCartSection selectedVariant={selectedVariant} />
          <div className="mt-9 grid gap-4 border-t border-gray-200 pt-8 sm:grid-cols-2">
            <div className="flex gap-3 rounded-2xl bg-gray-50 p-4">
              <LocalShippingOutlinedIcon className="text-gray-700" />

              <div>
                <p className="font-bold text-gray-950">Delivery in Lebanon</p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Delivery is handled through our courier partner.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-gray-50 p-4">
              <PaymentsOutlinedIcon className="text-gray-700" />

              <div>
                <p className="font-bold text-gray-950">Cash on delivery</p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Pay in USD when your order is delivered.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-950"
          >
            <ArrowBackRoundedIcon fontSize="small" />
            Return to products
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductDetails() {
  const { slug } = useParams();

  const { product, error, isLoading } = usePublicProduct(slug ?? "");

  if (isLoading) {
    return <ProductDetailsLoading />;
  }

  if (error) {
    const statusCode = error.response?.status;

    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ErrorOutlineRoundedIcon
          className="text-gray-400"
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          {statusCode === 404 ? "Product not found" : "Unable to load product"}
        </h1>

        <p className="mt-4 text-gray-600">
          {getApiErrorMessage(error, "The product could not be loaded.")}
        </p>

        <Link
          to="/products"
          className="mt-8 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Browse products
        </Link>
      </section>
    );
  }

  if (!product) {
    return null;
  }

  return <ProductDetailsContent key={product.id} product={product} />;
}

export default ProductDetails;
