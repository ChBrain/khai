import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadArchitectureSpecs, loadFixtures, type LoadedFile } from "./helpers/load-spec.js";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..");

const BOM = "﻿";
const EM_DASH = "—";
const REPLACEMENT = "�";

function assertEncodingOk(file: LoadedFile): void {
  // No BOM
  expect(
    file.bytes[0] === 0xef && file.bytes[1] === 0xbb && file.bytes[2] === 0xbf,
    `${file.path}: must not start with UTF-8 BOM`,
  ).toBe(false);

  // No U+FFFD replacement character
  expect(file.text, `${file.path}: must not contain U+FFFD replacement character`).not.toContain(
    REPLACEMENT,
  );

  // No em-dash
  expect(
    file.text,
    `${file.path}: must not contain em-dash (U+2014); use ' - ' instead`,
  ).not.toContain(EM_DASH);

  // No carriage returns
  expect(file.text, `${file.path}: must not contain CR (\\r); use LF line endings`).not.toContain(
    "\r",
  );

  // Verify round-trip: bytes decode to the same string (valid UTF-8)
  const decoded = Buffer.from(file.text, "utf-8").toString("utf-8");
  expect(decoded, `${file.path}: must be valid UTF-8`).toBe(file.text);
}

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
      assertEncodingOk(file);
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
      assertEncodingOk(file);
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
      const hasBom = file.bytes[0] === 0xef && file.bytes[1] === 0xbb && file.bytes[2] === 0xbf;
      const hasEmDash = file.text.includes(EM_DASH);
      const hasReplacement = file.text.includes(REPLACEMENT);
      const hasCr = file.text.includes("\r");

      const isBad = hasBom || hasEmDash || hasReplacement || hasCr;
      expect(isBad, `${file.path}: expected at least one encoding violation`).toBe(true);
    });
  }
});
