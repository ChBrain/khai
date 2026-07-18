import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkLinks, checkWiring } from "../rules.mjs";
import { parseDoc } from "../parse.mjs";

// The hard-reference contract of the composite layer, at the rules layer:
// a package-specifier link (`@scope/name/member.md`) resolves only through the
// resolver the caller supplies (dependency-declared packages), and a bare
// wiring link satisfies a requirement only while its basename is unambiguous
// among installed engines.

describe("checkLinks: package-specifier links", () => {
  let dir;
  const setup = () => {
    dir = join(tmpdir(), `khai-pkglink-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "vendor", "@chbrain", "khai-engine-guilt"), { recursive: true });
    writeFileSync(join(dir, "vendor", "@chbrain", "khai-engine-guilt", "process_guilt.md"), "x");
    return (name) =>
      name === "@chbrain/khai-engine-guilt"
        ? join(dir, "vendor", "@chbrain", "khai-engine-guilt")
        : null;
  };

  it("resolves a declared, installed package link", () => {
    const resolvePackageDir = setup();
    const e = checkLinks("[guilt](@chbrain/khai-engine-guilt/process_guilt.md)", dir, {
      resolvePackageDir,
    });
    expect(e).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails a link into an undeclared package", () => {
    const resolvePackageDir = setup();
    const e = checkLinks("[x](@chbrain/khai-engine-shame/process_shame.md)", dir, {
      resolvePackageDir,
    });
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("not a declared, installed dependency");
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails a link to a file the installed package does not ship", () => {
    const resolvePackageDir = setup();
    const e = checkLinks("[x](@chbrain/khai-engine-guilt/process_nope.md)", dir, {
      resolvePackageDir,
    });
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("does not exist in the installed");
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails closed when no resolver is supplied", () => {
    const e = checkLinks("[x](@chbrain/khai-engine-guilt/process_guilt.md)", "/nonexistent", {});
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("not a declared, installed dependency");
  });

  it("a package link is never waved through by the bare-basename exemption", () => {
    const e = checkLinks("[x](@chbrain/khai-engine-guilt/process_guilt.md)", "/nonexistent", {
      exempt: new Set(["process_guilt.md"]),
    });
    expect(e).toHaveLength(1);
  });
});

const docWith = (section, body) =>
  parseDoc(`---\nkhai: persona\n---\n\n# P: X\n\n## ${section}\n\n${body}\n`);

describe("checkWiring: qualified links and the ambiguity rule", () => {
  const base = {
    section: "Projection",
    targets: new Set(["position_high.md"]),
    engine: "self-esteem",
    package: "@chbrain/khai-engine-self-esteem",
  };

  it("a bare link satisfies while the basename is unambiguous", () => {
    const doc = docWith("Projection", "[high](position_high.md)");
    expect(checkWiring(doc, { ...base, ambiguous: new Set() })).toEqual([]);
  });

  it("a bare link to a shared basename fails with the qualified form named", () => {
    const doc = docWith("Projection", "[high](position_high.md)");
    const e = checkWiring(doc, { ...base, ambiguous: new Set(["position_high.md"]) });
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("more than one installed engine ships that file");
    expect(e[0]).toContain("@chbrain/khai-engine-self-esteem/position_high.md");
  });

  it("a qualified link to this engine satisfies even where the basename is shared", () => {
    const doc = docWith("Projection", "[high](@chbrain/khai-engine-self-esteem/position_high.md)");
    const e = checkWiring(doc, { ...base, ambiguous: new Set(["position_high.md"]) });
    expect(e).toEqual([]);
  });

  it("a link qualified to a DIFFERENT engine never satisfies this one", () => {
    const doc = docWith("Projection", "[high](@chbrain/khai-engine-status/position_high.md)");
    const e = checkWiring(doc, { ...base, ambiguous: new Set(["position_high.md"]) });
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("must link one of");
  });

  it("back-compat: without package/ambiguous the original basename behavior holds", () => {
    const doc = docWith("Projection", "[high](position_high.md)");
    expect(
      checkWiring(doc, {
        section: "Projection",
        targets: new Set(["position_high.md"]),
        engine: "e",
      }),
    ).toEqual([]);
  });
});
