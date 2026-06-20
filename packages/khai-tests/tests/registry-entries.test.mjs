import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
// Namespace imports: resolveCollections / collectionKind and the richer registry
// behaviour do not exist on main until the engine source lands, and a missing
// named import is a load-time crash even for a skipped suite.
import * as registry from "../src/registry.mjs";
import * as validate from "../src/validate.mjs";

// Dormant until the discriminated-entries source lands on main: probe
// registry.mjs for the multi-collection resolver it re-exports.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "registry.mjs"), "utf8").includes("resolveCollections");

// Write a culture's subdir: an anchor with verifiable title/description, plus an
// optional geo.json carrying an iso.
function culture(dir, id, { title, iso } = {}) {
  mkdirSync(join(dir, "cultures", id), { recursive: true });
  writeFileSync(
    join(dir, "cultures", id, `culture_${id}.md`),
    `---\nkhai: place\ntitle: "${title || id}"\ndescription: "A single valid sentence about ${id}."\n---\n# Place: ${title || id}\n`,
  );
  if (iso !== undefined) {
    writeFileSync(join(dir, "cultures", id, "geo.json"), JSON.stringify({ iso }));
  }
}

// Write a group's subdir: an anchor that casts members by linking their culture
// anchors, the same links checkLinks gates — so references are derived, not authored.
function group(dir, id, { title, members = [] } = {}) {
  mkdirSync(join(dir, "groups", id), { recursive: true });
  const casts = members.map((m) => `- [${m}](../../cultures/${m}/culture_${m}.md)`).join("\n");
  writeFileSync(
    join(dir, "groups", id, `group_${id}.md`),
    `---\nkhai: place\ntitle: "${title || id}"\ndescription: "A single valid sentence about ${id}."\n---\n# Group: ${title || id}\n\n## Company\n\n${casts}\n`,
  );
}

function house(dir, { collections } = {}) {
  const khai = { collection: "cultures" };
  if (collections) khai.collections = collections;
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "@chbrain/khai-cultures", version: "0.0.0", khai }, null, 2),
  );
}

describe.skipIf(DORMANT)("registry entries: kind, geo iso, and referencing collections", () => {
  describe("resolveCollections / collectionKind", () => {
    it("returns the primary first, with kind singularized from the key", () => {
      const cols = registry.resolveCollections({ khai: { collection: "cultures" } });
      expect(cols).toHaveLength(1);
      expect(cols[0]).toMatchObject({ dir: "cultures", key: "cultures", kind: "culture" });
    });

    it("appends referencing collections, defaulting references to the primary key", () => {
      const cols = registry.resolveCollections({
        khai: { collection: "cultures", collections: [{ dir: "groups" }] },
      });
      expect(cols).toHaveLength(2);
      expect(cols[1]).toMatchObject({
        dir: "groups",
        key: "groups",
        anchor: "group_",
        kind: "group",
        references: "cultures",
      });
    });

    it("takes an explicit kind and references override", () => {
      const cols = registry.resolveCollections({
        khai: {
          collection: "cultures",
          collections: [{ dir: "clusters", kind: "bloc", references: "cultures" }],
        },
      });
      expect(cols[1]).toMatchObject({ kind: "bloc", references: "cultures" });
    });
  });

  describe("buildRegistry + verifyRegistry over a cultures+groups house", () => {
    let dir;
    beforeEach(() => {
      dir = join(
        join(process.env.TMPDIR || "/tmp"),
        `khai-entries-${process.pid}-${Math.random().toString(36).slice(2)}`,
      );
      mkdirSync(dir, { recursive: true });
      house(dir, { collections: [{ dir: "groups", references: "cultures" }] });
      culture(dir, "bavaria", { title: "Bavaria", iso: "DE-BY" });
      culture(dir, "saxony", { title: "Saxony", iso: "DE-SN" });
      culture(dir, "esperanto", { title: "Esperanto" }); // non-mappable: no geo.json
      group(dir, "dach", { title: "DACH", members: ["bavaria", "saxony"] });
    });
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    it("stamps kind on every entry and merges geo iso for cultures that place", () => {
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      const byId = Object.fromEntries(reg.cultures.map((c) => [c.id, c]));
      expect(byId.bavaria).toMatchObject({ kind: "culture", iso: "DE-BY" });
      expect(byId.saxony).toMatchObject({ kind: "culture", iso: "DE-SN" });
      // Esperanto lists but does not place: no iso field at all.
      expect(byId.esperanto.kind).toBe("culture");
      expect(byId.esperanto.iso).toBeUndefined();
    });

    it("emits a groups array whose references are derived from the casts", () => {
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      expect(reg.groups).toHaveLength(1);
      expect(reg.groups[0]).toMatchObject({ id: "dach", kind: "group" });
      expect(reg.groups[0].references).toEqual(["bavaria", "saxony"]);
    });

    it("counts the primary collection only: groups never move the minor", () => {
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      // three cultures -> 0.3.0, regardless of the one group
      expect(reg.version).toBe("0.3.0");
      expect(registry.verifyRegistry(dir).ok).toBe(true);
    });

    it("flags a kind that does not match its collection", () => {
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      reg.cultures.find((c) => c.id === "bavaria").kind = "group";
      writeFileSync(join(dir, "registry.json"), JSON.stringify(reg));
      const errs = validate.validateCollectionRegistry(dir).flatMap((r) => r.errors);
      expect(errs.some((e) => /bavaria" must declare kind "culture"/.test(e))).toBe(true);
    });

    it("flags a reference to a culture that does not exist", () => {
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      reg.groups[0].references = ["bavaria", "atlantis"];
      writeFileSync(join(dir, "registry.json"), JSON.stringify(reg));
      const errs = validate.validateCollectionRegistry(dir).flatMap((r) => r.errors);
      expect(
        errs.some((e) => /references "atlantis", which is not a cultures member/.test(e)),
      ).toBe(true);
    });

    it("flags an iso that is present but not a non-empty string", () => {
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      reg.cultures.find((c) => c.id === "bavaria").iso = "";
      writeFileSync(join(dir, "registry.json"), JSON.stringify(reg));
      const errs = validate.validateCollectionRegistry(dir).flatMap((r) => r.errors);
      expect(
        errs.some((e) => /bavaria" iso, when present, must be a non-empty string/.test(e)),
      ).toBe(true);
    });
  });
});
