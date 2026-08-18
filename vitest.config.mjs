// Root test runner for the whole monorepo, as one vitest process.
//
// The suite used to run as `npm test --workspaces --if-present`: one `vitest run`
// per workspace, ~306 of them, in sequence. The tests themselves were never the
// cost -- a content package spends ~30ms running its assertions and ~2.4s starting
// a runtime, resolving a module graph, and transforming files it shares with every
// other package. Multiplied by 306 that is almost all of the wall clock.
//
// So the split is by *what a project needs*, not by package:
//
//   content   -- the 295 engines and composites. Every one of them runs the same
//                shape of test (validateEnginePackage + manifest + compose), over
//                the same two imports (@chbrain/khai-tests, @chbrain/khai-arch).
//                One project, one module graph, files spread across workers.
//   packages/khai-*
//             -- the tooling packages, each picked up with its own vitest config
//                where it has one. These genuinely differ from each other, so they
//                stay separate projects rather than being folded into content.
//
// Measured on this repo at 295 content packages: 320s -> 55s for the full suite,
// and 2.4s -> 1.0s for a single package during a build.
//
// Per-package scripts are untouched: `npm test -w @chbrain/khai-engine-<name>` and
// `npx vitest run` inside a package directory both still work. From the root, a
// single package is `npx vitest run packages/composites/<name>` and one project is
// `npx vitest run --project content`.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "content",
          include: ["packages/{engines,composites}/*/tests/**/*.test.mjs"],
        },
      },
      "packages/khai-*",
    ],
  },
});
