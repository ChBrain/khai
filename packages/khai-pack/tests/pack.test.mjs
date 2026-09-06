import { describe, it, expect } from "vitest";
import { packBundle, sha256 } from "../lib/pack.mjs";
import { zipStore } from "../lib/zip.mjs";

describe("packBundle — cultures layout", () => {
  const r = packBundle({
    name: "demo",
    overhead: [
      { path: "README.md", data: "# demo\n" },
      { path: "LICENSE", data: "MIT\n" },
    ],
    content: { dir: "engine", files: [{ path: "position_x.md", data: "x\n" }] },
    stamp: { kind: "test" },
  });

  it("places overhead at the root and content in the subfolder, all under <name>/", () => {
    const names = r.files.map((f) => f.name).sort();
    expect(names).toEqual(["demo/LICENSE", "demo/README.md", "demo/engine/position_x.md"]);
  });

  it("records the layout and provenance in the manifest", () => {
    expect(r.manifest.layout).toBe("cultures");
    expect(r.manifest.root).toEqual(["README.md", "LICENSE"]);
    expect(r.manifest.content).toEqual({ dir: "engine", files: ["position_x.md"] });
    expect(r.manifest.kind).toBe("test");
    expect(r.manifest.zipSha256).toBe(r.zipSha256);
  });

  it("zipSha256 is the sha256 of the raw zip bytes", () => {
    expect(r.zipSha256).toBe(sha256(r.zip));
  });

  it("is deterministic — same inputs, same zip hash", () => {
    const again = packBundle({
      name: "demo",
      overhead: [
        { path: "README.md", data: "# demo\n" },
        { path: "LICENSE", data: "MIT\n" },
      ],
      content: { dir: "engine", files: [{ path: "position_x.md", data: "x\n" }] },
      stamp: { kind: "test" },
    });
    expect(again.zipSha256).toBe(r.zipSha256);
  });
});

describe("packBundle — several content subfolders (a skill's references/ and scripts/)", () => {
  const spec = {
    name: "skill",
    overhead: [{ path: "SKILL.md", data: "# skill\n" }],
    content: [
      { dir: "references", files: [{ path: "template_x.md", data: "x\n" }] },
      { dir: "scripts", files: [{ path: "check_x.mjs", data: "export {};\n" }] },
    ],
  };
  const r = packBundle(spec);

  it("places each subfolder's files flat under its own dir", () => {
    const names = r.files.map((f) => f.name).sort();
    expect(names).toEqual([
      "skill/SKILL.md",
      "skill/references/template_x.md",
      "skill/scripts/check_x.mjs",
    ]);
  });

  it("records the list in the manifest, in the order given", () => {
    expect(r.manifest.content).toEqual([
      { dir: "references", files: ["template_x.md"] },
      { dir: "scripts", files: ["check_x.mjs"] },
    ]);
  });

  it("is deterministic across the two shapes: one subfolder as an object or as a one-item list packs the same zip", () => {
    const one = { dir: "references", files: [{ path: "t.md", data: "t\n" }] };
    const a = packBundle({ name: "s", overhead: spec.overhead, content: one });
    const b = packBundle({ name: "s", overhead: spec.overhead, content: [one] });
    expect(b.zipSha256).toBe(a.zipSha256);
    expect(a.manifest.content).toEqual({ dir: "references", files: ["t.md"] });
    expect(b.manifest.content).toEqual([{ dir: "references", files: ["t.md"] }]);
  });

  it("rejects two entries for the same dir", () => {
    expect(() =>
      packBundle({
        name: "s",
        overhead: spec.overhead,
        content: [
          { dir: "references", files: [{ path: "a.md", data: "a" }] },
          { dir: "references", files: [{ path: "b.md", data: "b" }] },
        ],
      }),
    ).toThrow(/distinct/);
  });

  it("requires dir on every entry of the list", () => {
    expect(() =>
      packBundle({
        name: "s",
        overhead: spec.overhead,
        content: [{ dir: "references", files: [] }, { files: [] }],
      }),
    ).toThrow(/content\.dir is required/);
  });
});

describe("packBundle — guard is injected (kind-agnostic)", () => {
  const failing = (files) => ({
    errors: files.some((f) => f.name.endsWith("/BAD.md")) ? ["found BAD.md"] : [],
  });

  it("ok when the guard returns no errors", () => {
    const r = packBundle({
      name: "x",
      overhead: [{ path: "README.md", data: "ok" }],
      guard: failing,
    });
    expect(r.ok).toBe(true);
  });

  it("not ok when the guard reports an error", () => {
    const r = packBundle({ name: "x", overhead: [{ path: "BAD.md", data: "no" }], guard: failing });
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("found BAD.md");
  });
});

describe("packBundle — invariants", () => {
  it("rejects a name that is not a single path segment", () => {
    expect(() => packBundle({ name: "a/b", overhead: [{ path: "x", data: "y" }] })).toThrow(
      /single path segment/,
    );
  });
  it("rejects an empty bundle", () => {
    expect(() => packBundle({ name: "x" })).toThrow(/at least one file/);
  });
  it("rejects duplicate paths", () => {
    expect(() =>
      packBundle({
        name: "x",
        overhead: [
          { path: "a", data: "1" },
          { path: "a", data: "2" },
        ],
      }),
    ).toThrow(/duplicate path/);
  });
  it("requires content.dir when content is given", () => {
    expect(() =>
      packBundle({ name: "x", content: { dir: "", files: [{ path: "a", data: "1" }] } }),
    ).toThrow(/content\.dir/);
  });
});

describe("zipStore", () => {
  it("emits a valid local-file-header signature and is deterministic", () => {
    const a = zipStore([{ name: "a.txt", data: Buffer.from("hello") }]);
    const b = zipStore([{ name: "a.txt", data: Buffer.from("hello") }]);
    expect(a.equals(b)).toBe(true);
    expect(a.readUInt32LE(0)).toBe(0x04034b50);
  });
});
