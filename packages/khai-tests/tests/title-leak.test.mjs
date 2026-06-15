import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { parseDoc } from "@chbrain/khai-rules";
// Namespace import: titleLeakAudit does not exist on main until the source lands,
// and a missing *named* import is a load-time crash even for a skipped suite.
// Reached through the namespace, the body only dereferences it when active.
import * as validate from "../src/validate.mjs";

// Dormant until the reviewer-assist source lands on main: probe the source for the
// function under test (mirrors the convention in casting.test.mjs). Until then
// these skip and the suite stays green.
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const DORMANT = !readFileSync(join(srcDir, "validate.mjs"), "utf8").includes(
  "export function titleLeakAudit",
);

// A `place` instance carrying a title/declared pair; the H1 echoes the declared
// source name, exactly as a non-english element does.
const doc = (title, declared) =>
  parseDoc(
    `---\nkhai: place\ntitle: "${title}"\ndeclared: "${declared}"\n---\n\n# Place: ${declared}\n\n## Taxonomy\n\nx\n`,
  );

const kinds = (findings) => findings.map((f) => f.level);
const isMarker = (findings) => findings.some((f) => /may carry \w+ text/.test(f.message));
const isEq = (findings) => findings.some((f) => /title equals declared/.test(f.message));

describe.skipIf(DORMANT)(
  "titleLeakAudit: reviewer-assist for source-language leak in `title`",
  () => {
    it("flags only at audit level, never errors or warnings", () => {
      const findings = validate.titleLeakAudit(doc("The Wald", "Wald mit der Birke"), "german");
      expect(findings.length).toBeGreaterThan(0);
      expect(kinds(findings)).toEqual(findings.map(() => "audit"));
    });

    describe("marker bucket: a Title-cased German slug leaked into the label", () => {
      for (const [title, declared] of [
        ["The Wald", "Wald mit der Birke"],
        ["The Becher", "goldener Becher"],
        ["Goldei", "Goldei"],
        ["Tonne Im Meer", "Die Tonne im Meer"],
        ["Lied Von Herz Und Leber", "Das Lied von Herz und Leber"],
        ["Eierhandel", "der Goldeierhandel"],
      ]) {
        it(`flags "${title}" as a marker`, () => {
          expect(isMarker(validate.titleLeakAudit(doc(title, declared), "german"))).toBe(true);
        });
      }
    });

    describe("clean: a correct English label is not a marker", () => {
      // These are the naive-scan traps: an English word that resembles a German one,
      // or a German proper name correctly kept inside an English label.
      for (const [title, declared] of [
        ["The Forest", "Wald mit der Birke"],
        ["The One Willing to Die", "Sterbewilliger"],
        ["The Den", "der Bau"],
        ["Field Marshal Dörfling", "Feldmarschall Dörfling"],
      ]) {
        it(`does not marker-flag "${title}"`, () => {
          expect(isMarker(validate.titleLeakAudit(doc(title, declared), "german"))).toBe(false);
        });
      }
    });

    describe("title===declared bucket: proper nouns surfaced gently, not as markers", () => {
      for (const [title, declared] of [
        ["Rapunzel", "Rapunzel"],
        ["Wenzel von Tronka", "Wenzel von Tronka"],
        ["Georg Büchner", "Georg Büchner"],
      ]) {
        it(`flags "${title}" as title===declared, not a marker`, () => {
          const findings = validate.titleLeakAudit(doc(title, declared), "german");
          expect(isEq(findings)).toBe(true);
          expect(isMarker(findings)).toBe(false);
        });
      }

      it("does not fire when title differs from a non-leaking declared", () => {
        // "The Forest" != "Wald mit der Birke" and carries no marker: clean.
        expect(validate.titleLeakAudit(doc("The Forest", "Wald mit der Birke"), "german")).toEqual(
          [],
        );
      });
    });

    describe("english source: nothing to leak", () => {
      it("is silent for english resolved language", () => {
        expect(validate.titleLeakAudit(doc("Rapunzel", "Rapunzel"), "english")).toEqual([]);
      });
      it("is silent when no language resolves", () => {
        expect(validate.titleLeakAudit(doc("Rapunzel", "Rapunzel"), undefined)).toEqual([]);
      });
    });

    it("is silent on a missing or empty title (that is checkTitle's job)", () => {
      const noTitle = parseDoc(`---\nkhai: place\n---\n\n# Place: X\n\n## Taxonomy\n\nx\n`);
      expect(validate.titleLeakAudit(noTitle, "german")).toEqual([]);
    });
  },
);
