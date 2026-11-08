import formatCurrency from "../../utils/formatCurrency.js";

export default function PricePair({ regular, sale, mutedClass = "text-brand-text-muted" }) {
  return (
    <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
      <del className={`text-[0.75em] font-normal ${mutedClass}`}>
        <span className="sr-only">Regular price </span>
        {formatCurrency(regular)}
      </del>
      <strong className="font-bold">
        <span className="sr-only">Sale price </span>
        {formatCurrency(sale)}
      </strong>
    </span>
  );
}
