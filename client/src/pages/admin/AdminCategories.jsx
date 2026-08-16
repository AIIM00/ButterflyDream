import { useCallback, useEffect, useState } from "react";

// MUI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

// Toast
import { toast } from "react-toastify";

// Components
import AdminCategoryTable from "../../components/admin/categories/AdminCategoryTable.jsx";
import CategoryFormDialog from "../../components/admin/categories/CategoryFormDialog.jsx";
import CategoryStatusDialog from "../../components/admin/categories/CategoryStatusDialog.jsx";

// Services
import {
  createAdminCategory,
  fetchAdminCategories,
  reorderAdminCategories,
  updateAdminCategory,
  updateAdminCategoryStatus,
} from "../../services/adminCategoryApi.js";

import { uploadCategoryImage } from "../../services/adminCategoryImageUploadApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

/* =========================================================
   LOADING
========================================================= */

function AdminCategoriesLoading() {
  return (
    <div
      className="
        overflow-hidden
        rounded-[1.4rem]
        border
        border-gray-200/80
        bg-white
        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      {/* HEADER */}
      <div
        className="
          border-b
          border-gray-100
          px-4
          py-4

          sm:px-5
          sm:py-5

          lg:px-6
        "
      >
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />

        <div className="mt-3 h-6 w-40 animate-pulse rounded bg-gray-100" />

        <div
          className="
            mt-2
            h-4
            w-72
            max-w-full
            animate-pulse
            rounded
            bg-gray-100
          "
        />
      </div>

      {/* MOBILE CARDS */}
      <div
        className="
          space-y-3
          p-4

          sm:p-5

          lg:hidden
        "
      >
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-52
              animate-pulse
              rounded-[1.2rem]
              bg-gray-100
            "
          />
        ))}
      </div>

      {/* DESKTOP ROWS */}
      <div className="hidden lg:block">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-100
              px-6
              py-4
            "
          >
            <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-100" />

            <div className="flex-1">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />

              <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function CategorySummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "dark",
}) {
  const tones = {
    dark: {
      icon: "bg-gray-950 text-white",
      value: "text-gray-950",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-gray-950",
    },
  };

  const configuration = tones[tone] ?? tones.dark;

  return (
    <article
      className="
        rounded-[1.25rem]
        border
        border-gray-200/80
        bg-white
        p-4
        shadow-[0_6px_20px_rgba(15,23,42,0.035)]

        sm:p-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.6rem]
              font-bold
              uppercase
              tracking-[0.1em]
              text-gray-400

              sm:text-[0.65rem]
            "
          >
            {label}
          </p>

          <p
            className={[
              `
                mt-2
                text-2xl
                font-bold
                tracking-[-0.04em]

                sm:text-3xl
              `,
              configuration.value,
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        <span
          className={[
            `
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl

              sm:h-11
              sm:w-11
            `,
            configuration.icon,
          ].join(" ")}
        >
          <Icon
            sx={{
              fontSize: 19,
            }}
          />
        </span>
      </div>

      <p
        className="
          mt-3
          text-[0.68rem]
          leading-5
          text-gray-500

          sm:text-xs
        "
      >
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

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

  /* =======================================================
     APPLY RESPONSE
  ======================================================= */

  const applyCategoriesResponse = useCallback((response) => {
    const receivedCategories = Array.isArray(response.categories)
      ? response.categories
      : [];

    setCategories(receivedCategories);
    setOriginalCategories(receivedCategories);
    setLoadError(null);
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

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

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

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

  /* =======================================================
     ORDER STATE
  ======================================================= */

  const orderChanged =
    categories.length === originalCategories.length &&
    categories.some(
      (category, index) => category.id !== originalCategories[index]?.id,
    );

  /* =======================================================
     FORM DIALOG
  ======================================================= */

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
      /*
       * Save category information first.
       *
       * The category must exist before its image
       * can be stored under its category ID.
       */
      const response = formState.category
        ? await updateAdminCategory(formState.category.id, {
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
          })
        : await createAdminCategory({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            isActive: categoryData.isActive,
          });

      const savedCategory = response.category;
      const categorySaveMessage = response.message;

      if (!savedCategory?.id) {
        throw new Error(
          "The category was saved but the server did not return its ID.",
        );
      }

      /*
       * Upload a newly selected category image
       * after the category record has been saved.
       */
      if (categoryData.imageFile) {
        try {
          await uploadCategoryImage(savedCategory.id, categoryData.imageFile);
        } catch (imageError) {
          toast.error(
            imageError?.message ||
              "The category was saved, but its image could not be uploaded.",
          );

          try {
            const refreshedResponse = await fetchAdminCategories();

            applyCategoriesResponse(refreshedResponse);
          } catch (refreshError) {
            console.error(
              "Unable to refresh categories after category image upload failure:",
              refreshError,
            );
          }

          setFormState((currentState) => ({
            ...currentState,
            open: false,
            category: null,
          }));

          return;
        }
      }

      toast.success(
        categoryData.imageFile
          ? formState.category
            ? "Category and image updated successfully."
            : "Category and image created successfully."
          : categorySaveMessage,
      );

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

  /* =======================================================
     STATUS DIALOG
  ======================================================= */

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

  /* =======================================================
     ORDERING
  ======================================================= */

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

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalAssignedProducts = categories.reduce(
    (total, category) => total + (category.productCount ?? 0),
    0,
  );

  const activeCategoryCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCategoryCount = categories.length - activeCategoryCount;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[100rem]
        space-y-5

        sm:space-y-6
      "
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <header
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-end
          sm:justify-between
          sm:gap-6
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.13em]
              text-gray-400
            "
          >
            Catalog management
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.035em]
              text-gray-950

              sm:text-3xl
            "
          >
            Categories
          </h1>

          <p
            className="
              mt-1.5
              max-w-2xl
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            Create, organize, reorder, and control the categories customers see
            across the storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          disabled={isSavingOrder}
          className="
            inline-flex
            min-h-11
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-full
            bg-gray-950
            px-5
            text-sm
            font-bold
            text-white
            transition-colors

            hover:bg-gray-800

            disabled:cursor-not-allowed
            disabled:bg-gray-200
            disabled:text-gray-400

            sm:w-auto
          "
        >
          <AddRoundedIcon
            sx={{
              fontSize: 18,
            }}
          />
          Add category
        </button>
      </header>

      {/* =====================================================
          SUMMARY
      ===================================================== */}
      {!isLoading && !loadError && categories.length > 0 && (
        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-3
            sm:gap-4
          "
        >
          <CategorySummaryCard
            icon={CategoryOutlinedIcon}
            label="Categories"
            value={categories.length}
            description={`${inactiveCategoryCount} currently inactive`}
            tone="dark"
          />

          <CategorySummaryCard
            icon={CheckCircleOutlineRoundedIcon}
            label="Active"
            value={activeCategoryCount}
            description="Visible storefront categories"
            tone="green"
          />

          <div className="col-span-2 sm:col-span-1">
            <CategorySummaryCard
              icon={Inventory2OutlinedIcon}
              label="Assigned products"
              value={totalAssignedProducts}
              description="Products organized across categories"
              tone="blue"
            />
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}
      {isLoading && <AdminCategoriesLoading />}

      {/* =====================================================
          ERROR
      ===================================================== */}
      {!isLoading && loadError && (
        <div
          className="
            rounded-[1.4rem]
            border
            border-red-200
            bg-white
            p-5
            text-center
            shadow-[0_8px_24px_rgba(15,23,42,0.04)]

            sm:p-8
          "
        >
          <span
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-600
              ring-1
              ring-red-100
            "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 26,
              }}
            />
          </span>

          <p
            className="
              mt-5
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.12em]
              text-red-500
            "
          >
            Loading error
          </p>

          <h2
            className="
              mt-1.5
              text-xl
              font-bold
              tracking-[-0.025em]
              text-gray-950
            "
          >
            Categories could not be loaded
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            {getApiErrorMessage(loadError, "Unable to load categories.")}
          </p>

          <button
            type="button"
            onClick={() => void refreshCategories()}
            className="
              mt-5
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-950
              px-5
              text-sm
              font-bold
              text-white
              transition-colors

              hover:bg-gray-800
            "
          >
            <RefreshRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}
      {!isLoading && !loadError && categories.length === 0 && (
        <div
          className="
              rounded-[1.4rem]
              border
              border-gray-200/80
              bg-white
              px-5
              py-10
              text-center
              shadow-[0_8px_24px_rgba(15,23,42,0.04)]

              sm:px-8
              sm:py-14
            "
        >
          <span
            className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-gray-400
                ring-1
                ring-gray-200
              "
          >
            <StorefrontOutlinedIcon
              sx={{
                fontSize: 25,
              }}
            />
          </span>

          <p
            className="
                mt-5
                text-[0.62rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-gray-400
              "
          >
            Catalog setup
          </p>

          <h2
            className="
                mt-1.5
                text-xl
                font-bold
                tracking-[-0.025em]
                text-gray-950

                sm:text-2xl
              "
          >
            No categories yet
          </h2>

          <p
            className="
                mx-auto
                mt-2
                max-w-md
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
                sm:leading-6
              "
          >
            Create the first category to begin organizing products for the
            storefront.
          </p>

          <button
            type="button"
            onClick={openCreateDialog}
            className="
                mt-5
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gray-950
                px-5
                text-sm
                font-bold
                text-white
                transition-colors

                hover:bg-gray-800
              "
          >
            <AddRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Create category
          </button>
        </div>
      )}

      {/* =====================================================
          CATEGORY TABLE
      ===================================================== */}
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

      {/* =====================================================
          CATEGORY FORM
      ===================================================== */}
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

      {/* =====================================================
          STATUS DIALOG
      ===================================================== */}
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
