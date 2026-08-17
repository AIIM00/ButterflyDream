const DEFAULT_MAX_LOAD_ATTEMPTS = 2;

function clampFrameIndex(frameIndex, totalFrames) {
  if (totalFrames <= 0) {
    return 0;
  }

  return Math.min(
    totalFrames - 1,
    Math.max(0, Math.round(Number(frameIndex) || 0)),
  );
}

function getAbortError() {
  return new DOMException("The frame request was cancelled.", "AbortError");
}

function loadHtmlImageFromBlob(blob, signal) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.decoding = "async";

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener("abort", handleAbort);
      URL.revokeObjectURL(objectUrl);
    };

    const handleAbort = () => {
      image.src = "";
      cleanup();
      reject(getAbortError());
    };

    image.onload = async () => {
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch {
        // A loaded image remains drawable when decode() is unavailable/fails.
      }

      cleanup();

      resolve({
        drawable: image,
        release() {
          image.src = "";
        },
      });
    };

    image.onerror = () => {
      cleanup();
      reject(new Error("The animation frame could not be decoded."));
    };

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    signal?.addEventListener("abort", handleAbort, {
      once: true,
    });

    image.src = objectUrl;
  });
}

export async function loadFrameResource(
  src,
  signal,
  _frameIndex,
  { resizeWidth, resizeHeight } = {},
) {
  const response = await fetch(src, {
    cache: "force-cache",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Animation frame request failed with ${response.status}.`);
  }

  const blob = await response.blob();

  if (typeof createImageBitmap === "function") {
    const shouldResize =
      Number.isInteger(resizeWidth) &&
      resizeWidth > 0 &&
      Number.isInteger(resizeHeight) &&
      resizeHeight > 0;

    try {
      const bitmap = shouldResize
        ? await createImageBitmap(blob, {
            resizeWidth,
            resizeHeight,
            resizeQuality: "high",
          })
        : await createImageBitmap(blob);

      return {
        drawable: bitmap,
        release() {
          bitmap.close();
        },
      };
    } catch (error) {
      if (signal?.aborted || error?.name === "AbortError") {
        throw error;
      }

      // Older browsers can expose createImageBitmap without resize support.
      // The HTML image fallback still preserves the transparent WebP frame.
    }
  }

  return loadHtmlImageFromBlob(blob, signal);
}

function createFrameWindow({
  center,
  direction,
  totalFrames,
  aheadFrames,
  behindFrames,
}) {
  const indexes = [];
  const seenIndexes = new Set();
  const forwardDirection = direction < 0 ? -1 : 1;

  const addIndex = (frameIndex) => {
    if (
      frameIndex < 0 ||
      frameIndex >= totalFrames ||
      seenIndexes.has(frameIndex)
    ) {
      return;
    }

    seenIndexes.add(frameIndex);
    indexes.push(frameIndex);
  };

  addIndex(center);

  for (let offset = 1; offset <= aheadFrames; offset += 1) {
    addIndex(center + forwardDirection * offset);
  }

  for (let offset = 1; offset <= behindFrames; offset += 1) {
    addIndex(center - forwardDirection * offset);
  }

  return indexes;
}

function normalizeFrameResource(resource) {
  const drawable = resource?.drawable ?? resource;

  if (!drawable) {
    throw new Error("The animation frame loader returned no drawable image.");
  }

  return {
    drawable,
    release:
      typeof resource?.release === "function"
        ? resource.release
        : () => drawable.close?.(),
  };
}

export class FrameSequenceLoader {
  constructor({
    framePaths,
    aheadFrames = 8,
    behindFrames = 3,
    concurrentLoads = 3,
    maxCachedFrames = 12,
    maxLoadAttempts = DEFAULT_MAX_LOAD_ATTEMPTS,
    resizeWidth,
    resizeHeight,
    loadFrame = loadFrameResource,
    onChange,
  }) {
    this.framePaths = Array.isArray(framePaths) ? framePaths : [];
    this.aheadFrames = Math.max(0, Math.floor(aheadFrames));
    this.behindFrames = Math.max(0, Math.floor(behindFrames));
    this.concurrentLoads = Math.max(1, Math.floor(concurrentLoads));
    this.maxCachedFrames = Math.max(1, Math.floor(maxCachedFrames));
    this.maxLoadAttempts = Math.max(1, Math.floor(maxLoadAttempts));
    this.resizeWidth = resizeWidth;
    this.resizeHeight = resizeHeight;
    this.loadFrame = loadFrame;
    this.onChange = onChange;

    this.cache = new Map();
    this.inFlight = new Map();
    this.queue = [];
    this.queuedIndexes = new Set();
    this.loadAttempts = new Map();
    this.loadedIndexes = new Set();
    this.failedIndexes = new Set();

    this.desiredFrameIndex = 0;
    this.direction = 1;
    this.accessCounter = 0;
    this.revision = 0;
    this.disposed = false;
  }

  get totalFrames() {
    return this.framePaths.length;
  }

  getSnapshot() {
    return {
      revision: this.revision,
      loadedCount: this.loadedIndexes.size,
      failedCount: this.failedIndexes.size,
      cacheSize: this.cache.size,
      pendingCount: this.inFlight.size + this.queue.length,
      isReady: this.cache.size > 0,
    };
  }

  start(initialFrameIndex = 0) {
    this.requestFrame(initialFrameIndex);
  }

  requestFrame(frameIndex) {
    if (this.disposed || this.totalFrames === 0) {
      return;
    }

    const safeFrameIndex = clampFrameIndex(frameIndex, this.totalFrames);

    if (safeFrameIndex !== this.desiredFrameIndex) {
      this.direction = safeFrameIndex < this.desiredFrameIndex ? -1 : 1;
      this.desiredFrameIndex = safeFrameIndex;
    }

    const desiredWindow = createFrameWindow({
      center: safeFrameIndex,
      direction: this.direction,
      totalFrames: this.totalFrames,
      aheadFrames: this.aheadFrames,
      behindFrames: this.behindFrames,
    });

    const desiredIndexes = new Set(desiredWindow);
    const abortDistance = Math.max(
      4,
      (this.aheadFrames + this.behindFrames) * 2,
    );

    for (const [pendingIndex, pendingRequest] of this.inFlight) {
      if (
        !desiredIndexes.has(pendingIndex) &&
        Math.abs(pendingIndex - safeFrameIndex) > abortDistance
      ) {
        pendingRequest.controller.abort();
      }
    }

    this.queue = [];
    this.queuedIndexes.clear();

    for (const desiredIndex of desiredWindow) {
      this.enqueue(desiredIndex);
    }

    this.touch(safeFrameIndex);
    this.pumpQueue();
  }

  getFrame(frameIndex) {
    if (this.cache.size === 0 || this.totalFrames === 0) {
      return null;
    }

    const safeFrameIndex = clampFrameIndex(frameIndex, this.totalFrames);
    const exactFrame = this.cache.get(safeFrameIndex);

    if (exactFrame) {
      this.touch(safeFrameIndex);
      return exactFrame.drawable;
    }

    let nearestEntry = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const [cachedIndex, cachedFrame] of this.cache) {
      const distance = Math.abs(cachedIndex - safeFrameIndex);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEntry = {
          index: cachedIndex,
          frame: cachedFrame,
        };
      }
    }

    if (!nearestEntry) {
      return null;
    }

    this.touch(nearestEntry.index);
    return nearestEntry.frame.drawable;
  }

  enqueue(frameIndex) {
    if (
      this.cache.has(frameIndex) ||
      this.inFlight.has(frameIndex) ||
      this.queuedIndexes.has(frameIndex) ||
      (this.loadAttempts.get(frameIndex) ?? 0) >= this.maxLoadAttempts
    ) {
      return;
    }

    this.queue.push(frameIndex);
    this.queuedIndexes.add(frameIndex);
  }

  pumpQueue() {
    if (this.disposed) {
      return;
    }

    while (
      this.inFlight.size < this.concurrentLoads &&
      this.queue.length > 0
    ) {
      const frameIndex = this.queue.shift();

      this.queuedIndexes.delete(frameIndex);

      if (this.cache.has(frameIndex) || this.inFlight.has(frameIndex)) {
        continue;
      }

      this.beginLoad(frameIndex);
    }
  }

  beginLoad(frameIndex) {
    const controller = new AbortController();
    const attempts = (this.loadAttempts.get(frameIndex) ?? 0) + 1;
    let shouldRetry = false;
    let shouldNotify = false;

    this.loadAttempts.set(frameIndex, attempts);
    this.inFlight.set(frameIndex, {
      controller,
    });

    Promise.resolve()
      .then(() =>
        this.loadFrame(
          this.framePaths[frameIndex],
          controller.signal,
          frameIndex,
          {
            resizeWidth: this.resizeWidth,
            resizeHeight: this.resizeHeight,
          },
        ),
      )
      .then((resource) => {
        if (this.disposed || controller.signal.aborted) {
          resource?.release?.();
          return;
        }

        this.cache.set(frameIndex, {
          ...normalizeFrameResource(resource),
          lastAccess: ++this.accessCounter,
        });

        this.loadedIndexes.add(frameIndex);
        this.failedIndexes.delete(frameIndex);
        this.loadAttempts.delete(frameIndex);
        this.evictDistantFrames();
        shouldNotify = true;
      })
      .catch((error) => {
        if (
          this.disposed ||
          controller.signal.aborted ||
          error?.name === "AbortError"
        ) {
          return;
        }

        if (attempts < this.maxLoadAttempts) {
          shouldRetry = true;
        } else {
          this.failedIndexes.add(frameIndex);
          shouldNotify = true;
        }
      })
      .finally(() => {
        this.inFlight.delete(frameIndex);

        if (controller.signal.aborted) {
          this.loadAttempts.delete(frameIndex);
        }

        if (
          !this.disposed &&
          !controller.signal.aborted &&
          shouldRetry &&
          !this.cache.has(frameIndex)
        ) {
          this.enqueue(frameIndex);
        }

        this.pumpQueue();

        if (shouldNotify) {
          this.notify();
        }
      });
  }

  touch(frameIndex) {
    const cachedFrame = this.cache.get(frameIndex);

    if (cachedFrame) {
      cachedFrame.lastAccess = ++this.accessCounter;
    }
  }

  evictDistantFrames() {
    while (this.cache.size > this.maxCachedFrames) {
      let evictionCandidate = null;

      for (const [frameIndex, cachedFrame] of this.cache) {
        if (frameIndex === this.desiredFrameIndex) {
          continue;
        }

        const candidate = {
          frameIndex,
          cachedFrame,
          distance: Math.abs(frameIndex - this.desiredFrameIndex),
        };

        if (
          !evictionCandidate ||
          candidate.distance > evictionCandidate.distance ||
          (candidate.distance === evictionCandidate.distance &&
            candidate.cachedFrame.lastAccess <
              evictionCandidate.cachedFrame.lastAccess)
        ) {
          evictionCandidate = candidate;
        }
      }

      if (!evictionCandidate) {
        return;
      }

      evictionCandidate.cachedFrame.release();
      this.cache.delete(evictionCandidate.frameIndex);
    }
  }

  notify() {
    this.revision += 1;
    this.onChange?.(this.getSnapshot());
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.queue = [];
    this.queuedIndexes.clear();

    for (const pendingRequest of this.inFlight.values()) {
      pendingRequest.controller.abort();
    }

    this.inFlight.clear();

    for (const cachedFrame of this.cache.values()) {
      cachedFrame.release();
    }

    this.cache.clear();
  }
}
