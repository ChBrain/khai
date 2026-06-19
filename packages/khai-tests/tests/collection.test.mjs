import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
// Namespace imports: the collection helpers and validateCollectionRegistry do
// not exist on main until the source lands, and a missing named import is a
// load-time crash even for a skipped suite. (src/collection.mjs does not exist
// on main either, so it is never imported here.)
import * as registry from "../src/registry.mjs";
import * as validate from "../src/validate.mjs";

// Dormant until the collection source lands on main: probe validate.mjs for the
// generalized validator's name.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "validate.mjs"), "utf8").includes(
  "validateCollectionRegistry",
);

// A house fixture: a package.json carrying the given khai.collection (omit to
// leave it unset), plus one valid item under the collection dir with an anchor
// file whose frontmatter title and description make the registry verify.
function house(dir, { collection, dirName, anchor, id = "first" } = {}) {
  const khai = collection === undefined ? {} : { collection };
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "@chbrain/house", version: "0.0.0", khai }, null, 2),
  );
  mkdirSync(join(dir, dirName, id), { recursive: true });
  writeFileSync(
    join(dir, dirName, id, `${anchor}${id}.md`),
    `---\nkhai: place\ntitle: "First"\ndescription: "A single valid sentence about the first item."\n---\n# Place: First\n`,
  );
}

describe.skipIf(DORMANT)("collection: the registry is parameterized off package.json", () => {
  describe("resolveCollection", () => {
    it("defaults to plays when khai.collection is unset", () => {
      expect(registry.resolveCollection({})).toEqual({
        dir: "plays",
        key: "plays",
        anchor: "play_",
      });
      expect(registry.resolveCollection(undefined)).toEqual({
        dir: "plays",
        key: "plays",
        anchor: "play_",
      });
    });

    it("expands a string shorthand (dir == key, anchor singularized)", () => {
      expect(registry.resolveCollection({ khai: { collection: "cultures" } })).toEqual({
        dir: "cultures",
        key: "cultures",
        anchor: "culture_",
      });
    });

    it("takes an object and fills missing fields from the others", () => {
      expect(registry.resolveCollection({ khai: { collection: { dir: "cultures" } } })).toEqual({
        dir: "cultures",
        key: "cultures",
        anchor: "culture_",
      });
      expect(
        registry.resolveCollection({
          khai: { collection: { dir: "people", key: "folk", anchor: "person_" } },
        }),
      ).toEqual({ dir: "people", key: "folk", anchor: "person_" });
    });
  });

  describe("a non-plays house (cultures)", () => {
    let dir;
    beforeEach(() => {
      dir = join(tmpdir(), `khai-collection-${process.pid}-${Math.random().toString(36).slice(2)}`);
      mkdirSync(dir, { recursive: true });
    });
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    it("counts, builds, and verifies the cultures collection", () => {
      house(dir, { collection: "cultures", dirName: "cultures", anchor: "culture_" });
      expect(registry.countItems(dir)).toBe(1);

      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      expect(Array.isArray(reg.cultures)).toBe(true);
      expect(reg.cultures.map((c) => c.id)).toEqual(["first"]);
      expect(reg.plays).toBeUndefined();
      // the minor IS the item count, computed not chosen
      expect(reg.version).toBe("0.1.0");
      expect(registry.verifyRegistry(dir).ok).toBe(true);
    });

    it("builds an empty-but-wired house green at 0.0.0", () => {
      writeFileSync(
        join(dir, "package.json"),
        JSON.stringify({
          name: "@chbrain/khai-cultures",
          version: "0.0.0",
          khai: { collection: "cultures" },
        }),
      );
      mkdirSync(join(dir, "cultures"), { recursive: true });
      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      expect(reg.cultures).toEqual([]);
      expect(reg.version).toBe("0.0.0");
      expect(registry.verifyRegistry(dir).ok).toBe(true);
    });

    it("flags a minor that does not equal the item count", () => {
      house(dir, { collection: "cultures", dirName: "cultures", anchor: "culture_" });
      registry.buildRegistry(dir); // writes a correct 0.1.0
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      reg.version = "0.5.0";
      writeFileSync(join(dir, "registry.json"), JSON.stringify(reg));
      const errs = validate.validateCollectionRegistry(dir).flatMap((r) => r.errors);
      expect(errs.some((e) => /minor \(5\) must equal the culture count \(1\)/.test(e))).toBe(true);
    });

    it("flags a subdirectory with no registry entry", () => {
      house(dir, { collection: "cultures", dirName: "cultures", anchor: "culture_" });
      registry.buildRegistry(dir);
      // a second culture on disk that the registry does not know about
      mkdirSync(join(dir, "cultures", "second"), { recursive: true });
      writeFileSync(
        join(dir, "cultures", "second", "culture_second.md"),
        `---\nkhai: place\ntitle: "Second"\n---\n# Place: Second\n`,
      );
      const errs = validate.validateCollectionRegistry(dir).flatMap((r) => r.errors);
      expect(
        errs.some((e) => /culture subdirectory "second" has no corresponding entry/.test(e)),
      ).toBe(true);
    });
  });

  describe("back-compat: a plays house is untouched", () => {
    let dir;
    beforeEach(() => {
      dir = join(
        tmpdir(),
        `khai-collection-bc-${process.pid}-${Math.random().toString(36).slice(2)}`,
      );
      mkdirSync(dir, { recursive: true });
    });
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    it("defaults to plays, keeps the alias, and still builds a plays registry", () => {
      house(dir, { collection: undefined, dirName: "plays", anchor: "play_" });
      expect(registry.countPlays(dir)).toBe(1);

      registry.buildRegistry(dir);
      const reg = JSON.parse(readFileSync(join(dir, "registry.json"), "utf8"));
      expect(Array.isArray(reg.plays)).toBe(true);
      expect(reg.version).toBe("0.1.0");

      // the historical export name still resolves to the same result
      expect(validate.validatePlayhouseRegistry(dir)).toEqual(
        validate.validateCollectionRegistry(dir),
      );
    });
  });
});
