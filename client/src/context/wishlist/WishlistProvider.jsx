import { useCallback, useEffect, useMemo, useState } from "react";
import useAppContext from "../app/useAppContext.js";
import {
  addCustomerWishlistProduct,
  fetchCustomerWishlist,
  removeCustomerWishlistProduct,
} from "../../services/wishlistApi.js";
import WishlistContext from "./WishlistContext.js";

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

export function WishlistProvider({ children }) {
  const { user, isAuthenticated, authLoading } = useAppContext();

  const [wishlistState, setWishlistState] = useState({
    status: "loading",
    wishlist: null,
    error: null,
  });

  const [mutationKey, setMutationKey] = useState(null);

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const applyWishlistResponse = useCallback((response) => {
    setWishlistState({
      status: "ready",
      wishlist: response?.wishlist ?? null,
      error: null,
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function synchronizeWishlist() {
      // Keeps state updates asynchronous inside this effect.
      await Promise.resolve();

      if (controller.signal.aborted || authLoading) {
        return;
      }

      if (!isCustomer) {
        setWishlistState({
          status: "guest",
          wishlist: null,
          error: null,
        });

        return;
      }

      try {
        const response = await fetchCustomerWishlist({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        applyWishlistResponse(response);
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          setWishlistState({
            status: "guest",
            wishlist: null,
            error: null,
          });

          return;
        }

        setWishlistState({
          status: "error",
          wishlist: null,
          error,
        });
      }
    }

    void synchronizeWishlist();

    return () => {
      controller.abort();
    };
  }, [applyWishlistResponse, authLoading, isCustomer, user?.id]);

  const reloadWishlist = useCallback(async () => {
    if (!isCustomer) {
      setWishlistState({
        status: "guest",
        wishlist: null,
        error: null,
      });

      return null;
    }

    setWishlistState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    try {
      const response = await fetchCustomerWishlist();

      applyWishlistResponse(response);

      return response;
    } catch (error) {
      if (isAuthenticationError(error)) {
        setWishlistState({
          status: "guest",
          wishlist: null,
          error: null,
        });
      } else {
        setWishlistState({
          status: "error",
          wishlist: null,
          error,
        });
      }

      throw error;
    }
  }, [applyWishlistResponse, isCustomer]);

  const runMutation = useCallback(
    async (key, operation) => {
      setMutationKey(key);

      try {
        const response = await operation();

        applyWishlistResponse(response);

        return response;
      } finally {
        setMutationKey(null);
      }
    },
    [applyWishlistResponse],
  );

  const addProduct = useCallback(
    async (productId) =>
      runMutation(`add:${productId}`, () =>
        addCustomerWishlistProduct(productId),
      ),
    [runMutation],
  );

  const removeProduct = useCallback(
    async (productId) =>
      runMutation(`remove:${productId}`, () =>
        removeCustomerWishlistProduct(productId),
      ),
    [runMutation],
  );

  const savedProductIds = useMemo(
    () =>
      new Set(
        (wishlistState.wishlist?.items ?? []).map((item) => item.productId),
      ),
    [wishlistState.wishlist],
  );

  const isSaved = useCallback(
    (productId) => savedProductIds.has(productId),
    [savedProductIds],
  );

  const value = useMemo(
    () => ({
      wishlist: wishlistState.wishlist,
      status: wishlistState.status,
      error: wishlistState.error,
      mutationKey,

      isLoading: wishlistState.status === "loading",
      isGuest: wishlistState.status === "guest",

      itemCount: wishlistState.wishlist?.summary?.itemCount ?? 0,

      availableItemCount:
        wishlistState.wishlist?.summary?.availableItemCount ?? 0,

      inStockItemCount: wishlistState.wishlist?.summary?.inStockItemCount ?? 0,

      isSaved,
      addProduct,
      removeProduct,
      reloadWishlist,
    }),
    [
      wishlistState,
      mutationKey,
      isSaved,
      addProduct,
      removeProduct,
      reloadWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
