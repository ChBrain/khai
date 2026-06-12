import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace import: the derive helpers do not exist on main until the source
// lands, and a missing named import is a load-time crash even for a skipped
// suite.
import * as registry from "../src/registry.mjs";

// Dormant until the derive source lands on main.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "registry.mjs"), "utf8").includes(
  "export function deriveVersionFrom",
);

describe.skipIf(DORMANT)("derive: the minor version is the play count", () => {
  it("sets the minor to the count, preserving the major", () => {
    expect(registry.deriveVersionFrom("0.76.0", 76)).toBe("0.76.0");
    expect(registry.deriveVersionFrom("1.2.0", 2)).toBe("1.2.0"); // major preserved; guard flags it
  });

  it("heals a drifted minor down to the count", () => {
    expect(registry.deriveVersionFrom("0.77.0", 76)).toBe("0.76.0");
  });

  it("preserves the patch when the count leaves the minor unchanged", () => {
    expect(registry.deriveVersionFrom("0.76.5", 76)).toBe("0.76.5");
  });

  it("resets the patch to 0 when the count moves the minor", () => {
    expect(registry.deriveVersionFrom("0.76.5", 77)).toBe("0.77.0");
  });

  it("falls back to 0.{count}.0 for a non-semver version", () => {
    expect(registry.deriveVersionFrom("not-semver", 3)).toBe("0.3.0");
    expect(registry.deriveVersionFrom(undefined, 0)).toBe("0.0.0");
  });

  describe("buildRegistry reconciles both files", () => {
    let dir;
    beforeEach(() => {
      dir = join(tmpdir(), `khai-derive-${process.pid}-${Math.random().toString(36).slice(2)}`);
      // Two plays, each with a valid Arc blurb so the registry verifies.
      for (const id of ["a", "b"]) {
        mkdirSync(join(dir, "plays", id), { recursive: true });
        writeFileSync(
          join(dir, "plays", id, `play_${id}.md`),
          `---\nkhai: play\ntitle: "${id.toUpperCase()}"\n---\n# ${id}\n\n## Arc\n\nA single valid sentence here.\n`,
        );
      }
    });
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    it("heals a drifted package.json and registry.json to 0.{count}.0", () => {
      writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "h", version: "0.77.3" }));
      registry.buildRegistry(dir);
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      expect(pkg.version).toBe("0.2.0");
      expect(reg.version).toBe("0.2.0");
      // and the built registry passes the numbering guard
      expect(registry.verifyRegistry(dir).ok).toBe(true);
    });

    it("leaves a correct version untouched", () => {
      writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "h", version: "0.2.4" }));
      registry.buildRegistry(dir);
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      expect(pkg.version).toBe("0.2.4"); // minor already equals the count; patch kept
    });
  });
});
