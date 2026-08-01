import { useCallback, useEffect, useMemo, useState } from "react";

//Services
import {
  addCustomerCartItem,
  clearCustomerCart,
  fetchCustomerCart,
  refreshCustomerCartPrices,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "../../services/cartApi.js";

//Context
import CartContext from "./CartContext.jsx";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

export function CartProvider({ children }) {
  const [cartState, setCartState] = useState({
    status: "loading",
    cart: null,
    error: null,
  });

  const [mutationKey, setMutationKey] = useState(null);

  const applyCartResponse = useCallback((response) => {
    setCartState({
      status: "ready",
      cart: response?.cart ?? null,
      error: null,
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialCart() {
      try {
        const response = await fetchCustomerCart({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        applyCartResponse(response);
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          setCartState({
            status: "guest",
            cart: null,
            error: null,
          });

          return;
        }

        setCartState({
          status: "error",
          cart: null,
          error,
        });
      }
    }

    void loadInitialCart();

    return () => {
      controller.abort();
    };
  }, [applyCartResponse]);

  const reloadCart = useCallback(async () => {
    setCartState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    try {
      const response = await fetchCustomerCart();

      applyCartResponse(response);

      return response;
    } catch (error) {
      if (isAuthenticationError(error)) {
        setCartState({
          status: "guest",
          cart: null,
          error: null,
        });
      } else {
        setCartState({
          status: "error",
          cart: null,
          error,
        });
      }

      throw error;
    }
  }, [applyCartResponse]);

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
    async (variantId, quantity = 1) =>
      runMutation(`add:${variantId}`, () =>
        addCustomerCartItem({
          variantId,
          quantity,
        }),
      ),
    [runMutation],
  );

  const updateItemQuantity = useCallback(
    async (cartItemId, quantity) =>
      runMutation(`update:${cartItemId}`, () =>
        updateCustomerCartItem(cartItemId, quantity),
      ),
    [runMutation],
  );

  const removeItem = useCallback(
    async (cartItemId) =>
      runMutation(`remove:${cartItemId}`, () =>
        removeCustomerCartItem(cartItemId),
      ),
    [runMutation],
  );

  const clearCart = useCallback(
    async () => runMutation("clear-cart", () => clearCustomerCart()),
    [runMutation],
  );

  const refreshPrices = useCallback(
    async () =>
      runMutation("refresh-prices", () => refreshCustomerCartPrices()),
    [runMutation],
  );

  const value = useMemo(
    () => ({
      cart: cartState.cart,
      status: cartState.status,
      error: cartState.error,
      mutationKey,

      isLoading: cartState.status === "loading",
      isGuest: cartState.status === "guest",

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
      cartState,
      mutationKey,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      refreshPrices,
      reloadCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
