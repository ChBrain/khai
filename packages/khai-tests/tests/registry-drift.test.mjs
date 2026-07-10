import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildRegistry, validatePlayhouseRegistry } from "../index.mjs";

// The registry build-drift gate: the committed registry.json must equal what the
// build produces from source, so a hand-edited or stale registry is caught at the
// content PR rather than surfacing only when the release `version` script rebuilds.
describe("conformance: registry build-drift gate", () => {
  let dir;

  const anchor = (title) =>
    [
      "---",
      "khai: play",
      `title: "${title}"`,
      `description: "A valid one-sentence blurb for ${title}."`,
      "license: CC-BY-NC-SA-4.0",
      "stamp:",
      "  owner: KAI HACKS AI",
      "  version: v0.0.1",
      '  date: "2026-07-10"',
      "---",
      "",
      `# Play: ${title}`,
    ].join("\n");

  const addPlay = (id, title) => {
    mkdirSync(join(dir, "plays", id), { recursive: true });
    writeFileSync(join(dir, "plays", id, `play_${id}.md`), anchor(title));
  };

  const driftErrors = () =>
    validatePlayhouseRegistry(dir)
      .flatMap((r) => r.errors)
      .filter((e) => /registry\.json is out of date/.test(e));

  beforeEach(() => {
    dir = join(tmpdir(), `khai-drift-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(dir, "plays"), { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "@chbrain/khai-plays-demo", version: "0.1.0" }),
    );
    addPlay("aa_play", "Play AA");
    addPlay("bb_play", "Play BB");
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("passes when registry.json is a fresh build", () => {
    buildRegistry(dir);
    expect(driftErrors()).toEqual([]);
  });

  it("flags a description hand-edited away from the play frontmatter", () => {
    buildRegistry(dir);
    const p = join(dir, "registry.json");
    const reg = JSON.parse(readFileSync(p, "utf8"));
    reg.plays[0].description = "A different, hand-edited blurb that source never wrote.";
    writeFileSync(p, JSON.stringify(reg, null, 2) + "\n");
    expect(driftErrors().length).toBe(1);
  });

  it("flags entries reordered away from the build's sort", () => {
    buildRegistry(dir);
    const p = join(dir, "registry.json");
    const reg = JSON.parse(readFileSync(p, "utf8"));
    reg.plays.reverse();
    writeFileSync(p, JSON.stringify(reg, null, 2) + "\n");
    expect(driftErrors().length).toBe(1);
  });

  it("flags a stale entry when a play was added but the registry not rebuilt", () => {
    buildRegistry(dir);
    addPlay("cc_play", "Play CC"); // new play on disk, registry not rebuilt
    expect(driftErrors().length).toBe(1);
  });
});
