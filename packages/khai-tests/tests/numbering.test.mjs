import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { validatePlayhouseRegistry } from "../src/validate.mjs";

// Dormant until the numbering-invariant source lands on main: probe the source
// for the assertion under test. validatePlayhouseRegistry already exists on
// main, so a named import is safe; only the new invariant is gated.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "validate.mjs"), "utf8").includes(
  "must equal the play count",
);

describe.skipIf(DORMANT)("numbering invariant: version minor tracks the play count", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-numbering-${process.pid}-${Math.random().toString(36).slice(2)}`);
    // A two-play house: ids a, b, with matching playbook titles so the registry
    // passes every other check and only the version is under test.
    for (const id of ["a", "b"]) {
      mkdirSync(join(dir, "plays", id), { recursive: true });
      writeFileSync(
        join(dir, "plays", id, `play_${id}.md`),
        `---\nkhai: play\ntitle: "${id.toUpperCase()}"\n---\n# Play: ${id.toUpperCase()}\n`,
      );
    }
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const writeRegistry = (version) =>
    writeFileSync(
      join(dir, "registry.json"),
      JSON.stringify({
        name: "house",
        version,
        plays: [
          { id: "a", title: "A", description: "A first valid sentence here." },
          { id: "b", title: "B", description: "A second valid sentence here." },
        ],
      }),
    );

  const errorsOf = () => validatePlayhouseRegistry(dir).flatMap((r) => r.errors);

  it("passes when the minor equals the play count (0.2.0 / 2 plays)", () => {
    writeRegistry("0.2.0");
    expect(errorsOf()).toEqual([]);
  });

  it("flags a minor that does not equal the play count", () => {
    writeRegistry("0.5.0");
    expect(errorsOf().some((e) => /minor \(5\) must equal the play count \(2\)/.test(e))).toBe(
      true,
    );
  });

  it("flags a non-zero major (it would reset the minor and break the invariant)", () => {
    writeRegistry("1.2.0");
    expect(errorsOf().some((e) => /has major 1/.test(e))).toBe(true);
  });

  it("flags a version that is not semver", () => {
    writeRegistry("not-semver");
    expect(errorsOf().some((e) => /is not semver/.test(e))).toBe(true);
  });
});
