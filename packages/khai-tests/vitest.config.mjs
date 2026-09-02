import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Vitest's default reporter captures a test's console output and prints it
    // only when that test FAILS. This package's walls warn from tests that pass
    // on purpose -- science-overlap-wall.test.mjs reports a stale BASELINE entry
    // as a warning precisely because failing would demand a change the fixing
    // branch is not allowed to carry (the fix rides an engine lane; the file is
    // governance). Captured and dropped, that warning has never reached anyone:
    // CI runs `vitest run` with the default reporter, so the one place the
    // signal was meant to be read is the one place it was silent, and the
    // BASELINE lists have only ever grown.
    //
    // Passing the console straight through costs nothing here -- the only other
    // console calls in this package's tests are stubs that replace console.warn
    // to assert on it, and those are unaffected.
    disableConsoleIntercept: true,
    include: ["tests/**/*.test.mjs"],
  },
});
