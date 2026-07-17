// checkLinks resolves every relative link, not only ones already ending in
// `.md`. A link that drops the extension (`[x](pitch_kri)` for a sibling
// `pitch_kri.md`) is the miss the old ".md-only" check waved through. Dormant
// until the source fix lands on main -- probe the source for the marker the fix
// introduces, per the parse.test.mjs / cli.test.mjs convention.

import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { checkLinks } from "../index.mjs";

const LINKS_DORMANT = !readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "rules.mjs"),
  "utf8",
).includes("missing .md extension");

describe.skipIf(LINKS_DORMANT)("checkLinks resolves relative targets", () => {
  const dir = mkdtempSync(join(tmpdir(), "khai-links-"));
  writeFileSync(join(dir, "pitch_kri.md"), "# x\n");

  it("passes a link whose target file exists as written", () => {
    expect(checkLinks("see [x](pitch_kri.md)", dir)).toEqual([]);
  });

  it("flags a link that drops the .md extension its sibling file carries", () => {
    const e = checkLinks("see [x](pitch_kri)", dir);
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("missing .md extension");
    expect(e[0]).toContain("pitch_kri");
  });

  it("flags a relative target that resolves to nothing, extension or not", () => {
    expect(checkLinks("see [x](pitch_nope)", dir)).toEqual(["broken link: pitch_nope"]);
    expect(checkLinks("see [x](persona_ghost.md)", dir)).toEqual(["broken link: persona_ghost.md"]);
  });

  it("exempts external URI schemes and pure #anchors", () => {
    expect(checkLinks("[a](https://example.com) [b](mailto:x@y.z) [c](#stakes)", dir)).toEqual([]);
  });

  it("honours the exempt set (a wiring reference resolved via node_modules)", () => {
    expect(
      checkLinks("[p](position_female.md)", dir, { exempt: new Set(["position_female.md"]) }),
    ).toEqual([]);
  });
});
