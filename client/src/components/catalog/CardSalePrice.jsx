import formatCurrency from "../../utils/formatCurrency.js";

export default function CardSalePrice({ product, children }) {
  if (product.salePrice == null) return children;
  return (
    <span className="inline-flex flex-col">
      <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
        <del className="text-[0.75em] font-normal text-brand-text-muted">
          <span className="sr-only">Regular price </span>
          {formatCurrency(product.defaultVariant.price)}
        </del>
        <strong className="font-bold">
          <span className="sr-only">Sale price </span>
          {formatCurrency(product.salePrice)}
        </strong>
      </span>
      <small className="mt-1 text-xs font-normal text-brand-text-muted">When bought alone</small>
    </span>
  );
}
