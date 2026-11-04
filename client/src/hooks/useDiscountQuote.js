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
      if (!controller.signal.aborted) setState({ key, summary: response.checkout.cart.summary, error: "" });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, summary: null, error: getApiErrorMessage(error, "Unable to calculate savings.") });
    });
    return () => controller.abort();
  }, [payload, code, key]);
  return { summary: state.key === key ? state.summary : null, error: state.key === key ? state.error : "", busy: state.key !== key };
}
