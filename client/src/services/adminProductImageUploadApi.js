const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ProductImageUploadError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "ProductImageUploadError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
  }
}

function validateProductId(productId) {
  if (typeof productId !== "string" || !productId.trim()) {
    throw new ProductImageUploadError("A valid product ID is required.");
  }

  return productId.trim();
}

export function validateProductImageFile(file) {
  if (!(file instanceof File)) {
    throw new ProductImageUploadError("Select an image to upload.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ProductImageUploadError(
      "Only JPG, PNG, and WebP images are allowed.",
    );
  }

  if (file.size < 1) {
    throw new ProductImageUploadError("The selected image is empty.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ProductImageUploadError(
      "Product images must be no larger than 10 MB.",
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
    throw new ProductImageUploadError(
      body?.message || "The image request could not be completed.",
      {
        status: response.status,
      },
    );
  }

  return body;
}

export async function requestProductImageUploadUrl(productId, file) {
  const normalizedProductId = validateProductId(productId);

  validateProductImageFile(file);

  const response = await fetch(
    `${API_BASE_URL}/admin/products/${normalizedProductId}/images/upload-url`,
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
    throw new ProductImageUploadError(
      "The server returned an invalid upload configuration.",
    );
  }

  return body.upload;
}

export function uploadProductImageToR2(
  file,
  upload,
  { onProgress, signal } = {},
) {
  validateProductImageFile(file);

  if (!upload?.uploadUrl || typeof upload.uploadUrl !== "string") {
    return Promise.reject(
      new ProductImageUploadError("A valid R2 upload URL is required."),
    );
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", upload.uploadUrl, true);

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
        new ProductImageUploadError(
          "Cloudflare R2 rejected the image upload.",
          {
            status: request.status,
          },
        ),
      );
    });

    request.addEventListener("error", () => {
      reject(
        new ProductImageUploadError(
          "The image could not be uploaded to Cloudflare R2.",
        ),
      );
    });

    request.addEventListener("abort", () => {
      reject(
        new ProductImageUploadError("The image upload was cancelled.", {
          code: "UPLOAD_ABORTED",
        }),
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

export async function finalizeProductImageUpload(
  productId,
  { objectKey, altText = "" },
) {
  const normalizedProductId = validateProductId(productId);

  if (typeof objectKey !== "string" || !objectKey.trim()) {
    throw new ProductImageUploadError(
      "The uploaded image object key is missing.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/products/${normalizedProductId}/images/finalize`,
    {
      method: "POST",
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        objectKey: objectKey.trim(),

        altText: typeof altText === "string" ? altText.trim() : "",
      }),
    },
  );

  const body = await parseApiResponse(response);

  if (!body?.image) {
    throw new ProductImageUploadError(
      "The server finalized the upload but did not return the image.",
    );
  }

  return body.image;
}

export async function uploadProductImage(
  productId,
  file,
  { altText = "", onProgress, signal } = {},
) {
  validateProductImageFile(file);

  onProgress?.(0);

  /*
   * 1. Backend creates a secure temporary
   *    presigned R2 URL.
   */
  const upload = await requestProductImageUploadUrl(productId, file);

  /*
   * 2. Browser uploads the actual image
   *    directly to Cloudflare R2.
   */
  await uploadProductImageToR2(file, upload, {
    onProgress,
    signal,
  });

  /*
   * 3. Backend verifies the real R2 object
   *    and creates ProductImage in PostgreSQL.
   */
  const image = await finalizeProductImageUpload(productId, {
    objectKey: upload.objectKey,

    altText,
  });

  return image;
}

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES };
