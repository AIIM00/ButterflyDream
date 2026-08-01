import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "../services/customerAddressService.js";
import {
  CustomerAddressValidationError,
  parseCreateCustomerAddressInput,
  parseCustomerAddressId,
  parseUpdateCustomerAddressInput,
} from "../utils/customerAddressValidation.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function getAuthenticatedUserId(request) {
  return (
    request.user?.id ??
    request.user?.userId ??
    request.auth?.userId ??
    request.userId ??
    null
  );
}

function requireCustomerId(request, response) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    errorResponse(response, 401, "Authentication is required.");

    return null;
  }

  return userId;
}

function handleAddressError(error, response, next) {
  if (error instanceof CustomerAddressValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function listCustomerAddresses(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const addresses = await getCustomerAddresses(userId);

    return successResponse(response, 200, "Addresses retrieved successfully.", {
      addresses,
    });
  } catch (error) {
    return handleAddressError(error, response, next);
  }
}

export async function createAddress(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const input = parseCreateCustomerAddressInput(request.body);

    const result = await createCustomerAddress(userId, input);

    if (result.status === "LIMIT_REACHED") {
      return errorResponse(
        response,
        409,
        `You may save no more than ${result.maximumAddresses} addresses.`,
        {
          maximumAddresses: result.maximumAddresses,
        },
      );
    }

    return successResponse(response, 201, "Address created successfully.", {
      address: result.address,
      addresses: result.addresses,
    });
  } catch (error) {
    return handleAddressError(error, response, next);
  }
}

export async function updateAddress(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const addressId = parseCustomerAddressId(request.params.addressId);

    const input = parseUpdateCustomerAddressInput(request.body);

    const result = await updateCustomerAddress(userId, addressId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Address not found.");
    }

    return successResponse(response, 200, "Address updated successfully.", {
      address: result.address,
      addresses: result.addresses,
    });
  } catch (error) {
    return handleAddressError(error, response, next);
  }
}

export async function makeDefaultAddress(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const addressId = parseCustomerAddressId(request.params.addressId);

    const result = await setDefaultCustomerAddress(userId, addressId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Address not found.");
    }

    return successResponse(
      response,
      200,
      "Default address updated successfully.",
      {
        address: result.address,
        addresses: result.addresses,
      },
    );
  } catch (error) {
    return handleAddressError(error, response, next);
  }
}

export async function removeAddress(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const addressId = parseCustomerAddressId(request.params.addressId);

    const result = await deleteCustomerAddress(userId, addressId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Address not found.");
    }

    return successResponse(response, 200, "Address deleted successfully.", {
      addresses: result.addresses,
    });
  } catch (error) {
    return handleAddressError(error, response, next);
  }
}
