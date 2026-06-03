import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkEncoding } from "@chbrain/khai-rules";
import { loadArchitectureSpecs, loadFixtures } from "./helpers/load-spec.js";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..");

// The encoding mechanism lives in khai-rules. The canon pulls it to prove its
// own spec files (and fixtures) are clean, instead of reimplementing the checks
// here. This is a dev/test pull: khai-arch's runtime dependency stays
// gray-matter only.

describe("encoding: architecture/*.md", () => {
  const files = loadArchitectureSpecs(repoRoot);

  it.skipIf(files.length === 0)(
    "loads at least one file (skipped until khai-2 lands spec files)",
    () => {
      expect(files.length).toBeGreaterThan(0);
    },
  );

  for (const file of files) {
    it(`${file.path} passes encoding checks`, () => {
      expect(checkEncoding(file.text), file.path).toEqual([]);
    });
  }
});

describe("encoding: valid fixtures", () => {
  const files = loadFixtures(repoRoot, "valid");

  it("loads at least one valid fixture", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.path} passes encoding checks`, () => {
      expect(checkEncoding(file.text), file.path).toEqual([]);
    });
  }
});

describe("encoding: invalid fixtures - bad-encoding-* must fail", () => {
  const files = loadFixtures(repoRoot, "invalid").filter((f) => f.path.includes("bad-encoding-"));

  it("loads at least one bad-encoding fixture", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.path} is detected as encoding-bad`, () => {
      expect(checkEncoding(file.text).length, file.path).toBeGreaterThan(0);
    });
  }
});
