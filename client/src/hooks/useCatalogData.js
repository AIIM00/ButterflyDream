import { useEffect, useState } from "react";
import {
  fetchPublicCategories,
  fetchPublicProductBySlug,
  fetchPublicProducts,
} from "../services/catalogApi.js";

function isCancelledRequest(error, signal) {
  return signal.aborted || error?.code === "ERR_CANCELED";
}

export function usePublicCategories() {
  const [state, setState] = useState({
    status: "loading",
    categories: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetchPublicCategories({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "success",
          categories: Array.isArray(response.categories)
            ? response.categories
            : [],
          error: null,
        });
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        setState({
          status: "error",
          categories: [],
          error,
        });
      }
    }

    void loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    categories: state.categories,

    isLoading: state.status === "loading",

    error: state.error,
  };
}

export function usePublicProducts(queryString) {
  const [state, setState] = useState({
    requestKey: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const params = new URLSearchParams(queryString);

        const response = await fetchPublicProducts(params, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setState({
          requestKey: queryString,
          data: response,
          error: null,
        });
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        setState({
          requestKey: queryString,
          data: null,
          error,
        });
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [queryString]);

  const isCurrentRequest = state.requestKey === queryString;

  return {
    data: isCurrentRequest ? state.data : null,

    error: isCurrentRequest ? state.error : null,

    isLoading: !isCurrentRequest,
  };
}

export function usePublicProduct(slug) {
  const [state, setState] = useState({
    requestKey: null,
    product: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const response = await fetchPublicProductBySlug(slug, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setState({
          requestKey: slug,
          product: response.product ?? null,
          error: null,
        });
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        setState({
          requestKey: slug,
          product: null,
          error,
        });
      }
    }

    if (slug) {
      void loadProduct();
    }

    return () => {
      controller.abort();
    };
  }, [slug]);

  const isCurrentRequest = state.requestKey === slug;

  return {
    product: isCurrentRequest ? state.product : null,

    error: isCurrentRequest ? state.error : null,

    isLoading: !isCurrentRequest,
  };
}
