import { useCallback, useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { toast } from "react-toastify";
import AdminCategoryTable from "../../components/admin/categories/AdminCategoryTable.jsx";
import CategoryFormDialog from "../../components/admin/categories/CategoryFormDialog.jsx";
import CategoryStatusDialog from "../../components/admin/categories/CategoryStatusDialog.jsx";
import {
  createAdminCategory,
  fetchAdminCategories,
  reorderAdminCategories,
  updateAdminCategory,
  updateAdminCategoryStatus,
} from "../../services/adminCategoryApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

function AdminCategoriesLoading() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="h-20 animate-pulse border-b border-gray-200 bg-gray-50" />

      <div className="space-y-1">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-5 border-b border-gray-100 px-5 py-5"
          >
            <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-100" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [originalCategories, setOriginalCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [formState, setFormState] = useState({
    open: false,
    category: null,
    formKey: 0,
  });

  const [statusCategory, setStatusCategory] = useState(null);

  const [requiresProductConfirmation, setRequiresProductConfirmation] =
    useState(false);

  const [isSavingForm, setIsSavingForm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const applyCategoriesResponse = useCallback((response) => {
    const receivedCategories = Array.isArray(response.categories)
      ? response.categories
      : [];

    setCategories(receivedCategories);
    setOriginalCategories(receivedCategories);
    setLoadError(null);
  }, []);

  const refreshCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetchAdminCategories();

      applyCategoriesResponse(response);
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }, [applyCategoriesResponse]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialCategories() {
      try {
        const response = await fetchAdminCategories({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        applyCategoriesResponse(response);
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        setLoadError(error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialCategories();

    return () => {
      controller.abort();
    };
  }, [applyCategoriesResponse]);

  const orderChanged =
    categories.length === originalCategories.length &&
    categories.some(
      (category, index) => category.id !== originalCategories[index]?.id,
    );

  function openCreateDialog() {
    setFormState((currentState) => ({
      open: true,
      category: null,
      formKey: currentState.formKey + 1,
    }));
  }

  function openEditDialog(category) {
    setFormState((currentState) => ({
      open: true,
      category,
      formKey: currentState.formKey + 1,
    }));
  }

  function closeFormDialog() {
    if (isSavingForm) {
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      open: false,
      category: null,
    }));
  }

  async function handleFormSubmit(categoryData) {
    setIsSavingForm(true);

    try {
      const response = formState.category
        ? await updateAdminCategory(formState.category.id, {
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            imageUrl: categoryData.imageUrl,
          })
        : await createAdminCategory(categoryData);

      toast.success(response.message);

      setFormState((currentState) => ({
        ...currentState,
        open: false,
        category: null,
      }));

      const refreshedResponse = await fetchAdminCategories();

      applyCategoriesResponse(refreshedResponse);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          formState.category
            ? "Unable to update category."
            : "Unable to create category.",
        ),
      );
    } finally {
      setIsSavingForm(false);
    }
  }

  function openStatusDialog(category) {
    setRequiresProductConfirmation(false);
    setStatusCategory(category);
  }

  function closeStatusDialog() {
    if (isUpdatingStatus) {
      return;
    }

    setStatusCategory(null);
    setRequiresProductConfirmation(false);
  }

  async function handleStatusConfirm() {
    if (!statusCategory) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const response = await updateAdminCategoryStatus(statusCategory.id, {
        isActive: !statusCategory.isActive,
        confirmHideProducts: requiresProductConfirmation,
      });

      toast.success(response.message);

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === response.category.id ? response.category : category,
        ),
      );

      setOriginalCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === response.category.id ? response.category : category,
        ),
      );

      setStatusCategory(null);
      setRequiresProductConfirmation(false);
    } catch (error) {
      const confirmationRequired =
        error.response?.status === 409 &&
        error.response?.data?.requiresConfirmation === true;

      if (confirmationRequired) {
        setRequiresProductConfirmation(true);
        return;
      }

      toast.error(
        getApiErrorMessage(error, "Unable to update category status."),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function moveCategory(currentIndex, direction) {
    const destinationIndex = currentIndex + direction;

    if (destinationIndex < 0 || destinationIndex >= categories.length) {
      return;
    }

    setCategories((currentCategories) => {
      const reorderedCategories = [...currentCategories];

      const [movedCategory] = reorderedCategories.splice(currentIndex, 1);

      reorderedCategories.splice(destinationIndex, 0, movedCategory);

      return reorderedCategories;
    });
  }

  function resetCategoryOrder() {
    setCategories([...originalCategories]);
  }

  async function saveCategoryOrder() {
    if (!orderChanged || isSavingOrder) {
      return;
    }

    setIsSavingOrder(true);

    try {
      const response = await reorderAdminCategories(
        categories.map((category) => category.id),
      );

      const reorderedCategories = Array.isArray(response.categories)
        ? response.categories
        : [];

      setCategories(reorderedCategories);
      setOriginalCategories(reorderedCategories);

      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save category order."));
    } finally {
      setIsSavingOrder(false);
    }
  }

  const totalAssignedProducts = categories.reduce(
    (total, category) => total + (category.productCount ?? 0),
    0,
  );

  const activeCategoryCount = categories.filter(
    (category) => category.isActive,
  ).length;

  return (
    <section className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Catalog management
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            Categories
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Create and organize the categories displayed in the customer
            storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          disabled={isSavingOrder}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AddRoundedIcon />
          Add category
        </button>
      </header>

      {!isLoading && !loadError && (
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total categories
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-950">
              {categories.length}
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Active categories
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-700">
              {activeCategoryCount}
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Assigned products
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-950">
              {totalAssignedProducts}
            </p>
          </article>
        </div>
      )}

      {isLoading && <AdminCategoriesLoading />}

      {!isLoading && loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
          <ErrorOutlineRoundedIcon
            className="text-red-500"
            sx={{
              fontSize: 56,
            }}
          />

          <h2 className="mt-4 text-xl font-bold text-red-800">
            Categories could not be loaded
          </h2>

          <p className="mt-2 text-red-700">
            {getApiErrorMessage(loadError, "Unable to load categories.")}
          </p>

          <button
            type="button"
            onClick={() => void refreshCategories()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-600"
          >
            <RefreshRoundedIcon />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !loadError && categories.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <CategoryOutlinedIcon
            className="text-gray-300"
            sx={{
              fontSize: 64,
            }}
          />

          <h2 className="mt-4 text-2xl font-bold text-gray-950">
            No categories yet
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-gray-600">
            Create the first category to begin organizing products in the
            storefront.
          </p>

          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            <AddRoundedIcon />
            Create category
          </button>
        </div>
      )}

      {!isLoading && !loadError && categories.length > 0 && (
        <AdminCategoryTable
          categories={categories}
          isUpdatingStatus={isUpdatingStatus}
          orderChanged={orderChanged}
          isSavingOrder={isSavingOrder}
          onEdit={openEditDialog}
          onStatusRequest={openStatusDialog}
          onMove={moveCategory}
          onSaveOrder={saveCategoryOrder}
          onResetOrder={resetCategoryOrder}
        />
      )}

      {formState.open && (
        <CategoryFormDialog
          key={formState.formKey}
          open
          category={formState.category}
          isSubmitting={isSavingForm}
          onClose={closeFormDialog}
          onSubmit={handleFormSubmit}
        />
      )}

      <CategoryStatusDialog
        open={statusCategory !== null}
        category={statusCategory}
        requiresProductConfirmation={requiresProductConfirmation}
        isSubmitting={isUpdatingStatus}
        onClose={closeStatusDialog}
        onConfirm={handleStatusConfirm}
      />
    </section>
  );
}

export default AdminCategories;
