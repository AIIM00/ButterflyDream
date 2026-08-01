export default function formatCurrency(value, currency = "USD") {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currency} ${numericValue.toFixed(2)}`;
  }
}
