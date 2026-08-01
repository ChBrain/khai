import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace import: buildRegistry's members catalog does not exist on main
// until the source lands, and a missing named import is a load-time crash even
// for a skipped suite.
import * as registry from "../src/registry.mjs";

// Dormant until the members-catalog source lands on main: probe registry.mjs
// for the field itself.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "registry.mjs"), "utf8").includes("buildMembers");

describe.skipIf(DORMANT)("registry members: derivation, kind filtering, and sort order", () => {
  let dir;

  beforeEach(() => {
    dir = join(tmpdir(), `khai-members-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "cultures", "wonderland"), { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "@chbrain/khai-cultures-demo",
        version: "0.0.0",
        // A culture is a full khai play staged as a culture, anchored by
        // play_*.md (mirroring the real khai-cultures house), not culture_*.md.
        khai: { collection: { dir: "cultures", key: "cultures", anchor: "play_" } },
      }),
    );

    const itemDir = join(dir, "cultures", "wonderland");

    // The anchor (play): no Taxonomy section (ENACTS has none), so its member
    // entry carries no taxonomy field.
    writeFileSync(
      join(itemDir, "play_wonderland.md"),
      `---\nkhai: play\ntitle: "Wonderland"\ndescription: "A single valid sentence about wonderland."\n---\n# Play: Wonderland\n\n## Arc\n\nA rabbit hole.\n`,
    );

    // A persona: title + type + a Taxonomy section whose first link is its
    // position -- the common case the contract's example shows.
    writeFileSync(
      join(itemDir, "persona_inger.md"),
      `---\nkhai: persona\ntitle: "Inger"\ntype: archetype\n---\n# Persona: Inger\n\n## Taxonomy\n\n[Janteloven](position_janteloven.md)\n`,
    );

    // A position: title present, no type (not a persona field), and a
    // Taxonomy section with no link at all -- tolerated as an absent field.
    writeFileSync(
      join(itemDir, "position_janteloven.md"),
      `---\nkhai: position\ntitle: "Janteloven"\n---\n# Position: Janteloven\n\n## Taxonomy\n\nParent group: positions\n`,
    );

    // A pitch: no frontmatter title at all (tolerate missing), Taxonomy links
    // to the play.
    writeFileSync(
      join(itemDir, "pitch_en.md"),
      `---\nkhai: pitch\n---\n# Pitch: en\n\n## Taxonomy\n\nSee [the play](play_wonderland.md).\n`,
    );

    // Non-member files: skipped regardless of extension or prefix.
    writeFileSync(join(itemDir, "README.md"), "# Wonderland\n");
    writeFileSync(join(itemDir, "REFERENCES.md"), "---\nkhai: instructions\n---\n# References\n");
    writeFileSync(join(itemDir, "geo.json"), JSON.stringify({ iso: "GB" }));
    // A markdown file whose prefix is not a play-canon kind: also skipped.
    writeFileSync(join(itemDir, "notes_misc.md"), "---\ntitle: Misc\n---\n# Misc\n");
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("derives file, kind, title, type, and taxonomy for a full member", () => {
    registry.buildRegistry(dir);
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    const wonderland = reg.cultures.find((c) => c.id === "wonderland");
    const inger = wonderland.members.find((m) => m.file === "persona_inger.md");
    expect(inger).toEqual({
      file: "persona_inger.md",
      kind: "persona",
      title: "Inger",
      type: "archetype",
      taxonomy: "position_janteloven.md",
    });
  });

  it("skips non-member files: README, REFERENCES, geo.json, and an unrecognized prefix", () => {
    registry.buildRegistry(dir);
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    const wonderland = reg.cultures.find((c) => c.id === "wonderland");
    const files = wonderland.members.map((m) => m.file);
    expect(files).not.toContain("README.md");
    expect(files).not.toContain("REFERENCES.md");
    expect(files).not.toContain("geo.json");
    expect(files).not.toContain("notes_misc.md");
    // Only the four play-canon files remain.
    expect(files.sort()).toEqual([
      "persona_inger.md",
      "pitch_en.md",
      "play_wonderland.md",
      "position_janteloven.md",
    ]);
  });

  it("tolerates missing frontmatter: no title, no type, and a linkless Taxonomy section", () => {
    registry.buildRegistry(dir);
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    const wonderland = reg.cultures.find((c) => c.id === "wonderland");

    const pitch = wonderland.members.find((m) => m.file === "pitch_en.md");
    expect(pitch.title).toBeUndefined();
    expect(pitch.type).toBeUndefined();
    expect(pitch.taxonomy).toBe("play_wonderland.md");

    const position = wonderland.members.find((m) => m.file === "position_janteloven.md");
    expect(position.type).toBeUndefined();
    expect(position.taxonomy).toBeUndefined(); // Taxonomy section has no link

    const play = wonderland.members.find((m) => m.file === "play_wonderland.md");
    expect(play.taxonomy).toBeUndefined(); // no Taxonomy section at all (ENACTS)
  });

  it("sorts members by file, deterministically", () => {
    registry.buildRegistry(dir);
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    const wonderland = reg.cultures.find((c) => c.id === "wonderland");
    const files = wonderland.members.map((m) => m.file);
    expect(files).toEqual([...files].sort((a, b) => a.localeCompare(b)));
  });

  it("leaves the existing registry entry fields unchanged in shape and value", () => {
    registry.buildRegistry(dir);
    const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
    const wonderland = reg.cultures.find((c) => c.id === "wonderland");
    expect(wonderland.kind).toBe("culture");
    expect(wonderland.id).toBe("wonderland");
    expect(wonderland.title).toBe("Wonderland");
    expect(wonderland.description).toBe("A single valid sentence about wonderland.");
    expect(wonderland.iso).toBe("GB");
    // members is additive -- present alongside, not instead of, the above.
    expect(Array.isArray(wonderland.members)).toBe(true);
    expect(registry.verifyRegistry(dir).ok).toBe(true);
  });
});
