import { describe, it, expect } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProject } from "@chbrain/khai-tests";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

// The chain's management is protected by the same kit a house uses: every
// instance under management/ conforms to the canon, and the orphan-position gate
// holds (a needed position without a persona is a failure). Same call, same wall
// as the house's house.test.mjs and any consumer's validate.
describe("chain management is protected", () => {
  it("the management cast conforms; every position has a persona", () => {
    const results = validateProject({ root: pkgRoot, contentDir: join(pkgRoot, "management") });
    const errors = results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));
    expect(errors).toEqual([]);
  });
});
