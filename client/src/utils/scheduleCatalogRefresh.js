// The server gives all cards in a batch the same next campaign boundary.
export default function scheduleCatalogRefresh(products, refresh) {
  const timestamp = products?.[0]?.priceRefreshAt;
  if (!timestamp) return;
  const delay = Math.max(1000, Date.parse(timestamp) - Date.now());
  return setTimeout(refresh, Math.min(delay, 2147483647));
}
