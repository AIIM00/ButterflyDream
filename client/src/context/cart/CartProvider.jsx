import { useCallback, useEffect, useMemo, useState } from "react";

import {
  addCustomerCartItem,
  clearCustomerCart,
  fetchCustomerCart,
  refreshCustomerCartPrices,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "../../services/cartApi.js";
import { previewCheckout } from "../../services/checkoutApi.js";
import useAppContext from "../app/useAppContext.js";
import CartContext from "./CartContext.jsx";

const GUEST_CART_STORAGE_KEY = "butterfly-dream:guest-cart:v1";

function isCancelledRequest(error, signal) {
  return (
    signal?.aborted ||
    error?.name === "AbortError" ||
    error?.name === "CanceledError" ||
    error?.code === "ERR_CANCELED"
  );
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function normalizeGuestItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const quantities = new Map();

  for (const item of value) {
    const variantId = typeof item?.variantId === "string" ? item.variantId : "";
    const quantity = Number(item?.quantity);

    if (!variantId || !Number.isInteger(quantity) || quantity < 1) {
      continue;
    }

    quantities.set(
      variantId,
      Math.min(99, (quantities.get(variantId) ?? 0) + quantity),
    );
  }

  return [...quantities.entries()].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
}

function readGuestItems() {
  try {
    const stored = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    return stored ? normalizeGuestItems(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
}

function writeGuestItems(items) {
  const normalized = normalizeGuestItems(items);

  if (normalized.length === 0) {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } else {
    window.localStorage.setItem(
      GUEST_CART_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  }

  return normalized;
}

async function hydrateGuestCart(items, signal) {
  const response = await previewCheckout(
    {
      items,
      deliveryAddress: null,
    },
    { signal },
  );

  return {
    message: "Bag updated.",
    cart: response.checkout?.cart ?? null,
  };
}

export function CartProvider({ children }) {
  const { user, isAuthenticated, authLoading } = useAppContext();

  const [cartState, setCartState] = useState({
    status: "loading",
    cart: null,
    error: null,
  });
  const [mutationKey, setMutationKey] = useState(null);

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const applyCartResponse = useCallback((response) => {
    setCartState({
      status: "ready",
      cart: response?.cart ?? null,
      error: null,
    });
  }, []);

  const loadGuestCart = useCallback(
    async ({ signal } = {}) => {
      const items = readGuestItems();
      const response = await hydrateGuestCart(items, signal);
      applyCartResponse(response);
      return response;
    },
    [applyCartResponse],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function synchronizeCart() {
      await Promise.resolve();

      if (controller.signal.aborted || authLoading) {
        return;
      }

      try {
        if (!isCustomer) {
          await loadGuestCart({ signal: controller.signal });
          return;
        }

        const guestItems = readGuestItems();

        if (guestItems.length > 0) {
          for (const item of guestItems) {
            if (controller.signal.aborted) {
              return;
            }

            try {
              await addCustomerCartItem(item);
            } catch {
              // A product may have become unavailable while the visitor was a
              // guest. Continue transferring the other valid bag items.
            }
          }

          writeGuestItems([]);
        }

        const response = await fetchCustomerCart({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          applyCartResponse(response);
        }
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          try {
            await loadGuestCart({ signal: controller.signal });
          } catch (guestError) {
            if (!isCancelledRequest(guestError, controller.signal)) {
              setCartState({ status: "error", cart: null, error: guestError });
            }
          }
          return;
        }

        setCartState({ status: "error", cart: null, error });
      }
    }

    void synchronizeCart();

    return () => controller.abort();
  }, [applyCartResponse, authLoading, isCustomer, loadGuestCart, user?.id]);

  const reloadCart = useCallback(async () => {
    setCartState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    try {
      const response = isCustomer
        ? await fetchCustomerCart()
        : await hydrateGuestCart(readGuestItems());

      applyCartResponse(response);
      return response;
    } catch (error) {
      setCartState({ status: "error", cart: null, error });
      throw error;
    }
  }, [applyCartResponse, isCustomer]);

  const runMutation = useCallback(
    async (key, operation) => {
      setMutationKey(key);

      try {
        const response = await operation();
        applyCartResponse(response);
        return response;
      } finally {
        setMutationKey(null);
      }
    },
    [applyCartResponse],
  );

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (isCustomer) {
        return runMutation(`add:${variantId}`, () =>
          addCustomerCartItem({ variantId, quantity }),
        );
      }

      return runMutation(`add:${variantId}`, async () => {
        const items = readGuestItems();
        const existing = items.find((item) => item.variantId === variantId);

        if (existing) {
          existing.quantity = Math.min(99, existing.quantity + quantity);
        } else {
          items.push({ variantId, quantity: Math.min(99, quantity) });
        }

        const normalized = writeGuestItems(items);
        const response = await hydrateGuestCart(normalized);

        return {
          ...response,
          message: "Product added to your bag.",
        };
      });
    },
    [isCustomer, runMutation],
  );

  const updateItemQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (isCustomer) {
        return runMutation(`update:${cartItemId}`, () =>
          updateCustomerCartItem(cartItemId, quantity),
        );
      }

      return runMutation(`update:${cartItemId}`, async () => {
        const normalized = writeGuestItems(
          readGuestItems().map((item) =>
            item.variantId === cartItemId ? { ...item, quantity } : item,
          ),
        );

        return hydrateGuestCart(normalized);
      });
    },
    [isCustomer, runMutation],
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      if (isCustomer) {
        return runMutation(`remove:${cartItemId}`, () =>
          removeCustomerCartItem(cartItemId),
        );
      }

      return runMutation(`remove:${cartItemId}`, async () => {
        const normalized = writeGuestItems(
          readGuestItems().filter((item) => item.variantId !== cartItemId),
        );
        const response = await hydrateGuestCart(normalized);

        return {
          ...response,
          message: "Item removed from your bag.",
        };
      });
    },
    [isCustomer, runMutation],
  );

  const clearCart = useCallback(async () => {
    if (isCustomer) {
      return runMutation("clear-cart", () => clearCustomerCart());
    }

    return runMutation("clear-cart", async () => {
      writeGuestItems([]);
      const response = await hydrateGuestCart([]);

      return {
        ...response,
        message: "Bag cleared.",
      };
    });
  }, [isCustomer, runMutation]);

  const refreshPrices = useCallback(async () => {
    if (isCustomer) {
      return runMutation("refresh-prices", () => refreshCustomerCartPrices());
    }

    return runMutation("refresh-prices", async () => {
      const response = await hydrateGuestCart(readGuestItems());

      return {
        ...response,
        message: "Bag prices and availability refreshed.",
      };
    });
  }, [isCustomer, runMutation]);

  const value = useMemo(
    () => ({
      cart: cartState.cart,
      status: cartState.status,
      error: cartState.error,
      mutationKey,
      isLoading: cartState.status === "loading",
      // Cart.jsx historically used this flag to block guests completely.
      // Guest bags are now first-class, so keep that legacy gate disabled.
      isGuest: false,
      isAnonymousCart: !isCustomer,
      distinctItemCount: cartState.cart?.summary?.distinctItemCount ?? 0,
      totalQuantity: cartState.cart?.summary?.totalQuantity ?? 0,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      refreshPrices,
      reloadCart,
    }),
    [
      addItem,
      cartState,
      clearCart,
      isCustomer,
      mutationKey,
      refreshPrices,
      reloadCart,
      removeItem,
      updateItemQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
