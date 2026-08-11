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
import { uploadCategoryImage } from "../../services/adminCategoryImageUploadApi.js";
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

  const CATEGORY_ID_MAX_LENGTH = 191;
  const CATEGORY_NAME_MAX_LENGTH = 100;
  const CATEGORY_SLUG_MAX_LENGTH = 120;
  const CATEGORY_DESCRIPTION_MAX_LENGTH = 1000;
  const CATEGORY_IMAGE_URL_MAX_LENGTH = 2048;
  const MAX_DISPLAY_ORDER = 100_000;

  const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  export class CategoryValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "CategoryValidationError";
      this.statusCode = 400;
    }
  }

  function hasOwn(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }

  function validatePlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new CategoryValidationError("A valid request body is required.");
    }
  }

  function parseCategoryName(value) {
    if (typeof value !== "string") {
      throw new CategoryValidationError("Category name is required.");
    }

    const normalizedName = value.trim();

    if (
      normalizedName.length < 2 ||
      normalizedName.length > CATEGORY_NAME_MAX_LENGTH
    ) {
      throw new CategoryValidationError(
        `Category name must contain between 2 and ${CATEGORY_NAME_MAX_LENGTH} characters.`,
      );
    }

    return normalizedName;
  }

  export function createCategorySlug(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, CATEGORY_SLUG_MAX_LENGTH)
      .replace(/-+$/g, "");
  }

  function parseCategorySlug(value, fallbackName) {
    const source =
      typeof value === "string" && value.trim() ? value : fallbackName;

    const slug = createCategorySlug(source);

    if (
      !slug ||
      slug.length > CATEGORY_SLUG_MAX_LENGTH ||
      !CATEGORY_SLUG_PATTERN.test(slug)
    ) {
      throw new CategoryValidationError(
        "Category slug must contain lowercase letters, numbers, and single hyphens.",
      );
    }

    return slug;
  }

  function parseDescription(value) {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== "string") {
      throw new CategoryValidationError("Category description must be text.");
    }

    const normalizedDescription = value.trim();

    if (!normalizedDescription) {
      return null;
    }

    if (normalizedDescription.length > CATEGORY_DESCRIPTION_MAX_LENGTH) {
      throw new CategoryValidationError(
        `Category description must not exceed ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters.`,
      );
    }

    return normalizedDescription;
  }

  function parseImageUrl(value) {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== "string") {
      throw new CategoryValidationError("Category image URL must be text.");
    }

    const normalizedUrl = value.trim();

    if (!normalizedUrl) {
      return null;
    }

    if (normalizedUrl.length > CATEGORY_IMAGE_URL_MAX_LENGTH) {
      throw new CategoryValidationError("Category image URL is too long.");
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      throw new CategoryValidationError("Category image URL must be valid.");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new CategoryValidationError(
        "Category image URL must use HTTP or HTTPS.",
      );
    }

    return parsedUrl.toString();
  }

  function parseBoolean(value, fieldName) {
    if (typeof value !== "boolean") {
      throw new CategoryValidationError(`${fieldName} must be true or false.`);
    }

    return value;
  }

  function parseDisplayOrder(value) {
    if (!Number.isInteger(value) || value < 0 || value > MAX_DISPLAY_ORDER) {
      throw new CategoryValidationError(
        `Display order must be an integer between 0 and ${MAX_DISPLAY_ORDER}.`,
      );
    }

    return value;
  }

  export function parseCategoryId(value) {
    const categoryId = typeof value === "string" ? value.trim() : "";

    if (!categoryId || categoryId.length > CATEGORY_ID_MAX_LENGTH) {
      throw new CategoryValidationError("The category ID is invalid.");
    }

    return categoryId;
  }

  export function parseCreateCategoryInput(body) {
    validatePlainObject(body);

    const name = parseCategoryName(body.name);

    return {
      name,

      slug: parseCategorySlug(body.slug, name),

      description: parseDescription(body.description),

      isActive:
        body.isActive === undefined
          ? true
          : parseBoolean(body.isActive, "Category active status"),

      displayOrder:
        body.displayOrder === undefined
          ? undefined
          : parseDisplayOrder(body.displayOrder),
    };
  }

  export function parseUpdateCategoryInput(body) {
    validatePlainObject(body);

    const updateData = {};

    if (hasOwn(body, "name")) {
      updateData.name = parseCategoryName(body.name);
    }

    if (hasOwn(body, "slug")) {
      updateData.slug = parseCategorySlug(body.slug, updateData.name);
    }

    if (hasOwn(body, "description")) {
      updateData.description = parseDescription(body.description);
    }

    if (hasOwn(body, "imageUrl")) {
      updateData.imageUrl = parseImageUrl(body.imageUrl);
    }

    if (hasOwn(body, "displayOrder")) {
      updateData.displayOrder = parseDisplayOrder(body.displayOrder);
    }

    if (Object.keys(updateData).length === 0) {
      throw new CategoryValidationError(
        "Provide at least one category field to update.",
      );
    }

    return updateData;
  }

  export function parseCategoryStatusInput(body) {
    validatePlainObject(body);

    return {
      isActive: parseBoolean(body.isActive, "Category active status"),

      confirmHideProducts:
        body.confirmHideProducts === undefined
          ? false
          : parseBoolean(
              body.confirmHideProducts,
              "Product-hiding confirmation",
            ),
    };
  }

  export function parseCategoryReorderInput(body) {
    validatePlainObject(body);

    if (!Array.isArray(body.categoryIds)) {
      throw new CategoryValidationError("categoryIds must be an array.");
    }

    if (body.categoryIds.length === 0) {
      throw new CategoryValidationError(
        "categoryIds must contain at least one category ID.",
      );
    }

    const categoryIds = body.categoryIds.map(parseCategoryId);

    const uniqueCategoryIds = new Set(categoryIds);

    if (uniqueCategoryIds.size !== categoryIds.length) {
      throw new CategoryValidationError(
        "categoryIds must not contain duplicate IDs.",
      );
    }

    return {
      categoryIds,
    };
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
