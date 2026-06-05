// The repo's own examples must conform to the canon. The downstream-starter is
// what consumers copy, so a non-conforming example teaches the wrong shape (this
// gate is why the legacy `## Title`, title-less Mara could not survive again).
//
// Structure only: we validate frontmatter, the H1, the title echo, and the H2
// set via validateContentFile without baseDir. Examples link to installed engine
// files (e.g. position_female.md) that are not present in this repo, so link and
// wiring checks belong to the starter's own `khai-tests --project .` job, run in
// a downstream context with the engines installed.

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDoc } from "@chbrain/khai-rules";
import { validateContentFile } from "../index.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const examplesDir = join(repoRoot, "examples");

/** Every `.md` under examples/ that declares a `khai:` type (a content instance). */
function khaiTypedMd(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...khaiTypedMd(p));
    } else if (entry.name.endsWith(".md")) {
      const text = readFileSync(p, "utf8");
      const doc = parseDoc(text);
      if (doc.ok && typeof doc.data?.khai === "string")
        out.push({ path: p, type: doc.data.khai, text });
    }
  }
  return out;
}

const files = existsSync(examplesDir) ? khaiTypedMd(examplesDir) : [];

describe("examples/ conform to the canon", () => {
  it("finds at least one khai-typed example", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const f of files) {
    it(`${relative(repoRoot, f.path)} is a valid ${f.type}`, () => {
      // No baseDir (links resolve against installed engines, not this repo) and
      // no owner pin (a consumer's own files): structure, frontmatter, H1, title.
      expect(validateContentFile(f.text, { type: f.type })).toEqual([]);
    });
  }
});
