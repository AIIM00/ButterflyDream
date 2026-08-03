import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",

    setupFiles: ["./tests/setup.js"],

    fileParallelism: false,

    sequence: {
      concurrent: false,
    },

    testTimeout: 20000,
    hookTimeout: 20000,

    restoreMocks: true,
    clearMocks: true,
  },
});
