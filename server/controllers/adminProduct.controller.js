import { Prisma } from "@prisma/client";
import {
  archiveAdminProduct,
  archiveAdminVariant,
  createAdminProduct,
  createAdminProductImage,
  createAdminVariant,
  deleteAdminProductImage,
  getAdminProductById,
  listAdminProducts,
  updateAdminInventory,
  updateAdminProduct,
  updateAdminProductImage,
  updateAdminProductStatus,
  updateAdminVariant,
  updateAdminVariantStatus,
} from "../services/adminProductService.js";
import {
  AdminProductValidationError,
  parseAdminProductListQuery,
  parseCreateImageInput,
  parseCreateProductInput,
  parseCreateVariantInput,
  parseImageId,
  parseInventoryInput,
  parseProductId,
  parseProductStatusInput,
  parseUpdateImageInput,
  parseUpdateProductInput,
  parseUpdateVariantInput,
  parseVariantId,
  parseVariantStatusInput,
} from "../utils/adminProductValidation.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function handleProductError(error, response, next) {
  if (error instanceof AdminProductValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : "";

    const message = target.includes("sku")
      ? "A variant with this SKU already exists."
      : target.includes("slug")
        ? "A product with this slug already exists."
        : "A unique product value already exists.";

    return errorResponse(response, 409, message);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse(
      response,
      404,
      "The requested product resource was not found.",
    );
  }

  return next(error);
}

export async function getAdminProducts(request, response, next) {
  try {
    const filters = parseAdminProductListQuery(request.query);

    const result = await listAdminProducts(filters);

    return successResponse(
      response,
      200,
      "Admin products retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function getAdminProduct(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const product = await getAdminProductById(productId);

    if (!product) {
      return errorResponse(response, 404, "Product not found.");
    }

    return successResponse(
      response,
      200,
      "Admin product retrieved successfully.",
      {
        product,
      },
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function createProduct(request, response, next) {
  try {
    const input = parseCreateProductInput(request.body);

    const result = await createAdminProduct(input);

    if (result.status === "CATEGORY_NOT_FOUND") {
      return errorResponse(response, 404, "Category not found.");
    }

    return successResponse(response, 201, "Product created successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function updateProduct(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const input = parseUpdateProductInput(request.body);

    const result = await updateAdminProduct(productId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Archived products cannot be edited.",
      );
    }

    if (result.status === "CATEGORY_NOT_FOUND") {
      return errorResponse(response, 404, "Category not found.");
    }

    return successResponse(response, 200, "Product updated successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function changeProductStatus(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const { status } = parseProductStatusInput(request.body);

    const result = await updateAdminProductStatus(productId, status);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Archived products cannot change status.",
      );
    }

    if (result.status === "NO_ACTIVE_VARIANTS") {
      return errorResponse(
        response,
        409,
        "A product must contain at least one active variant before it can become active.",
      );
    }

    return successResponse(
      response,
      200,
      "Product status updated successfully.",
      {
        product: result.product,
      },
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function archiveProduct(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const result = await archiveAdminProduct(productId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "ALREADY_ARCHIVED") {
      return errorResponse(response, 409, "Product is already archived.");
    }

    return successResponse(response, 200, "Product archived successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function createVariant(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const input = parseCreateVariantInput(request.body);

    const result = await createAdminVariant(productId, input);

    if (result.status === "PRODUCT_NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "PRODUCT_ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Variants cannot be added to an archived product.",
      );
    }

    return successResponse(response, 201, "Variant created successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function updateVariant(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const variantId = parseVariantId(request.params.variantId);

    const input = parseUpdateVariantInput(request.body);

    const result = await updateAdminVariant(productId, variantId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Variant not found.");
    }

    if (result.status === "ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Archived variants cannot be edited.",
      );
    }

    return successResponse(response, 200, "Variant updated successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function changeVariantStatus(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const variantId = parseVariantId(request.params.variantId);

    const { isActive } = parseVariantStatusInput(request.body);

    const result = await updateAdminVariantStatus(
      productId,
      variantId,
      isActive,
    );

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Variant not found.");
    }

    if (result.status === "ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Archived variants cannot change status.",
      );
    }

    if (result.status === "ONLY_ACTIVE_VARIANT") {
      return errorResponse(
        response,
        409,
        "The product must retain at least one active variant.",
      );
    }

    return successResponse(
      response,
      200,
      "Variant status updated successfully.",
      {
        product: result.product,
      },
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function updateInventory(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const variantId = parseVariantId(request.params.variantId);

    const input = parseInventoryInput(request.body);

    const result = await updateAdminInventory(productId, variantId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Active variant not found.");
    }

    return successResponse(response, 200, "Inventory updated successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function archiveVariant(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const variantId = parseVariantId(request.params.variantId);

    const result = await archiveAdminVariant(productId, variantId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Variant not found.");
    }

    if (result.status === "ALREADY_ARCHIVED") {
      return errorResponse(response, 409, "Variant is already archived.");
    }

    if (result.status === "ONLY_ACTIVE_VARIANT") {
      return errorResponse(
        response,
        409,
        "The product must retain at least one active variant.",
      );
    }

    return successResponse(response, 200, "Variant archived successfully.", {
      product: result.product,
    });
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function createProductImage(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const input = parseCreateImageInput(request.body);

    const result = await createAdminProductImage(productId, input);

    if (result.status === "PRODUCT_NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "PRODUCT_ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Images cannot be added to an archived product.",
      );
    }

    if (result.status === "VARIANT_NOT_FOUND") {
      return errorResponse(
        response,
        404,
        "The selected variant does not belong to this product.",
      );
    }

    return successResponse(
      response,
      201,
      "Product image created successfully.",
      {
        product: result.product,
      },
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function updateProductImage(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const imageId = parseImageId(request.params.imageId);

    const input = parseUpdateImageInput(request.body);

    const result = await updateAdminProductImage(productId, imageId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Product image not found.");
    }

    if (result.status === "VARIANT_NOT_FOUND") {
      return errorResponse(
        response,
        404,
        "The selected variant does not belong to this product.",
      );
    }

    return successResponse(
      response,
      200,
      "Product image updated successfully.",
      {
        product: result.product,
      },
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}

export async function deleteProductImage(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const imageId = parseImageId(request.params.imageId);

    const result = await deleteAdminProductImage(productId, imageId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Product image not found.");
    }

    return successResponse(
      response,
      200,
      "Product image deleted successfully.",
      {
        product: result.product,
      },
    );
  } catch (error) {
    return handleProductError(error, response, next);
  }
}
