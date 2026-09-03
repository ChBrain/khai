// The grapevine composite tests only what is composite-specific: canon
// conformance through the shared kit (which resolves the hard package links
// through the declared dependencies), the manifest contract, compose(), and that
// the atoms arrive with the package.
//
// Rule 3's second PR, landing late: the composite shipped in #1170 with no tests
// of its own. untested-packages.test.mjs baselines it; the BASELINE row is pruned
// in a governance sweep, since this lane cannot reach that file.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateEnginePackage } from "@chbrain/khai-tests";
import { manifest, compose, chains, atoms } from "../index.mjs";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatten = (results) => results.flatMap((r) => r.errors.map((e) => `${r.file}: ${e}`));

describe("grapevine: conforms to the canon", () => {
  it("the whole package validates (content + manifest + compose + hard links)", async () => {
    const results = await validateEnginePackage(pkgDir, { executeCompose: true });
    expect(flatten(results)).toEqual([]);
  });
});

describe("grapevine: manifest", () => {
  it("declares the composite and its root", () => {
    expect(manifest.engine).toBe("grapevine");
    expect(manifest.type).toBe("process");
    expect(manifest.members).toHaveLength(4);
    const root = manifest.members.find((m) => m.parent === null);
    expect(root.file).toBe("process_grapevine.md");
  });

  // Three seams, each a handoff neither atom can stage alone: channel (one
  // network carries both cargoes), blame (rumor's account converts into
  // gossip's verdict), credence (gossip's ledger gates what rumor sticks to).
  // The composite adds no third engine -- it is exactly these three handoffs, so
  // a seam quietly dropped or merged would leave a count of three intact and the
  // claim gone. The set is asserted, not the count.
  it("carries the three seams, every one of them a process", () => {
    const seams = manifest.members.filter((m) => m.parent === "process_grapevine.md");
    expect(seams.map((m) => m.file).sort()).toEqual([
      "process_blame.md",
      "process_channel.md",
      "process_credence.md",
    ]);
    for (const m of seams) expect(m.type).toBe("process");
  });

  // The audit rides plot/Tension, not persona/Projection: a grapevine is
  // something a scene does, not a trait a persona carries.
  it("declares the law (fail) and the plot link (audit)", () => {
    expect(manifest.requires).toContainEqual({
      on: "instructions",
      section: "Knowledge",
      link: "anchor",
      level: "fail",
    });
    expect(manifest.requires).toContainEqual({
      on: "plot",
      section: "Tension",
      link: "expression",
      level: "audit",
    });
  });
});

describe("grapevine: the atoms arrive with the package", () => {
  it("re-exports the two dependency engines", () => {
    expect(Object.keys(atoms).sort()).toEqual(["gossip", "rumor"]);
    for (const atom of Object.values(atoms)) {
      expect(typeof atom.compose).toBe("function");
      expect(atom.manifest.engine).toBeTruthy();
    }
  });

  // The dependency graph is the citation graph: every atom re-exported here is
  // declared, so a hard link into it resolves for a consumer too.
  it("re-exports exactly what package.json declares", () => {
    const deps = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")).dependencies;
    const engines = Object.keys(deps)
      .filter((d) => d.startsWith("@chbrain/khai-engine-"))
      .map((d) => d.replace("@chbrain/khai-engine-", ""))
      .sort();
    expect(Object.keys(atoms).sort()).toEqual(engines);
  });
});

describe("grapevine: compose()", () => {
  for (const leaf of Object.keys(chains)) {
    it(`composes ${leaf}: root first`, () => {
      const out = compose({ leaf });
      expect(out.trimStart().split("\n")[0]).toBe("# Process: Grapevine");
    });
  }
  it("rejects an unknown leaf", () => {
    expect(() => compose({ leaf: "process_nope.md" })).toThrow();
  });
  it("rejects a missing leaf", () => {
    expect(() => compose({})).toThrow();
  });
});
