import PricePair from "../discounts/PricePair.jsx";

export default function CardSalePrice({ regular, sale, children }) {
  if (sale == null) return children;
  return (
    <span className="inline-flex flex-col">
      <PricePair regular={regular} sale={sale} />
      <small className="mt-1 text-xs font-normal text-brand-text-muted">When bought alone</small>
    </span>
  );
}
