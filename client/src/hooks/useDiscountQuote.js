import { useEffect, useState } from "react";
import { previewCheckout } from "../services/checkoutApi.js";
import getApiErrorMessage from "../utils/getApiErrorMessage.js";
export default function useDiscountQuote(items, code, userId) {
  const payload = JSON.stringify((items ?? []).map(item => ({ variantId: item.variantId ?? item.variant?.id, quantity: item.quantity })));
  const [state, setState] = useState({ key: null, summary: null, error: "" });
  const key = `${userId ?? "guest"}:${code}:${payload}`;
  useEffect(() => {
    const controller = new AbortController();
    previewCheckout({ items: JSON.parse(payload), code }, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setState({
        key, summary: response.checkout.cart.summary,
        lines: new Map(response.checkout.cart.items.map(item => [item.variantId, item])),
        error: "",
      });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, summary: null, error: getApiErrorMessage(error, "Unable to calculate savings.") });
    });
    return () => controller.abort();
  }, [payload, code, key]);
  return { lines: state.key === key ? state.lines : null, summary: state.key === key ? state.summary : null, error: state.key === key ? state.error : "", busy: state.key !== key };
}
