// The Playwright instruction collector: what a repository's OWN dependency tree
// says about wiring the packages it installs.
//
// Dormant until the source lands (tests first, source second). The guard is the
// module's existence rather than a string probe, because the module does not
// exist on a main without it and a static import would fail the whole file at
// load; the import below is therefore dynamic and runs only when the source is
// present.

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, symlinkSync } from "node:fs";

// A directory symlink is not the same object on every OS. On Windows a "dir"
// symlink needs SeCreateSymbolicLinkPrivilege -- an elevated shell or Developer
// Mode -- and Node throws EPERM without it, while a "junction" needs no privilege
// at all and behaves the same for reading a tree. On POSIX there is no junction
// and "dir" is correct.
//
// The type WAS passed here, which is what made this hard to read: a Windows house
// reported it as a missing argument, looked, found one, and reported it as a
// missing junction. It is neither missing nor wrong on the platform it was
// written on. It is a value that only works on one OS, and this file builds a
// node_modules tree in a temp dir, so every test in it died on Windows.
const LINK_TYPE = process.platform === "win32" ? "junction" : "dir";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "src", "instructions.mjs");
const DORMANT = !existsSync(SRC);

let collectInstructions, renderInstructions, publishesContent;
beforeAll(async () => {
  if (DORMANT) return;
  ({ collectInstructions, renderInstructions, publishesContent } = await import(SRC));
});

const GUIDE = (title, human) => `---
khai: instructions
title: "${title}"
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-08-26"
---

# Instructions: ${title}

How a Playwright wires ${title}.

## Human

- ${human}

## Agent

- Link what the play holds; never edit the package.

## Collaboration

- What the neighbouring engine owns stays the neighbouring engine's.

## Knowledge

- The one thing a play gets wrong about ${title} if nobody says it.

## System

- Do not edit the package to fit a scene.
`;

const CONTENT = `---
khai: position
title: "A Position"
license: CC-BY-NC-SA-4.0
---

# Position: A Position
`;

let tmp;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/** A workspace: `root` declaring `deps`, each dep installed under the workspace's
 * hoisted node_modules, exactly as npm lays a monorepo out. */
