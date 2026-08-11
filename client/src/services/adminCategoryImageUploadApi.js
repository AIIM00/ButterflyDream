const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

const MAX_CATEGORY_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_CATEGORY_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class CategoryImageUploadError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "CategoryImageUploadError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
  }
}

function validateCategoryId(categoryId) {
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    throw new CategoryImageUploadError("A valid category ID is required.");
  }

  return categoryId.trim();
}

export function validateCategoryImageFile(file) {
  if (!(file instanceof File)) {
    throw new CategoryImageUploadError("Select a category image to upload.");
  }

  if (!ALLOWED_CATEGORY_IMAGE_TYPES.has(file.type)) {
    throw new CategoryImageUploadError(
      "Only JPG, PNG, and WebP images are allowed.",
    );
  }

  if (file.size < 1) {
    throw new CategoryImageUploadError("The selected image is empty.");
  }

  if (file.size > MAX_CATEGORY_IMAGE_SIZE_BYTES) {
    throw new CategoryImageUploadError(
      "Category images must be no larger than 10 MB.",
    );
  }

  return file;
}

async function parseApiResponse(response) {
  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new CategoryImageUploadError(
      body?.message || "The category image request could not be completed.",
      {
        status: response.status,
      },
    );
  }

  return body;
}

/*
 * Step 1:
 * Ask our backend for a temporary R2
 * presigned upload URL.
 */
export async function requestCategoryImageUploadUrl(categoryId, file) {
  const normalizedCategoryId = validateCategoryId(categoryId);

  validateCategoryImageFile(file);

  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${encodeURIComponent(
      normalizedCategoryId,
    )}/image/upload-url`,
    {
      method: "POST",
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    },
  );

  const body = await parseApiResponse(response);

  if (!body?.upload?.uploadUrl || !body?.upload?.objectKey) {
    throw new CategoryImageUploadError(
      "The server returned an invalid category image upload configuration.",
    );
  }

  return body.upload;
}

/*
 * Step 2:
 * Upload the actual file directly from the
 * browser to Cloudflare R2.
 */
export function uploadCategoryImageToR2(
  file,
  upload,
  { onProgress, signal } = {},
) {
  validateCategoryImageFile(file);

  if (!upload?.uploadUrl || typeof upload.uploadUrl !== "string") {
    return Promise.reject(
      new CategoryImageUploadError("A valid R2 upload URL is required."),
    );
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", upload.uploadUrl, true);

    /*
     * These headers must match the headers that
     * were included in the presigned request.
     */
    const requiredHeaders = upload.requiredHeaders ?? {
      "Content-Type": file.type,
    };

    Object.entries(requiredHeaders).forEach(([name, value]) => {
      request.setRequestHeader(name, value);
    });

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || typeof onProgress !== "function") {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);

      onProgress(progress);
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);

        resolve({
          status: request.status,
          etag: request.getResponseHeader("ETag"),
        });

        return;
      }

      reject(
        new CategoryImageUploadError(
          "Cloudflare R2 rejected the category image upload.",
          {
            status: request.status,
          },
        ),
      );
    });

    request.addEventListener("error", () => {
      reject(
        new CategoryImageUploadError(
          "The category image could not be uploaded to Cloudflare R2.",
        ),
      );
    });

    request.addEventListener("abort", () => {
      reject(
        new CategoryImageUploadError(
          "The category image upload was cancelled.",
          {
            code: "UPLOAD_ABORTED",
          },
        ),
      );
    });

    if (signal) {
      if (signal.aborted) {
        request.abort();
        return;
      }

      signal.addEventListener(
        "abort",
        () => {
          request.abort();
        },
        {
          once: true,
        },
      );
    }

    request.send(file);
  });
}

/*
 * Step 3:
 * Tell our backend to verify the real R2
 * object and save it to the category.
 */
export async function finalizeCategoryImageUpload(categoryId, { objectKey }) {
  const normalizedCategoryId = validateCategoryId(categoryId);

  if (typeof objectKey !== "string" || !objectKey.trim()) {
    throw new CategoryImageUploadError(
      "The uploaded category image object key is missing.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${encodeURIComponent(
      normalizedCategoryId,
    )}/image/finalize`,
    {
      method: "POST",
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        objectKey: objectKey.trim(),
      }),
    },
  );

  const body = await parseApiResponse(response);

  if (!body?.category) {
    throw new CategoryImageUploadError(
      "The server finalized the upload but did not return the category.",
    );
  }

  return body.category;
}

/*
 * Full category image upload workflow.
 *
 * 1. Request temporary presigned URL
 * 2. Upload directly to R2
 * 3. Backend verifies and registers image
 */
export async function uploadCategoryImage(
  categoryId,
  file,
  { onProgress, signal } = {},
) {
  validateCategoryImageFile(file);

  onProgress?.(0);

  const upload = await requestCategoryImageUploadUrl(categoryId, file);

  await uploadCategoryImageToR2(file, upload, {
    onProgress,
    signal,
  });

  const category = await finalizeCategoryImageUpload(categoryId, {
    objectKey: upload.objectKey,
  });

  return category;
}

export { ALLOWED_CATEGORY_IMAGE_TYPES, MAX_CATEGORY_IMAGE_SIZE_BYTES };
