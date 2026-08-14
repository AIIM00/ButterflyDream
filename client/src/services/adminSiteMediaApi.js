const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

const MAX_SITE_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_SITE_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class SiteMediaUploadError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "SiteMediaUploadError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
  }
}

export function validateSiteMediaFile(file) {
  if (!(file instanceof File)) {
    throw new SiteMediaUploadError("Select an image to upload.");
  }

  if (!ALLOWED_SITE_MEDIA_TYPES.has(file.type)) {
    throw new SiteMediaUploadError(
      "Only JPG, PNG, and WebP images are allowed.",
    );
  }

  if (file.size < 1) {
    throw new SiteMediaUploadError("The selected image is empty.");
  }

  if (file.size > MAX_SITE_MEDIA_SIZE_BYTES) {
    throw new SiteMediaUploadError(
      "Website images must be no larger than 10 MB.",
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
    throw new SiteMediaUploadError(
      body?.message || "The website media request could not be completed.",
      {
        status: response.status,
      },
    );
  }

  return body;
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      URL.revokeObjectURL(objectUrl);

      resolve(dimensions);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(new SiteMediaUploadError("The selected image could not be read."));
    };

    image.src = objectUrl;
  });
}

export async function requestSiteMediaUploadUrl(file, { signal } = {}) {
  validateSiteMediaFile(file);

  const response = await fetch(`${API_BASE_URL}/admin/site/assets/upload-url`, {
    method: "POST",

    credentials: "include",

    signal,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const body = await parseApiResponse(response);

  if (!body?.upload?.uploadUrl || !body?.upload?.objectKey) {
    throw new SiteMediaUploadError(
      "The server returned an invalid website media upload configuration.",
    );
  }

  return body.upload;
}

export function uploadSiteMediaToR2(file, upload, { onProgress, signal } = {}) {
  validateSiteMediaFile(file);

  if (!upload?.uploadUrl || typeof upload.uploadUrl !== "string") {
    return Promise.reject(
      new SiteMediaUploadError("A valid R2 upload URL is required."),
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

    const handleAbortSignal = () => {
      request.abort();
    };

    const cleanup = () => {
      signal?.removeEventListener("abort", handleAbortSignal);
    };

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || typeof onProgress !== "function") {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);

      onProgress(progress);
    });

    request.addEventListener("load", () => {
      cleanup();

      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);

        resolve({
          status: request.status,
          etag: request.getResponseHeader("ETag"),
        });

        return;
      }

      reject(
        new SiteMediaUploadError(
          "Cloudflare R2 rejected the website image upload.",
          {
            status: request.status,
          },
        ),
      );
    });

    request.addEventListener("error", () => {
      cleanup();

      reject(
        new SiteMediaUploadError(
          "The website image could not be uploaded to Cloudflare R2.",
        ),
      );
    });

    request.addEventListener("abort", () => {
      cleanup();

      reject(
        new SiteMediaUploadError("The website image upload was cancelled.", {
          code: "UPLOAD_ABORTED",
        }),
      );
    });

    if (signal) {
      if (signal.aborted) {
        request.abort();
        return;
      }

      signal.addEventListener("abort", handleAbortSignal, {
        once: true,
      });
    }

    request.send(file);
  });
}
export async function finalizeSiteMediaUpload(
  { objectKey, fileName, altText = "", width = null, height = null },
  { signal } = {},
) {
  if (typeof objectKey !== "string" || !objectKey.trim()) {
    throw new SiteMediaUploadError("The uploaded image object key is missing.");
  }

  if (typeof fileName !== "string" || !fileName.trim()) {
    throw new SiteMediaUploadError("The uploaded image filename is missing.");
  }

  const response = await fetch(`${API_BASE_URL}/admin/site/assets/finalize`, {
    method: "POST",

    credentials: "include",

    signal,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      objectKey: objectKey.trim(),

      fileName: fileName.trim(),

      altText: typeof altText === "string" ? altText.trim() : "",

      width,
      height,
    }),
  });

  const body = await parseApiResponse(response);

  if (!body?.asset) {
    throw new SiteMediaUploadError(
      "The server finalized the upload but did not return the media asset.",
    );
  }

  return body.asset;
}
export async function uploadSiteMedia(
  file,
  { altText = "", onProgress, signal } = {},
) {
  validateSiteMediaFile(file);

  onProgress?.(0);

  /*
   * Read the image dimensions before upload.
   */
  const dimensions = await getImageDimensions(file);

  /*
   * 1. Backend creates a temporary
   * signed Cloudflare R2 upload URL.
   */
  const upload = await requestSiteMediaUploadUrl(file, {
    signal,
  });

  /*
   * 2. Browser uploads the real file
   * directly to Cloudflare R2.
   */
  await uploadSiteMediaToR2(file, upload, {
    onProgress,
    signal,
  });

  /*
   * 3. Backend verifies R2 and creates
   * MediaAsset in PostgreSQL.
   */
  const asset = await finalizeSiteMediaUpload(
    {
      objectKey: upload.objectKey,

      fileName: file.name,

      altText,

      width: dimensions.width,

      height: dimensions.height,
    },

    {
      signal,
    },
  );

  return asset;
}

export { ALLOWED_SITE_MEDIA_TYPES, MAX_SITE_MEDIA_SIZE_BYTES };

export async function fetchSiteMediaAssets(
  { page = 1, limit = 30, search = "" } = {},
  { signal } = {},
) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));

  searchParams.set("limit", String(limit));

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/site/assets?${searchParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      signal,
    },
  );

  return parseApiResponse(response);
}

export async function updateSiteMediaAsset(assetId, input, { signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/admin/site/assets/${encodeURIComponent(assetId)}`,
    {
      method: "PATCH",

      credentials: "include",

      signal,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  const body = await parseApiResponse(response);

  return body.asset;
}

export async function deleteSiteMediaAsset(assetId, { signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/admin/site/assets/${encodeURIComponent(assetId)}`,
    {
      method: "DELETE",

      credentials: "include",

      signal,
    },
  );

  return parseApiResponse(response);
}
