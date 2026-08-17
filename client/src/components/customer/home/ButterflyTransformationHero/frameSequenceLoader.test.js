import assert from "node:assert/strict";
import test from "node:test";

import { FrameSequenceLoader } from "./frameSequenceLoader.js";

const createFramePaths = (count) =>
  Array.from({ length: count }, (_, index) => `frame-${index}.webp`);

function waitFor(predicate, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (predicate()) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("Timed out waiting for the frame loader."));
        return;
      }

      setTimeout(check, 5);
    };

    check();
  });
}

function createTestFrameLoader({ delayMs = 5 } = {}) {
  let activeLoads = 0;
  let maximumActiveLoads = 0;
  const requestedIndexes = [];
  const releasedIndexes = [];

  return {
    get activeLoads() {
      return activeLoads;
    },
    get maximumActiveLoads() {
      return maximumActiveLoads;
    },
    requestedIndexes,
    releasedIndexes,
    async loadFrame(_path, signal, frameIndex) {
      requestedIndexes.push(frameIndex);
      activeLoads += 1;
      maximumActiveLoads = Math.max(maximumActiveLoads, activeLoads);

      try {
        await new Promise((resolve, reject) => {
          const timerId = setTimeout(resolve, delayMs);

          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timerId);

              const error = new Error("Request aborted");
              error.name = "AbortError";
              reject(error);
            },
            {
              once: true,
            },
          );
        });
      } finally {
        activeLoads -= 1;
      }

      return {
        drawable: {
          frameIndex,
        },
        release() {
          releasedIndexes.push(frameIndex);
        },
      };
    },
  };
}

test("loads only the requested neighborhood with bounded concurrency", async () => {
  const testLoader = createTestFrameLoader();
  const loader = new FrameSequenceLoader({
    framePaths: createFramePaths(241),
    aheadFrames: 8,
    behindFrames: 3,
    concurrentLoads: 3,
    maxCachedFrames: 12,
    loadFrame: testLoader.loadFrame,
  });

  loader.start(100);

  await waitFor(() => loader.getSnapshot().pendingCount === 0);

  assert.equal(testLoader.requestedIndexes.length, 12);
  assert.ok(testLoader.maximumActiveLoads <= 3);
  assert.equal(loader.getSnapshot().cacheSize, 12);
  assert.equal(loader.getFrame(100).frameIndex, 100);

  loader.dispose();

  assert.equal(testLoader.releasedIndexes.length, 12);
});

test("reprioritizes a distant scroll target and aborts stale work", async () => {
  const testLoader = createTestFrameLoader({
    delayMs: 40,
  });
  const loader = new FrameSequenceLoader({
    framePaths: createFramePaths(241),
    aheadFrames: 2,
    behindFrames: 1,
    concurrentLoads: 1,
    maxCachedFrames: 4,
    loadFrame: testLoader.loadFrame,
  });

  loader.start(0);
  await waitFor(() => testLoader.activeLoads === 1);

  loader.requestFrame(200);

  await waitFor(() => testLoader.requestedIndexes.includes(200));

  assert.deepEqual(testLoader.requestedIndexes.slice(0, 2), [0, 200]);

  loader.dispose();
});

test("evicts distant decoded frames and keeps the current frame", async () => {
  const testLoader = createTestFrameLoader();
  const loader = new FrameSequenceLoader({
    framePaths: createFramePaths(30),
    aheadFrames: 5,
    behindFrames: 2,
    concurrentLoads: 3,
    maxCachedFrames: 4,
    loadFrame: testLoader.loadFrame,
  });

  loader.start(10);

  await waitFor(() => loader.getSnapshot().pendingCount === 0);

  assert.equal(loader.getSnapshot().cacheSize, 4);
  assert.equal(loader.getFrame(10).frameIndex, 10);
  assert.equal(testLoader.releasedIndexes.length, 4);

  loader.dispose();
});