function workspace(spec) {
  tmp = mkdtempSync(join(tmpdir(), "khai-instructions-"));
  const modules = join(tmp, "node_modules");
  mkdirSync(modules, { recursive: true });
  for (const [name, pkg] of Object.entries(spec)) {
    const dir = name === "." ? join(tmp, "root") : join(tmp, "pkgs", name.replace(/\//g, "-"));
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: name === "." ? "@scope/root" : name,
        version: pkg.version ?? "1.0.0",
        type: "module",
        main: "./index.mjs",
        files: ["index.mjs", "*.md"],
        dependencies: pkg.deps ?? {},
      }),
    );
    if (pkg.guide) writeFileSync(join(dir, "playwright_instructions.md"), pkg.guide);
    if (pkg.content !== false) writeFileSync(join(dir, "position_a.md"), CONTENT);
    writeFileSync(
      join(dir, "index.mjs"),
      pkg.law ? `export const law = ${JSON.stringify(pkg.law)};\n` : "export const x = 1;\n",
    );
    if (name !== ".") symlinkSync(dir, join(modules, name.replace(/\//g, "-")), LINK_TYPE);
  }
  // Scoped names need the scope directory; redo the links properly.
  rmSync(modules, { recursive: true, force: true });
  mkdirSync(modules, { recursive: true });
  for (const name of Object.keys(spec)) {
    if (name === ".") continue;
    const dir = join(tmp, "pkgs", name.replace(/\//g, "-"));
    const target = join(modules, name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(dir, target, LINK_TYPE);
  }
  return join(tmp, "root");
}

describe.skipIf(DORMANT)("collectInstructions: the declared closure", () => {
  it("collects a dependency's guide and marks the root's own", async () => {
    const root = workspace({
      "@scope/engine": { guide: GUIDE("Engine", "The human sets the room.") },
      ".": {
        deps: { "@scope/engine": "^1.0.0" },
        guide: GUIDE("Root", "The human picks a scene."),
      },
    });
    const recs = await collectInstructions(root);
    expect(recs.map((r) => [r.package, r.own])).toEqual([
      ["@scope/engine", false],
      ["@scope/root", true],
    ]);
  });

  it("orders a package after everything it depends on", async () => {
    // Deep before shallow: an engine's primitives are read before the content
    // package that fills them, computed from depth rather than hand-ordered.
    const root = workspace({
      "@scope/deep": { guide: GUIDE("Deep", "Deepest.") },
      "@scope/mid": { deps: { "@scope/deep": "^1.0.0" }, guide: GUIDE("Mid", "Middle.") },
      ".": { deps: { "@scope/mid": "^1.0.0" }, guide: GUIDE("Root", "Top.") },
    });
    const recs = await collectInstructions(root);
    expect(recs.map((r) => r.package)).toEqual(["@scope/deep", "@scope/mid", "@scope/root"]);
  });

  it("collects only what the root DECLARES, not what is installed beside it", async () => {
    // The whole point. A hoisted workspace holds every package's dependencies in
    // one directory; a scan would hand this root a stranger's instructions.
    const root = workspace({
      "@scope/declared": { guide: GUIDE("Declared", "Wanted.") },
      "@scope/stranger": { guide: GUIDE("Stranger", "Never asked for.") },
      ".": { deps: { "@scope/declared": "^1.0.0" }, guide: GUIDE("Root", "Top.") },
    });
    const recs = await collectInstructions(root);
    expect(recs.map((r) => r.package)).not.toContain("@scope/stranger");
  });

  it("skips a package that ships no guide", async () => {
    const root = workspace({
      "@scope/silent": {},
      ".": { deps: { "@scope/silent": "^1.0.0" }, guide: GUIDE("Root", "Top.") },
    });
    expect((await collectInstructions(root)).map((r) => r.package)).toEqual(["@scope/root"]);
  });
});

describe.skipIf(DORMANT)("collectInstructions: the two layers", () => {
  const tree = () => ({
    "@scope/engine": {
      guide: GUIDE("Engine", "The human sets the room."),
      law: "Engine: it runs.",
    },
    ".": { deps: { "@scope/engine": "^1.0.0" }, guide: GUIDE("Root", "The human picks a scene.") },
  });

  it("carries no chapters by default", async () => {
    // Five chapters times a large closure is a context bomb, and a Playwright
    // casts from a few packages.
    const recs = await collectInstructions(workspace(tree()));
    expect(recs.every((r) => r.sections === null)).toBe(true);
  });

  it("carries the chapters of a named package only", async () => {
    const recs = await collectInstructions(workspace(tree()), { only: ["@scope/engine"] });
    const byName = Object.fromEntries(recs.map((r) => [r.package, r]));
    expect(byName["@scope/engine"].sections.Human).toMatch(/sets the room/);
    expect(byName["@scope/root"].sections).toBeNull();
  });

  it("carries every chapter under full", async () => {
    const recs = await collectInstructions(workspace(tree()), { full: true });
    expect(recs.every((r) => r.sections && r.sections.System)).toBe(true);
  });

  it("reads an exported law only when asked", async () => {
    const off = await collectInstructions(workspace(tree()));
    expect(off.every((r) => r.law === null)).toBe(true);
    const on = await collectInstructions(workspace(tree()), { withLaw: true });
    expect(on.find((r) => r.package === "@scope/engine").law).toBe("Engine: it runs.");
  });

  it("distinguishes 'exports no law' from 'could not be read'", async () => {
    // The two are different facts and collapsing them is how a collector reports
    // clean on a broken tree -- the first draft did exactly that and reported no
    // law for every package that had one.
    const root = workspace({
      "@scope/broken": { guide: GUIDE("Broken", "Top.") },
      ".": { deps: { "@scope/broken": "^1.0.0" }, guide: GUIDE("Root", "Top.") },
    });
    writeFileSync(join(tmp, "pkgs", "@scope-broken", "index.mjs"), "this is not javascript(");
    const recs = await collectInstructions(root, { withLaw: true });
    const broken = recs.find((r) => r.package === "@scope/broken");
    expect(broken.law).toBeNull();
    expect(broken.error).toBeTruthy();
    const clean = recs.find((r) => r.package === "@scope/root");
    expect(clean.law).toBeNull();
    expect(clean.error).toBeNull();
  });
});

describe.skipIf(DORMANT)("publishesContent: the rule the guide requirement rests on", () => {
  it("is true for a package shipping khai content at its root", () => {
    const root = workspace({ ".": { guide: GUIDE("Root", "Top.") } });
    expect(publishesContent(root)).toBe(true);
  });

  it("is false when the khai-framed file is not in `files`", () => {
    // Why tooling needs no carve-out: khai-tests and khai-language each carry a
    // `khai:`-framed design record that sits outside `files` and never ships.
    tmp = mkdtempSync(join(tmpdir(), "khai-instructions-"));
    const dir = join(tmp, "tooling");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "@scope/tool", version: "1.0.0", files: ["index.mjs", "src/"] }),
    );
    writeFileSync(join(dir, "DESIGN.md"), CONTENT);
    expect(publishesContent(dir)).toBe(false);
  });
});

describe.skipIf(DORMANT)("renderInstructions", () => {
  it("names a package whose law could not be read rather than passing over it", () => {
    const text = renderInstructions([
      {
        package: "@scope/a",
        version: "1.0.0",
        own: false,
        title: "A",
        law: null,
        error: "boom",
        sections: null,
      },
    ]);
    expect(text).toMatch(/law unreadable: boom/);
  });

  it("says how to ask for chapters when only laws are shown", () => {
    const text = renderInstructions([
      {
        package: "@scope/a",
        version: "1.0.0",
        own: false,
        title: "A",
        law: "L",
        error: null,
        sections: null,
      },
    ]);
    expect(text).toMatch(/--package <name>/);
  });
});
