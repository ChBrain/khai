// A shipped member file may not still be the template it was stamped from.
//
// khai-arch ships a complete, valid skeleton per type, and `templates.test.mjs`
// proves each one valid on purpose: that is what makes it a safe place to start.
// It is also what makes an UNEDITED one shippable. A scaffold nobody wrote passes
// every structural wall in the kit, because every wall asks whether the chapters
// are right and they are -- the canon wrote them.
//
// Reported from khai-cultures, which found the same thing from the other side:
// their review lane returned zero findings on a fresh scaffold. They proposed
// shipping the templates with a TODO marker. This is a wall instead, for two
// reasons: a marker can be deleted without writing anything, and it would change
// what `templates.<type>.text` is, which is the artifact an author stamps and the
// kit proves.
//
// It is exact-match, not similarity. The failure being caught is "nobody wrote
// this chapter", and verbatim canon prose is a precise signature of it. An author
// who reworded every chapter has engaged with every chapter, which is the point;
// this is not a proxy for quality and must not grow into one.
//
// Measured before it landed: 0 hits across 2543 member files, so it is a ratchet
// with no migration behind it.

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { templates } from "@chbrain/khai-arch";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** H2 chapter bodies, keyed by chapter name, trimmed. */
function chapters(text) {
  const out = {};
  for (const part of text.split(/^## /m).slice(1)) {
    const nl = part.indexOf("\n");
    out[part.slice(0, nl).trim()] = part.slice(nl).trim();
  }
  return out;
}

const canon = Object.fromEntries(
  Object.entries(templates).map(([type, t]) => [type, chapters(t.text)]),
);

/** Every member file a package declares, with the khai type it validates as. */
function members() {
  const out = [];
  for (const kind of ["engines", "composites"]) {
    const base = join(repoRoot, "packages", kind);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const dir = join(base, name.name);
      const manifestPath = join(dir, "package.json");
      if (!existsSync(manifestPath)) continue;
      const khai = JSON.parse(readFileSync(manifestPath, "utf8")).khai;
      if (!khai?.engine) continue;
      const declared = Array.isArray(khai.members)
        ? khai.members.map((m) => [m.file, m.type])
        : [
            [khai.anchor, khai.type],
            ...Object.values(khai.expressions ?? {}).map((f) => [f, khai.type]),
          ];
      for (const [file, type] of declared)
        if (file && existsSync(join(dir, file)))
          out.push({ where: `${kind}/${name.name}/${file}`, path: join(dir, file), type });
    }
  }
  return out;
}

const files = members();

describe("no shipped member is still its template", () => {
  // Green on an empty collection is the failure this whole file guards against,
  // so both the corpus and the canon are asserted before either is used.
  it("finds the member files and the canon's templates", () => {
    expect(files.length).toBeGreaterThan(1000);
    expect(Object.keys(canon).length).toBeGreaterThan(5);
  });

  it("carries no chapter left verbatim from the canon's skeleton", () => {
    const unedited = [];
    for (const { where, path, type } of files) {
      const template = canon[type];
      if (!template) continue;
      for (const [name, body] of Object.entries(chapters(readFileSync(path, "utf8"))))
        if (template[name] !== undefined && template[name] === body)
          unedited.push(`${where}#${name}`);
    }
    expect(
      unedited,
      "this chapter is the canon's guidance, word for word: it is instruction to " +
        "the author, never content to ship",
    ).toEqual([]);
  });
});
