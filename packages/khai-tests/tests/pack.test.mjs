import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { packEngine, renderCard } from "../src/pack.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const genderDir = join(here, "..", "..", "engines", "gender");

describe("packEngine — gender (the engine kind)", async () => {
  const r = await packEngine(genderDir);

  it("packages a conforming engine", () => {
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.name).toBe("gender");
  });

  it("uses the cultures layout: overhead at root, members flat under engine/", () => {
    const names = r.files.map((f) => f.name).sort();
    expect(names).toEqual([
      "gender/CARD.md",
      "gender/LICENSE",
      "gender/README.md",
      "gender/REFERENCES.md",
      "gender/engine/position_female.md",
      "gender/engine/position_gender.md",
      "gender/engine/position_male.md",
    ]);
  });

  it("ships content, not toolchain (no package.json, index.mjs, or tests)", () => {
    const names = r.files.map((f) => f.name);
    expect(names.some((n) => /package\.json|index\.mjs|tests\//.test(n))).toBe(false);
  });

  it("stamps the kind + engine + canon in the manifest, and zipSha matches", () => {
    expect(r.manifest.kind).toBe("engine");
    expect(r.manifest.engine).toBe("gender");
    expect(r.manifest.canon).toMatch(/@chbrain\/khai-arch@/);
    expect(r.manifest.zipSha256).toBe(r.zipSha256);
  });

  it("is deterministic", async () => {
    const again = await packEngine(genderDir);
    expect(again.zipSha256).toBe(r.zipSha256);
  });
});

describe("packEngine — guards", () => {
  it("throws on a directory that is not a khai engine", async () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-pack-"));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x" }));
    await expect(packEngine(dir)).rejects.toThrow(/not a khai engine/);
  });

  it("does not pack (ok:false) when the engine fails conformance", async () => {
    // A khai engine manifest pointing at member files that do not exist: the
    // validator reports errors, so packEngine refuses to ship it.
    const dir = mkdtempSync(join(tmpdir(), "khai-pack-"));
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "@x/khai-engine-broken",
        license: "MIT",
        khai: { engine: "broken", type: "position", anchor: "position_broken.md", card: {} },
      }),
    );
    const r = await packEngine(dir);
    expect(r.ok).toBe(false);
    expect(r.zip).toBeNull();
    expect(r.errors.length).toBeGreaterThan(0);
  });
});

describe("renderCard", () => {
  it("renders the WIRES chapters as markdown headings", () => {
    const md = renderCard({
      id: "demo",
      type: "position",
      anchor: "position_demo.md",
      chapters: ["Wire", "Issue"],
      sections: { Wire: "w", Issue: "i" },
    });
    expect(md).toMatch(/# demo — WIRES/);
    expect(md).toMatch(/## Wire\n\nw/);
    expect(md).toMatch(/## Issue\n\ni/);
  });
});
