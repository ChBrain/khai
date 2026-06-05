import { defineConfig } from "vitest/config";

// Only this package's own tests. The blueprint carries a house test template
// (a .tmpl), which must never run here; exclude the blueprint outright.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.mjs"],
    exclude: ["blueprint/**", "node_modules/**"],
  },
});
