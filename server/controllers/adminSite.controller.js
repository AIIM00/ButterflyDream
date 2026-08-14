//Services
import {
  createAdminHomeSection,
  deleteAdminHomeSection,
  listAdminHomeSections,
  reorderAdminHomeSections,
  updateAdminHomeSection,
} from "../services/adminSiteContentService.js";
import {
  getAdminSiteTheme,
  updateAdminSiteTheme,
} from "../services/adminSiteContentService.js";
import {
  getSitePublicationStatus,
  publishSite,
} from "../services/sitePublicationService.js";
//Utils
import {
  HomeSectionValidationError,
  parseCreateHomeSectionInput,
  parseHomeSectionId,
  parseHomeSectionReorderInput,
  parseUpdateHomeSectionInput,
} from "../utils/homeSectionValidation.js";
import {
  AdminSiteThemeValidationError,
  parseAdminSiteThemeInput,
} from "../utils/adminSiteThemeValidation.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { createSitePreviewToken } from "../utils/sitePreviewToken.js";

function handleHomeSectionError(error, response, next) {
  if (error instanceof HomeSectionValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function getAdminHomeSections(_request, response, next) {
  try {
    const sections = await listAdminHomeSections();

    return successResponse(
      response,
      200,
      "Homepage sections retrieved successfully.",
      {
        sections,
      },
    );
  } catch (error) {
    return handleHomeSectionError(error, response, next);
  }
}

export async function createHomeSection(request, response, next) {
  try {
    const input = parseCreateHomeSectionInput(request.body);

    const section = await createAdminHomeSection(input);

    return successResponse(
      response,
      201,
      "Homepage section created successfully.",
      {
        section,
      },
    );
  } catch (error) {
    return handleHomeSectionError(error, response, next);
  }
}

export async function updateHomeSection(request, response, next) {
  try {
    const sectionId = parseHomeSectionId(request.params.sectionId);

    const input = parseUpdateHomeSectionInput(request.body);

    const section = await updateAdminHomeSection(sectionId, input);

    if (!section) {
      return errorResponse(response, 404, "Homepage section not found.");
    }

    return successResponse(
      response,
      200,
      "Homepage section updated successfully.",
      {
        section,
      },
    );
  } catch (error) {
    return handleHomeSectionError(error, response, next);
  }
}

export async function removeHomeSection(request, response, next) {
  try {
    const sectionId = parseHomeSectionId(request.params.sectionId);

    const deletedSection = await deleteAdminHomeSection(sectionId);

    if (!deletedSection) {
      return errorResponse(response, 404, "Homepage section not found.");
    }

    return successResponse(
      response,
      200,
      "Homepage section removed successfully.",
      {
        deletedSection,
      },
    );
  } catch (error) {
    return handleHomeSectionError(error, response, next);
  }
}

export async function reorderHomeSections(request, response, next) {
  try {
    const { sectionIds } = parseHomeSectionReorderInput(request.body);

    const result = await reorderAdminHomeSections(sectionIds);

    if (result.status === "INCOMPLETE_SECTION_LIST") {
      return errorResponse(
        response,
        400,
        "The reorder request must contain every homepage section exactly once.",
      );
    }

    if (result.status === "UNKNOWN_SECTION") {
      return errorResponse(
        response,
        400,
        "The reorder request contains an unknown homepage section ID.",
      );
    }

    return successResponse(
      response,
      200,
      "Homepage sections reordered successfully.",
      {
        sections: result.sections,
      },
    );
  } catch (error) {
    return handleHomeSectionError(error, response, next);
  }
}

export async function getSiteTheme(_request, response, next) {
  try {
    const theme = await getAdminSiteTheme();

    return successResponse(
      response,
      200,
      "Website theme retrieved successfully.",
      {
        theme,
      },
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateSiteTheme(request, response, next) {
  try {
    const input = parseAdminSiteThemeInput(request.body);

    const theme = await updateAdminSiteTheme(input);

    return successResponse(
      response,
      200,
      "Website theme updated successfully.",
      {
        theme,
      },
    );
  } catch (error) {
    if (error instanceof AdminSiteThemeValidationError) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
export async function getPublicationStatus(request, response, next) {
  try {
    const status = await getSitePublicationStatus();

    return response.status(200).json({
      success: true,

      publication: status,
    });
  } catch (error) {
    return next(error);
  }
}

export async function publishWebsite(request, response, next) {
  try {
    const publication = await publishSite({
      adminUserId: request.user?.id ?? null,
    });

    return response.status(200).json({
      success: true,

      message: "Website published successfully.",

      publication,
    });
  } catch (error) {
    return next(error);
  }
}
export async function createWebsitePreview(request, response, next) {
  try {
    const preview = createSitePreviewToken({
      adminUserId: request.user.id,
    });

    response.set("Cache-Control", "private, no-store");

    return response.status(200).json({
      success: true,

      preview,
    });
  } catch (error) {
    return next(error);
  }
}
