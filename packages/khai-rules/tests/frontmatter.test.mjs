// checkFrontmatter's base whitelist (khai/license/stamp) plus the per-type
// `extra` allowance — the mechanism behind persona's `type:` key. The canon
// owns which type gets which extra enum; this proves the rule honors it.

import { describe, it, expect } from "vitest";
import { parseDoc, checkFrontmatter } from "../index.mjs";

const TYPE_IDS = ["persona", "process"];
const BASE = `khai: persona
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-01-01"`;
const doc = (body) => parseDoc(`---\n${body}\n---\n\n# Persona: X\n`);

describe("checkFrontmatter: base whitelist", () => {
  it("accepts the base keys", () => {
    expect(checkFrontmatter(doc(BASE), { typeIds: TYPE_IDS })).toEqual([]);
  });

  it("rejects an unknown key when no extra is allowed", () => {
    expect(checkFrontmatter(doc(`${BASE}\ntype: archetype`), { typeIds: TYPE_IDS })).toContain(
      "unknown frontmatter key: type",
    );
  });
});

describe("checkFrontmatter: per-type extra keys", () => {
  const extra = { type: ["real", "archetype", "fictional"] };

  it("allows a declared extra key with a valid enum value", () => {
    expect(checkFrontmatter(doc(`${BASE}\ntype: archetype`), { typeIds: TYPE_IDS, extra })).toEqual(
      [],
    );
  });

  it("rejects an out-of-enum value for an extra key", () => {
    const errs = checkFrontmatter(doc(`${BASE}\ntype: bogus`), { typeIds: TYPE_IDS, extra });
    expect(errs.some((e) => e.includes('frontmatter "type" must be one of'))).toBe(true);
  });

  it("treats the extra key as optional (absent is fine)", () => {
    expect(checkFrontmatter(doc(BASE), { typeIds: TYPE_IDS, extra })).toEqual([]);
  });

  it("still rejects a genuinely unknown key while extras are allowed", () => {
    expect(checkFrontmatter(doc(`${BASE}\nbogus: x`), { typeIds: TYPE_IDS, extra })).toContain(
      "unknown frontmatter key: bogus",
    );
  });
});
