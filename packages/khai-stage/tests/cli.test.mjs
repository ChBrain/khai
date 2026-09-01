// The generator's argument parsing, which is the one place it can do damage
// before it has understood what it was asked.
//
// Three bugs shipped here and every one of them reported success: `--help` was
// unhandled and so became the source name, raising a 54-file house called
// `khai-plays---help` in the working directory; `--anchor` was in the usage line
// and in the file's own header and was never in the flag map, so it fell through
// to the positionals and the house landed in a directory literally named
// `--anchor` with the Theatre Manager called `process_`; and any unknown flag did
// the same, so a typo stamped a house into a folder named after the typo.
//
// The property under test is therefore not "the right message prints". It is
// THAT NOTHING IS WRITTEN when the arguments are wrong, because a generator that
// builds before it validates cannot be undone by an exit code.

import { describe, it, expect, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const binPath = fileURLToPath(new URL("../bin/khai-stage.mjs", import.meta.url));

// NOT dormant, deliberately. The house idiom skips a test file while the source
// it covers is still unmerged, and #1470 has landed, so there is no window to
// wait out. It is also a hazard worth naming here: the first draft of this file
// keyed dormancy on the bin containing the string "--help", and reverting the
// fix left that string behind in the comment explaining it. The file would have
// gone quiet instead of red -- a test suite green on nothing, in the tests
// written to close exactly that. A sentinel a comment can satisfy is not a
// sentinel.

let dirs = [];
afterEach(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
  dirs = [];
});

function run(args) {
  const cwd = mkdtempSync(join(tmpdir(), "khai-stage-cli-"));
  dirs.push(cwd);
  const r = spawnSync(process.execPath, [binPath, ...args], { cwd, encoding: "utf8" });
  return {
    status: r.status ?? 1,
    out: `${r.stdout ?? ""}${r.stderr ?? ""}`,
    // What the invocation left on disk. Zero is the assertion that matters on
    // every error path.
    written: readdirSync(cwd),
    cwd,
  };
}

describe("khai-stage: arguments are understood before anything is built", () => {
  it("prints usage for --help and -h, and builds nothing", () => {
    for (const flag of ["--help", "-h"]) {
      const r = run([flag]);
      expect(r.status, flag).toBe(0);
      expect(r.out, flag).toContain("usage: khai-stage");
      expect(r.written, `${flag} wrote something`).toEqual([]);
    }
  });

  it("prints usage and builds nothing when no source is given", () => {
    const r = run([]);
    expect(r.status).toBe(1);
    expect(r.out).toContain("usage: khai-stage");
    expect(r.written).toEqual([]);
  });

  it("refuses an unknown option by name instead of treating it as a path", () => {
    const r = run(["buechner", "--verbose"]);
    expect(r.status).toBe(1);
    expect(r.out).toContain("unknown option");
    expect(r.out, "the option must be named, not just rejected").toContain("--verbose");
    // The old parser made it the target directory, so the house landed in a
    // folder named after the typo.
    expect(r.written).toEqual([]);
  });

  it("rejects a --kind outside the declared set, and builds nothing", () => {
    const r = run(["buechner", "--kind", "nonsense"]);
    expect(r.status).toBe(1);
    expect(r.written).toEqual([]);
  });

  it("carries --anchor into the stamped manifest rather than into the positionals", () => {
    const r = run([
      "cultures",
      "--kind",
      "canon",
      "--collection",
      "cultures",
      "--anchor",
      "culture_",
    ]);
    expect(r.status).toBe(0);
    // The bug: --anchor and its value became targetDir and manager, so the house
    // was written to a directory of that name.
    expect(r.written, "a flag must never become a directory").not.toContain("--anchor");
    expect(r.written).toContain("khai-cultures");
    const pkg = JSON.parse(readFileSync(join(r.cwd, "khai-cultures", "package.json"), "utf8"));
    expect(pkg.khai.collection.anchor).toBe("culture_");
  });

  it("defaults the anchor when the flag is absent, so the wiring is the flag's", () => {
    const r = run(["cultures", "--kind", "canon", "--collection", "cultures"]);
    const pkg = JSON.parse(readFileSync(join(r.cwd, "khai-cultures", "package.json"), "utf8"));
    expect(pkg.khai.collection.anchor).toBe("play_");
  });

  it("still raises a house when the arguments are right", () => {
    const r = run(["buechner"]);
    expect(r.status).toBe(0);
    expect(r.out).toContain("raised khai-plays-buechner");
    expect(existsSync(join(r.cwd, "khai-plays-buechner", "AGENTS.md"))).toBe(true);
  });
});
